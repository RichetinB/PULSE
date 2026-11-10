import { useState } from 'react'
import './App.css'
import { getDesktopStatus, type DesktopStatus } from './lib/desktopBridge'

type SectionId =
  | 'dashboard'
  | 'replay'
  | 'weaknesses'
  | 'training'
  | 'progress'
  | 'settings'

type Section = {
  id: SectionId
  label: string
  icon: string
}

const sections: Section[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '⌂' },
  { id: 'replay', label: 'Replay Analyzer', icon: '◈' },
  { id: 'weaknesses', label: 'Weaknesses', icon: '◇' },
  { id: 'training', label: 'Training', icon: '↗' },
  { id: 'progress', label: 'Progress', icon: '▥' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
]

const sectionContent: Record<
  Exclude<SectionId, 'dashboard'>,
  { eyebrow: string; title: string; description: string }
> = {
  replay: {
    eyebrow: 'Coming next',
    title: 'Replay Analyzer',
    description:
      'Replay import and deterministic analysis will arrive in a later foundation slice.',
  },
  weaknesses: {
    eyebrow: 'Planned module',
    title: 'Weaknesses',
    description:
      'Weakness detection will use explainable rules once replay metrics are available.',
  },
  training: {
    eyebrow: 'Planned module',
    title: 'Training',
    description:
      'Training recommendations will be based on measured weaknesses and your goals.',
  },
  progress: {
    eyebrow: 'Planned module',
    title: 'Progress',
    description:
      'Progress tracking will start after the first analyzed sessions are stored locally.',
  },
  settings: {
    eyebrow: 'Foundation',
    title: 'Settings',
    description:
      'Settings will be added alongside persistence and desktop preferences.',
  },
}

function App() {
  const [activeSection, setActiveSection] = useState<SectionId>('dashboard')
  const [desktopStatus, setDesktopStatus] = useState<DesktopStatus | null>(null)

  const checkDesktopBridge = async () => {
    setDesktopStatus(await getDesktopStatus())
  }

  const activeSectionDetails =
    activeSection === 'dashboard' ? null : sectionContent[activeSection]

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">P</div>
          <div>
            <strong>PULSE</strong>
            <span>osu! performance coach</span>
          </div>
        </div>

        <nav className="navigation" aria-label="Primary navigation">
          <span className="navigation-label">Workspace</span>
          {sections.map((section) => (
            <button
              className={`navigation-item ${
                activeSection === section.id ? 'active' : ''
              }`}
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              aria-current={activeSection === section.id ? 'page' : undefined}
            >
              <span className="navigation-icon" aria-hidden="true">
                {section.icon}
              </span>
              {section.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="status-dot" aria-hidden="true" />
          <span>Local-first foundation</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="breadcrumb">PULSE / {activeSection}</span>
            <h1>{activeSection === 'dashboard' ? 'Good to see you.' : activeSectionDetails?.title}</h1>
          </div>
          <span className="phase-badge">Phase 1 · Foundation</span>
        </header>

        {activeSection === 'dashboard' ? (
          <div className="page-content">
            <section className="hero-card">
              <div>
                <span className="eyebrow">Your performance workspace</span>
                <h2>Build consistency.<br />Understand your play.</h2>
                <p>
                  PULSE turns replay data into clear, actionable training
                  insight. The desktop foundation is ready for the next slice.
                </p>
              </div>
              <div className="hero-orbit" aria-hidden="true">
                <span className="orbit orbit-one" />
                <span className="orbit orbit-two" />
                <span className="orbit-core">P</span>
              </div>
            </section>

            <section className="section-heading">
              <div>
                <span className="eyebrow">Getting started</span>
                <h2>Foundation status</h2>
              </div>
              <span className="muted-label">No performance data yet</span>
            </section>

            <div className="status-grid">
              <article className="status-card">
                <span className="card-icon purple">◈</span>
                <div>
                  <h3>Replay analysis</h3>
                  <p>Waiting for the replay import module.</p>
                </div>
                <span className="card-status">Next</span>
              </article>
              <article className="status-card">
                <span className="card-icon blue">⌁</span>
                <div>
                  <h3>Local storage</h3>
                  <p>SQLite persistence is planned for the next slice.</p>
                </div>
                <span className="card-status">Planned</span>
              </article>
              <article className="status-card">
                <span className="card-icon green">✓</span>
                <div>
                  <h3>Desktop shell</h3>
                  <p>React and Tauri communication are scaffolded.</p>
                </div>
                <button className="text-button" type="button" onClick={checkDesktopBridge}>
                  Check
                </button>
              </article>
            </div>

            {desktopStatus && (
              <p className="bridge-status" role="status">
                {desktopStatus.available
                  ? `Desktop bridge online · ${desktopStatus.version}`
                  : 'Desktop bridge unavailable in browser preview. Run the Tauri shell to connect.'}
              </p>
            )}
          </div>
        ) : (
          <div className="page-content">
            <section className="placeholder-card">
              <span className="placeholder-icon">{sections.find((section) => section.id === activeSection)?.icon}</span>
              <span className="eyebrow">{activeSectionDetails?.eyebrow}</span>
              <h2>{activeSectionDetails?.title}</h2>
              <p>{activeSectionDetails?.description}</p>
              <span className="status-pill">Not implemented yet</span>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
