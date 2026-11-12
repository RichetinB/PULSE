import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

afterEach(cleanup)

describe('App navigation', () => {
  it('shows an explicit placeholder when a planned section is selected', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Weaknesses' }))

    expect(
      screen.getByRole('heading', { name: 'Weaknesses', level: 2 }),
    ).toBeVisible()
    expect(screen.getByText('Not implemented yet')).toBeVisible()
  })

  it('shows the replay import action', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Replay Analyzer' }))
    expect(screen.getByRole('button', { name: 'Import .osr replay' })).toBeVisible()
    expect(screen.getByText(/classic osu!standard/)).toBeVisible()
  })
})
