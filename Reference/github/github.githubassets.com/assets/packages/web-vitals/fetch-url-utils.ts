// Extract a short endpoint path from a URL (strip origin, query, hash)
export function extractEndpoint(url: string): string {
  try {
    const parsed = new URL(url, window.location.origin)
    if (parsed.origin !== window.location.origin) return ''
    return parsed.pathname
  } catch {
    return ''
  }
}

// URLs that should not count as interaction activity (telemetry, assets, etc.)
export function shouldIgnoreUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin)
    const path = parsed.pathname
    if (path.endsWith('/collect') || path.endsWith('/stats')) return true
    if (parsed.origin === 'https://github.githubassets.com' && path.startsWith('/assets')) return true
    return false
  } catch {
    return false
  }
}
