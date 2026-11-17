import { useEffect, useState } from 'react'
import '../App.css'
import { AppShell } from '../components/layout/AppShell'
import { DashboardPage } from '../pages/DashboardPage'
import { PlannedPage } from '../pages/PlannedPage'
import { ReplayAnalyzerPage } from '../features/replay-analyzer/ReplayAnalyzerPage'
import { desktopReplayImportService } from '../platform/desktop/replayImportService'
import { getDesktopStatus } from '../platform/desktop/desktopBridge'
import { authService } from '../platform/api/authService'
import type { AuthService } from '../platform/api/auth'
import { plannedSections, sections, type SectionId } from './navigation'

type AppProps = {
  auth?: AuthService
}

function App({ auth = authService }: AppProps) {
  const [activeSection, setActiveSection] = useState<SectionId>('dashboard')
  const [user, setUser] = useState<Awaited<ReturnType<AuthService['getCurrentUser']>>>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    let active = true
    void auth
      .getCurrentUser()
      .then((currentUser) => {
        if (active) {
          setUser(currentUser)
        }
      })
      .catch(() => {
        if (active) {
          setAuthError('Unable to connect to the API.')
        }
      })
      .finally(() => {
        if (active) {
          setAuthLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [auth])

  const logout = async () => {
    setLoggingOut(true)
    setAuthError(null)
    try {
      await auth.logout()
      setUser(null)
    } catch {
      setAuthError('Unable to log out.')
    } finally {
      setLoggingOut(false)
    }
  }
  const activeNavigationItem = sections.find(
    (section) => section.id === activeSection,
  )
  const pageTitle =
    activeSection === 'dashboard'
      ? 'Good to see you.'
      : activeSection === 'replay'
        ? 'Replay Analyzer'
        : plannedSections[activeSection].title

  const page =
    activeSection === 'dashboard' ? (
      <DashboardPage getDesktopStatus={getDesktopStatus} />
    ) : activeSection === 'replay' ? (
      <ReplayAnalyzerPage importService={desktopReplayImportService} />
    ) : (
      <PlannedPage section={plannedSections[activeSection]} />
    )

  if (!activeNavigationItem) {
    throw new Error(`Unknown PULSE section: ${activeSection}`)
  }

  return (
    <AppShell
      navigationItems={sections}
      activeSection={activeSection}
      breadcrumb={activeNavigationItem.label}
      pageTitle={pageTitle}
      onNavigate={setActiveSection}
      user={user}
      authLoading={authLoading}
      authError={authError}
      loggingOut={loggingOut}
      onLogin={auth.startOsuLogin}
      onLogout={logout}
    >
      {page}
    </AppShell>
  )
}

export default App
