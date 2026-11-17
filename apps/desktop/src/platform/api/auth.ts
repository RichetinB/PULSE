import type { AuthUser } from './authService'

export type AuthService = {
  getCurrentUser: () => Promise<AuthUser | null>
  startOsuLogin: () => void
  logout: () => Promise<void>
}
