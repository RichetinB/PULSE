import { useState } from 'react'
import type { DesktopStatus } from '../app/contracts'

type DashboardPageProps = {
  getDesktopStatus: () => Promise<DesktopStatus>
}

export function DashboardPage({ getDesktopStatus }: DashboardPageProps) {
  const [desktopStatus, setDesktopStatus] = useState<DesktopStatus | null>(null)

  const checkDesktopBridge = async () => {
    setDesktopStatus(await getDesktopStatus())
  }

  return (
    <div className="page-content">
      <section className="hero-card">
        <div>
          <span className="eyebrow">Your performance workspace</span>
          <h2>
            Build consistency.
            <br />
            Understand your play.
          </h2>
          <p>
            Import a replay and inspect its decoded data locally. Performance
            analysis and coaching are not implemented yet.
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
            <h3>Replay import</h3>
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
          <button
            className="text-button"
            type="button"
            onClick={checkDesktopBridge}
          >
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
  )
}
