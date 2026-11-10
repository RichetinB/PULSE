import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App navigation', () => {
  it('shows an explicit placeholder when a planned section is selected', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Weaknesses' }))

    expect(
      screen.getByRole('heading', { name: 'Weaknesses', level: 2 }),
    ).toBeVisible()
    expect(screen.getByText('Not implemented yet')).toBeVisible()
  })
})
