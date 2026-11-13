import type { ReactNode } from 'react'
import type { SectionId, NavigationItem } from '../../app/navigation'
import { Sidebar } from './Sidebar'

type AppShellProps = {
  navigationItems: NavigationItem[]
  activeSection: SectionId
  breadcrumb: string
  pageTitle: string
  onNavigate: (section: SectionId) => void
  children: ReactNode
}

export function AppShell({
  navigationItems,
  activeSection,
  breadcrumb,
  pageTitle,
  onNavigate,
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
          <span className="phase-badge">Phase 1 · Foundation</span>
        </header>
        {children}
      </main>
    </div>
  )
}
