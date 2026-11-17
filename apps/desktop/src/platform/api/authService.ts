export type AuthUser = {
  id: string
  displayName: string | null
  avatarUrl: string | null
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

export const authService = {
  async getCurrentUser(): Promise<AuthUser | null> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      credentials: 'include',
    })

    if (response.status === 401) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Unable to load current user (${response.status})`)
    }

    return (await response.json()) as AuthUser
  },

  startOsuLogin(): void {
    window.location.assign(`${API_BASE_URL}/auth/osu`)
  },

  async logout(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      credentials: 'include',
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error(`Unable to log out (${response.status})`)
    }
  },
}
