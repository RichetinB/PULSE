import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createHash, randomBytes } from 'node:crypto'
import type { Request, Response } from 'express'
import { $Enums } from '../generated/prisma/client'
import { PrismaService } from '../database/prisma.service'

const STATE_COOKIE = 'pulse_oauth_state'
const SESSION_COOKIE = 'pulse_session'
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000

interface OsuProfile {
  id: number
  username: string
  avatar_url: string | null
}

interface OsuTokenResponse {
  access_token: string
}

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async startOsuLogin(
    request: Request,
    response: Response,
  ): Promise<void> {
    if (await this.findSession(request)) {
      response.redirect(this.config.getOrThrow<string>('FRONTEND_URL'))
      return
    }

    const state = randomBytes(32).toString('base64url')
    response.setHeader(
      'Set-Cookie',
      this.serializeCookie(STATE_COOKIE, state, {
        httpOnly: true,
        maxAge: 10 * 60,
        sameSite: 'Lax',
      }),
    )

    const params = new URLSearchParams({
      client_id: this.config.getOrThrow<string>('OSU_CLIENT_ID'),
      redirect_uri: this.config.getOrThrow<string>('OSU_REDIRECT_URI'),
      response_type: 'code',
      scope: 'identify',
      state,
    })

    response.redirect(`https://osu.ppy.sh/oauth/authorize?${params.toString()}`)
  }

  async completeOsuLogin(
    code: string,
    state: string,
    request: Request,
    response: Response,
  ): Promise<void> {
    const storedState = this.readCookie(request, STATE_COOKIE)
    if (!storedState || storedState !== state) {
      throw new UnauthorizedException('Invalid OAuth state')
    }

    const token = await this.exchangeCode(code)
    const profile = await this.fetchOsuProfile(token.access_token)
    const providerAccountId = String(profile.id)
    const oauthAccount = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: $Enums.OAuthProvider.OSU,
          providerAccountId,
        },
      },
    })
    const user = oauthAccount
      ? await this.prisma.user.update({
          where: { id: oauthAccount.userId },
          data: {
            displayName: profile.username,
            avatarUrl: profile.avatar_url,
          },
        })
      : await this.prisma.user.create({
          data: {
            displayName: profile.username,
            avatarUrl: profile.avatar_url,
            oauthAccounts: {
              create: {
                provider: $Enums.OAuthProvider.OSU,
                providerAccountId,
              },
            },
          },
        })

    const sessionToken = randomBytes(32).toString('base64url')
    await this.prisma.session.create({
      data: {
        userId: user.id,
        tokenHash: this.hash(sessionToken),
        expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
      },
    })

    response.setHeader('Set-Cookie', [
      this.serializeCookie(SESSION_COOKIE, sessionToken, {
        httpOnly: true,
        maxAge: SESSION_DURATION_MS / 1000,
        sameSite: 'Lax',
      }),
      this.serializeCookie(STATE_COOKIE, '', {
        httpOnly: true,
        maxAge: 0,
        sameSite: 'Lax',
      }),
    ])
    response.redirect(this.config.getOrThrow<string>('FRONTEND_URL'))
  }

  async getCurrentUser(request: Request) {
    const session = await this.findSession(request)
    if (!session) {
      throw new UnauthorizedException('Authentication required')
    }

    return {
      id: session.user.id,
      displayName: session.user.displayName,
      avatarUrl: session.user.avatarUrl,
    }
  }

  async logout(request: Request, response: Response): Promise<void> {
    const token = this.readCookie(request, SESSION_COOKIE)
    if (token) {
      await this.prisma.session.updateMany({
        where: { tokenHash: this.hash(token), revokedAt: null },
        data: { revokedAt: new Date() },
      })
    }

    response.setHeader(
      'Set-Cookie',
      this.serializeCookie(SESSION_COOKIE, '', {
        httpOnly: true,
        maxAge: 0,
        sameSite: 'Lax',
      }),
    )
    response.status(204).send()
  }

  private async findSession(request: Request) {
    const token = this.readCookie(request, SESSION_COOKIE)
    if (!token) {
      return null
    }

    return this.prisma.session.findFirst({
      where: {
        tokenHash: this.hash(token),
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    })
  }

  private async exchangeCode(code: string): Promise<OsuTokenResponse> {
    const response = await fetch('https://osu.ppy.sh/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: this.config.getOrThrow<string>('OSU_CLIENT_ID'),
        client_secret: this.config.getOrThrow<string>('OSU_CLIENT_SECRET'),
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.config.getOrThrow<string>('OSU_REDIRECT_URI'),
      }),
    })

    if (!response.ok) {
      throw new InternalServerErrorException('osu! token exchange failed')
    }

    return this.readJson<OsuTokenResponse>(response)
  }

  private async fetchOsuProfile(accessToken: string): Promise<OsuProfile> {
    const response = await fetch('https://osu.ppy.sh/api/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!response.ok) {
      throw new InternalServerErrorException('osu! profile request failed')
    }

    return this.readJson<OsuProfile>(response)
  }

  private async readJson<T>(response: globalThis.Response): Promise<T> {
    try {
      return (await response.json()) as T
    } catch {
      throw new InternalServerErrorException('Invalid response from osu!')
    }
  }

  private readCookie(request: Request, name: string): string | undefined {
    const header = request.headers.cookie
    if (!header) {
      return undefined
    }

    for (const cookie of header.split(';')) {
      const separator = cookie.indexOf('=')
      if (separator < 0 || cookie.slice(0, separator).trim() !== name) {
        continue
      }

      return decodeURIComponent(cookie.slice(separator + 1))
    }

    return undefined
  }

  private serializeCookie(
    name: string,
    value: string,
    options: { httpOnly: boolean; maxAge: number; sameSite: 'Lax' },
  ): string {
    const secure = this.config.get<string>('NODE_ENV') === 'production'
    return [
      `${name}=${encodeURIComponent(value)}`,
      'Path=/',
      `Max-Age=${options.maxAge}`,
      `SameSite=${options.sameSite}`,
      options.httpOnly ? 'HttpOnly' : '',
      secure ? 'Secure' : '',
    ]
      .filter(Boolean)
      .join('; ')
  }

  private hash(value: string): string {
    return createHash('sha256').update(value).digest('hex')
  }
}
