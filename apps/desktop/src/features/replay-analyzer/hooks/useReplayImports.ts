import { useState } from 'react'
import type {
  BeatmapSummary,
  ReplayImportService,
  ReplaySummary,
} from '../types'

type ImportState = 'idle' | 'loading' | 'error'

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export function useReplayImports(importService: ReplayImportService) {
  const [replay, setReplay] = useState<ReplaySummary | null>(null)
  const [replayState, setReplayState] = useState<ImportState>('idle')
  const [replayError, setReplayError] = useState<string | null>(null)
  const [beatmap, setBeatmap] = useState<BeatmapSummary | null>(null)
  const [beatmapState, setBeatmapState] = useState<ImportState>('idle')
  const [beatmapError, setBeatmapError] = useState<string | null>(null)

  const selectReplay = async () => {
    setReplayState('loading')
    setReplayError(null)
    try {
      const selectedReplay = await importService.importReplay()
      if (!selectedReplay) {
        setReplayState('idle')
        return
      }
      setReplay(selectedReplay)
      setReplayState('idle')
    } catch (error) {
      setReplayState('error')
      setReplayError(getErrorMessage(error))
    }
  }

  const selectBeatmap = async () => {
    setBeatmapState('loading')
    setBeatmapError(null)
    try {
      const selectedBeatmap = await importService.importBeatmap()
      if (!selectedBeatmap) {
        setBeatmapState('idle')
        return
      }
      setBeatmap(selectedBeatmap)
      setBeatmapState('idle')
    } catch (error) {
      setBeatmapState('error')
      setBeatmapError(getErrorMessage(error))
    }
  }

  const beatmapMatchesReplay = Boolean(
    replay?.beatmap_hash &&
      beatmap &&
      replay.beatmap_hash.toLowerCase() === beatmap.md5.toLowerCase(),
  )

  return {
    replay,
    replayState,
    replayError,
    beatmap,
    beatmapState,
    beatmapError,
    beatmapMatchesReplay,
    selectReplay,
    selectBeatmap,
  }
}
