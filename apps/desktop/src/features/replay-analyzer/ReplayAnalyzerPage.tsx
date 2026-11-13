import { useReplayImports } from './hooks/useReplayImports'
import type { ReplayImportService } from './types'

type ReplayAnalyzerPageProps = {
  importService: ReplayImportService
}

export function ReplayAnalyzerPage({
  importService,
}: ReplayAnalyzerPageProps) {
  const {
    replay,
    replayState,
    replayError,
    beatmap,
    beatmapState,
    beatmapError,
    beatmapMatchesReplay,
    selectReplay,
    selectBeatmap,
  } = useReplayImports(importService)

  return (
    <div className="page-content">
      <section className="replay-card">
        <span className="eyebrow">Local replay import</span>
        <h2>Replay Analyzer</h2>
        <p>
          Import a classic osu!standard <code>.osr</code> replay. PULSE reads it
          locally and does not resolve beatmap metadata online.
        </p>
        <button
          className="primary-button"
          type="button"
          onClick={selectReplay}
          disabled={replayState === 'loading'}
        >
          {replayState === 'loading' ? 'Reading replay…' : 'Import .osr replay'}
        </button>
        {replayError && (
          <p className="error-message" role="alert">
            {replayError}
          </p>
        )}
        <button
          className="secondary-button"
          type="button"
          onClick={selectBeatmap}
          disabled={beatmapState === 'loading'}
        >
          {beatmapState === 'loading'
            ? 'Reading beatmap…'
            : 'Import matching .osu beatmap'}
        </button>
        {beatmapError && (
          <p className="error-message" role="alert">
            {beatmapError}
          </p>
        )}
        {beatmap && (
          <div className="beatmap-results">
            <span className="eyebrow">Imported beatmap</span>
            <h3>
              {beatmap.artist ?? 'Unknown artist'} —{' '}
              {beatmap.title ?? 'Untitled map'}
            </h3>
            <p>
              {beatmap.version ?? 'Unknown difficulty'} ·{' '}
              {beatmap.hit_object_count.toLocaleString()} hit objects
            </p>
            <code>{beatmap.md5}</code>
            {replay && (
              <p
                className={beatmapMatchesReplay ? 'match-success' : 'match-failure'}
                role="status"
              >
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
              <div>
                <dt>Beatmap hash</dt>
                <dd>{replay.beatmap_hash ?? 'Unknown'}</dd>
              </div>
              <div>
                <dt>Played</dt>
                <dd>{new Date(replay.timestamp).toLocaleString()}</dd>
              </div>
              <div>
                <dt>Score</dt>
                <dd>{replay.score.toLocaleString()}</dd>
              </div>
              <div>
                <dt>Max combo</dt>
                <dd>{replay.max_combo.toLocaleString()}</dd>
              </div>
              <div>
                <dt>Accuracy</dt>
                <dd>
                  {replay.accuracy === null
                    ? 'Unknown'
                    : `${(replay.accuracy * 100).toFixed(2)}%`}
                </dd>
              </div>
              <div>
                <dt>Replay events</dt>
                <dd>{replay.event_count.toLocaleString()}</dd>
              </div>
              <div>
                <dt>Mods</dt>
                <dd>{replay.mods.length ? replay.mods.join(', ') : 'None'}</dd>
              </div>
              <div>
                <dt>Hits</dt>
                <dd>
                  300: {replay.hit_counts.count_300} · 100:{' '}
                  {replay.hit_counts.count_100} · 50: {replay.hit_counts.count_50}{' '}
                  · Geki: {replay.hit_counts.count_geki} · Katu:{' '}
                  {replay.hit_counts.count_katu} · Miss:{' '}
                  {replay.hit_counts.count_miss}
                </dd>
              </div>
              <div>
                <dt>Unknown mod bits</dt>
                <dd>
                  {replay.unknown_mod_bits
                    ? `0x${replay.unknown_mod_bits.toString(16)}`
                    : 'None'}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </section>
    </div>
  )
}
