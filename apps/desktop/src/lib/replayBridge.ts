import { invoke } from '@tauri-apps/api/core'

export type ReplaySummary = {
  game_mode: 'osu!standard'
  game_version: number
  beatmap_hash: string | null
  player_name: string | null
  replay_hash: string | null
  score: number
  max_combo: number
  perfect: boolean
  hit_counts: {
    count_300: number
    count_100: number
    count_50: number
    count_geki: number
    count_katu: number
    count_miss: number
  }
  accuracy: number | null
  mods: string[]
  unknown_mod_bits: number
  timestamp: string
  event_count: number
}

export type BeatmapSummary = {
  md5: string
  format_version: number
  title: string | null
  artist: string | null
  version: string | null
  game_mode: 'osu!standard'
  hit_object_count: number
}

export async function importReplay(path: string): Promise<ReplaySummary> {
  return invoke<ReplaySummary>('import_replay', { path })
}

export async function importBeatmap(path: string): Promise<BeatmapSummary> {
  return invoke<BeatmapSummary>('import_beatmap', { path })
}
