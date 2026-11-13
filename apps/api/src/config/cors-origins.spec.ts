import { parseCorsOrigins } from './cors-origins'

describe('parseCorsOrigins', () => {
  it('trims and deduplicates explicitly listed origins', () => {
    expect(
      parseCorsOrigins(' http://localhost:5173,https://pulse.example,http://localhost:5173 '),
    ).toEqual(['http://localhost:5173', 'https://pulse.example'])
  })

  it.each(['', '*', 'http://localhost:5173/path', 'file://local'])(
    'rejects invalid origin configuration: %s',
    (value) => {
      expect(() => parseCorsOrigins(value)).toThrow()
    },
  )
})
