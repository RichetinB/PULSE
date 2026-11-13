import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'
import type {
  BeatmapSummary,
  ReplayImportService,
  ReplaySummary,
} from '../../features/replay-analyzer/types'

export const desktopReplayImportService: ReplayImportService = {
  async importReplay() {
    const selected = await open({
      multiple: false,
      directory: false,
      filters: [{ name: 'osu! replay', extensions: ['osr'] }],
    })
    if (!selected || Array.isArray(selected)) {
      return null
    }
    return invoke<ReplaySummary>('import_replay', { path: selected })
  },
  async importBeatmap() {
    const selected = await open({
      multiple: false,
      directory: false,
      filters: [{ name: 'osu! beatmap', extensions: ['osu'] }],
    })
    if (!selected || Array.isArray(selected)) {
      return null
    }
    return invoke<BeatmapSummary>('import_beatmap', { path: selected })
  },
}
