import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common'
import type { Request, Response } from 'express'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('osu')
  async startOsuLogin(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    await this.authService.startOsuLogin(request, response)
  }

  @Get('osu/callback')
  async completeOsuLogin(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    if (!code || !state) {
      throw new BadRequestException('OAuth callback is missing code or state')
    }

    await this.authService.completeOsuLogin(code, state, request, response)
  }

  @Get('me')
  async getCurrentUser(@Req() request: Request) {
    return this.authService.getCurrentUser(request)
  }

  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    await this.authService.logout(request, response)
  }
}
