export function parseCorsOrigins(value: string): string[] {
  const origins = value.split(',').map((origin) => origin.trim())

  if (origins.length === 0 || origins.some((origin) => origin.length === 0)) {
    throw new Error('CORS_ORIGINS must contain comma-separated web origins')
  }

  for (const origin of origins) {
    let parsedOrigin: URL
    try {
      parsedOrigin = new URL(origin)
    } catch {
      throw new Error('CORS_ORIGINS must contain valid HTTP(S) origins')
    }

    if (
      !['http:', 'https:'].includes(parsedOrigin.protocol) ||
      parsedOrigin.origin !== origin
    ) {
      throw new Error('CORS_ORIGINS must contain exact HTTP(S) origins')
    }
  }

  return [...new Set(origins)]
}
