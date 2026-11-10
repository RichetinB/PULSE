import { invoke } from '@tauri-apps/api/core'

export type DesktopStatus =
  | { available: true; version: string }
  | { available: false }

const isTauriRuntime = () =>
  typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

export async function getDesktopStatus(): Promise<DesktopStatus> {
  if (!isTauriRuntime()) {
    return { available: false }
  }

  try {
    const version = await invoke<string>('get_app_version')
    return { available: true, version }
  } catch {
    return { available: false }
  }
}
