import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getDesktopStatus } from './desktopBridge'
import { invoke } from '@tauri-apps/api/core'

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}))

describe('getDesktopStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Reflect.deleteProperty(window, '__TAURI_INTERNALS__')
  })

  it('reports the browser preview as unavailable without inventing a desktop status', async () => {
    await expect(getDesktopStatus()).resolves.toEqual({ available: false })
    expect(invoke).not.toHaveBeenCalled()
  })

  it('returns the version from the desktop command', async () => {
    Object.defineProperty(window, '__TAURI_INTERNALS__', {
      configurable: true,
      value: {},
    })
    vi.mocked(invoke).mockResolvedValue('0.1.0')

    await expect(getDesktopStatus()).resolves.toEqual({
      available: true,
      version: '0.1.0',
    })
    expect(invoke).toHaveBeenCalledWith('get_app_version')
  })

  it('reports an unavailable bridge when the desktop command fails', async () => {
    Object.defineProperty(window, '__TAURI_INTERNALS__', {
      configurable: true,
      value: {},
    })
    vi.mocked(invoke).mockRejectedValue(new Error('bridge unavailable'))

    await expect(getDesktopStatus()).resolves.toEqual({ available: false })
  })
})
