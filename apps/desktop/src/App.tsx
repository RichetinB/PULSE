import { useState } from 'react'
import './App.css'
import { getDesktopStatus, type DesktopStatus } from './lib/desktopBridge'
import {
  importBeatmap,
  importReplay,
  type BeatmapSummary,
  type ReplaySummary,
} from './lib/replayBridge'
import { open } from '@tauri-apps/plugin-dialog'

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
    eyebrow: 'Local import',
    title: 'Replay Analyzer',
    description:
      'Import classic osu!standard replays and inspect their decoded data.',
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
  const [replay, setReplay] = useState<ReplaySummary | null>(null)
  const [replayState, setReplayState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [replayError, setReplayError] = useState<string | null>(null)
  const [beatmap, setBeatmap] = useState<BeatmapSummary | null>(null)
  const [beatmapState, setBeatmapState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [beatmapError, setBeatmapError] = useState<string | null>(null)

  const checkDesktopBridge = async () => {
    setDesktopStatus(await getDesktopStatus())
  }

  const selectReplay = async () => {
    setReplayState('loading')
    setReplayError(null)
    try {
      const selected = await open({
        multiple: false,
        directory: false,
        filters: [{ name: 'osu! replay', extensions: ['osr'] }],
      })
      if (!selected || Array.isArray(selected)) {
        setReplayState('idle')
        return
      }
      setReplay(await importReplay(selected))
      setReplayState('idle')
    } catch (error) {
      setReplayState('error')
      setReplayError(error instanceof Error ? error.message : String(error))
    }
  }

  const selectBeatmap = async () => {
    setBeatmapState('loading')
    setBeatmapError(null)
    try {
      const selected = await open({
        multiple: false,
        directory: false,
        filters: [{ name: 'osu! beatmap', extensions: ['osu'] }],
      })
      if (!selected || Array.isArray(selected)) {
        setBeatmapState('idle')
        return
      }
      setBeatmap(await importBeatmap(selected))
      setBeatmapState('idle')
    } catch (error) {
      setBeatmapState('error')
      setBeatmapError(error instanceof Error ? error.message : String(error))
    }
  }

  const beatmapMatchesReplay =
    replay?.beatmap_hash &&
    beatmap &&
    replay.beatmap_hash.toLowerCase() === beatmap.md5.toLowerCase()

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
                  <p>Import a classic osu!standard replay to inspect its data.</p>
                </div>
                <span className="card-status">Available</span>
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
        ) : activeSection === 'replay' ? (
          <div className="page-content">
            <section className="replay-card">
              <span className="eyebrow">Local replay import</span>
              <h2>Replay Analyzer</h2>
              <p>
                Import a classic osu!standard <code>.osr</code> replay. PULSE
                reads it locally and does not resolve beatmap metadata online.
              </p>
              <button className="primary-button" type="button" onClick={selectReplay} disabled={replayState === 'loading'}>
                {replayState === 'loading' ? 'Reading replay…' : 'Import .osr replay'}
              </button>
              {replayError && <p className="error-message" role="alert">{replayError}</p>}
              <button className="secondary-button" type="button" onClick={selectBeatmap} disabled={beatmapState === 'loading'}>
                {beatmapState === 'loading' ? 'Reading beatmap…' : 'Import matching .osu beatmap'}
              </button>
              {beatmapError && <p className="error-message" role="alert">{beatmapError}</p>}
              {beatmap && (
                <div className="beatmap-results">
                  <span className="eyebrow">Imported beatmap</span>
                  <h3>{beatmap.artist ?? 'Unknown artist'} — {beatmap.title ?? 'Untitled map'}</h3>
                  <p>{beatmap.version ?? 'Unknown difficulty'} · {beatmap.hit_object_count.toLocaleString()} hit objects</p>
                  <code>{beatmap.md5}</code>
                  {replay && (
                    <p className={beatmapMatchesReplay ? 'match-success' : 'match-failure'} role="status">
                      {beatmapMatchesReplay
                        ? 'Exact replay match'
                        : 'Beatmap does not match this replay'}
                    </p>
                  )}
                </div>
              )}
              {replay && (
                <div className="replay-results">
                  <div className="replay-result-header">
                    <div>
                      <span className="eyebrow">Imported replay</span>
                      <h3>{replay.player_name ?? 'Unknown player'}</h3>
                    </div>
                    <span className="status-pill">{replay.game_mode}</span>
                  </div>
                  <dl className="replay-grid">
                    <div><dt>Beatmap hash</dt><dd>{replay.beatmap_hash ?? 'Unknown'}</dd></div>
                    <div><dt>Played</dt><dd>{new Date(replay.timestamp).toLocaleString()}</dd></div>
                    <div><dt>Score</dt><dd>{replay.score.toLocaleString()}</dd></div>
                    <div><dt>Max combo</dt><dd>{replay.max_combo.toLocaleString()}</dd></div>
                    <div><dt>Accuracy</dt><dd>{replay.accuracy === null ? 'Unknown' : `${(replay.accuracy * 100).toFixed(2)}%`}</dd></div>
                    <div><dt>Replay events</dt><dd>{replay.event_count.toLocaleString()}</dd></div>
                    <div><dt>Mods</dt><dd>{replay.mods.length ? replay.mods.join(', ') : 'None'}</dd></div>
                    <div><dt>Hits</dt><dd>300: {replay.hit_counts.count_300} · 100: {replay.hit_counts.count_100} · 50: {replay.hit_counts.count_50} · Geki: {replay.hit_counts.count_geki} · Katu: {replay.hit_counts.count_katu} · Miss: {replay.hit_counts.count_miss}</dd></div>
                    <div><dt>Unknown mod bits</dt><dd>{replay.unknown_mod_bits ? `0x${replay.unknown_mod_bits.toString(16)}` : 'None'}</dd></div>
                  </dl>
                </div>
              )}
            </section>
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
