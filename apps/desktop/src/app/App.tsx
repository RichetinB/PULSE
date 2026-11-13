import { useState } from 'react'
import '../App.css'
import { AppShell } from '../components/layout/AppShell'
import { DashboardPage } from '../pages/DashboardPage'
import { PlannedPage } from '../pages/PlannedPage'
import { ReplayAnalyzerPage } from '../features/replay-analyzer/ReplayAnalyzerPage'
import { desktopReplayImportService } from '../platform/desktop/replayImportService'
import { getDesktopStatus } from '../platform/desktop/desktopBridge'
import { plannedSections, sections, type SectionId } from './navigation'

function App() {
  const [activeSection, setActiveSection] = useState<SectionId>('dashboard')
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
    >
      {page}
    </AppShell>
  )
}

export default App
