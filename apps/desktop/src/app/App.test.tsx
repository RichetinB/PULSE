import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

afterEach(cleanup)

describe('App navigation', () => {
  it('marks the selected section and shows planned sections honestly', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Weaknesses' }))

    expect(
      screen.getByRole('button', { name: 'Weaknesses' }),
    ).toHaveAttribute('aria-current', 'page')
    expect(
      screen.getByRole('heading', { name: 'Weaknesses', level: 2 }),
    ).toBeVisible()
    expect(screen.getByText('Not implemented yet')).toBeVisible()
  })

  it('shows the Replay Analyzer import controls', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Replay Analyzer' }))

    expect(screen.getByRole('heading', { name: 'Replay Analyzer', level: 1 }))
      .toBeVisible()
    expect(screen.getByRole('button', { name: 'Import .osr replay' }))
      .toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Import matching .osu beatmap' }),
    ).toBeVisible()
    expect(screen.getByText(/classic osu!standard/)).toBeVisible()
  })
})
