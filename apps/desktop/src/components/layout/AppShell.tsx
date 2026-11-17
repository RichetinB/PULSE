import type { ReactNode } from 'react'
import type { SectionId, NavigationItem } from '../../app/navigation'
import { Sidebar } from './Sidebar'
import type { AuthUser } from '../../platform/api/authService'

type AppShellProps = {
  navigationItems: NavigationItem[]
  activeSection: SectionId
  breadcrumb: string
  pageTitle: string
  onNavigate: (section: SectionId) => void
  user: AuthUser | null
  authLoading: boolean
  authError: string | null
  loggingOut: boolean
  onLogin: () => void
  onLogout: () => void
  children: ReactNode
}

export function AppShell({
  navigationItems,
  activeSection,
  breadcrumb,
  pageTitle,
  onNavigate,
  user,
  authLoading,
  authError,
  loggingOut,
  onLogin,
  onLogout,
  children,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <Sidebar
        navigationItems={navigationItems}
        activeSection={activeSection}
        onNavigate={onNavigate}
      />
      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="breadcrumb">PULSE / {breadcrumb}</span>
            <h1>{pageTitle}</h1>
          </div>
          <div className="account-area">
            {authLoading ? (
              <span className="muted-label">Checking account...</span>
            ) : user ? (
              <>
                <span className="account-name">{user.displayName ?? 'osu! player'}</span>
                <button className="text-button" type="button" onClick={onLogout} disabled={loggingOut}>
                  {loggingOut ? 'Logging out...' : 'Log out'}
                </button>
              </>
            ) : (
              <button className="text-button" type="button" onClick={onLogin}>
                Log in with osu!
              </button>
            )}
            {authError && <span className="auth-error" role="alert">{authError}</span>}
          </div>
        </header>
        {children}
      </main>
    </div>
  )
}
