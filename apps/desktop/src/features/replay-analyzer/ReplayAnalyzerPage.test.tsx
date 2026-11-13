import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ReplayAnalyzerPage } from './ReplayAnalyzerPage'
import type { ReplayImportService } from './types'

afterEach(cleanup)

describe('ReplayAnalyzerPage', () => {
  it('displays replay and beatmap summaries when their MD5 hashes match', async () => {
    const importService: ReplayImportService = {
      importReplay: vi.fn().mockResolvedValue({
        game_mode: 'osu!standard',
        game_version: 20261113,
        beatmap_hash: 'abc123',
        player_name: 'Local player',
        replay_hash: null,
        score: 123456,
        max_combo: 42,
        perfect: false,
        hit_counts: {
          count_300: 10,
          count_100: 2,
          count_50: 1,
          count_geki: 0,
          count_katu: 0,
          count_miss: 1,
        },
        accuracy: 0.9,
        mods: [],
        unknown_mod_bits: 0,
        timestamp: '2026-11-13T10:00:00Z',
        event_count: 14,
      }),
      importBeatmap: vi.fn().mockResolvedValue({
        md5: 'ABC123',
        format_version: 14,
        title: 'Local map',
        artist: 'Local artist',
        version: 'Normal',
        game_mode: 'osu!standard',
        hit_object_count: 13,
      }),
    }
    render(<ReplayAnalyzerPage importService={importService} />)

    fireEvent.click(screen.getByRole('button', { name: 'Import .osr replay' }))
    await screen.findByText('Local player')
    fireEvent.click(
      screen.getByRole('button', { name: 'Import matching .osu beatmap' }),
    )

    expect(await screen.findByText('Exact replay match')).toBeVisible()
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Local artist — Local map',
      }),
    ).toBeVisible()
    expect(importService.importReplay).toHaveBeenCalledOnce()
    expect(importService.importBeatmap).toHaveBeenCalledOnce()
  })
})
