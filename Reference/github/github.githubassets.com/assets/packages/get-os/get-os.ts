import type {NavigatorUA} from './@types/user-agent-data'
import {ssrSafeWindow} from '@github-ui/ssr-utils'

export type NavigatorUserAgent = NavigatorUA

export const OS = {
  Android: 'Android',
  iOS: 'iOS',
  macOS: 'macOS',
  Windows: 'Windows',
  Linux: 'Linux',
  Unknown: 'Unknown',
} as const
export type OS = (typeof OS)[keyof typeof OS]

export type OSInformation = {
  os: OS
  isAndroid: boolean
  isIOS: boolean
  isLinux: boolean
  isMacOS: boolean
  isWindows: boolean
  isDesktop: boolean
  isMobile: boolean
}

export function getOS(): OSInformation {
  let os: OS = OS.Unknown
  let isMobileOS = false
  if (ssrSafeWindow) {
    // TypeScript doesn't 'know' about userAgentData yet
    const navigator = ssrSafeWindow.navigator as Navigator & NavigatorUA

    // Browsers/extensions can intercept navigator.userAgent which can cause errors.
    // We should catch these getters to avoid seeing errors in Sentry.
    let userAgent = ''
    try {
      userAgent = navigator.userAgent
    } catch {
      /* empty */
    }
    let platform = ''
    try {
      platform = navigator?.userAgentData?.platform || navigator.platform
    } catch {
      /* empty */
    }
    const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K', 'macOS']
    const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE']
    const iosPlatforms = ['iPhone', 'iPad', 'iPod']

    if (macosPlatforms.indexOf(platform) !== -1) {
      os = OS.macOS
    } else if (iosPlatforms.indexOf(platform) !== -1) {
      os = OS.iOS
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
      os = OS.Windows
    } else if (/Android/.test(userAgent)) {
      os = OS.Android
    } else if (/Linux/.test(platform)) {
      os = OS.Linux
    }
    isMobileOS = navigator?.userAgentData?.mobile ?? (os === OS.Android || os === OS.iOS)
  }

  return {
    os,
    isAndroid: os === OS.Android,
    isIOS: os === OS.iOS,
    isMacOS: os === OS.macOS,
    isWindows: os === OS.Windows,
    isLinux: os === OS.Linux,
    isDesktop: os === OS.macOS || os === OS.Windows || os === OS.Linux,
    isMobile: isMobileOS,
  }
}

export function isMobile(): boolean {
  return getOS().isMobile
}

export function isDesktop(): boolean {
  return getOS().isDesktop
}

export function isAndroid(): boolean {
  return getOS().isAndroid
}

export function isIOS(): boolean {
  return getOS().isIOS
}

export function isMacOS(): boolean {
  return getOS().isMacOS
}

export function isWindows(): boolean {
  return getOS().isWindows
}

export function isLinux(): boolean {
  return getOS().isLinux
}

export type Architecture = 'x86' | 'arm'

export type OSItem = {
  platform: OS
  arch?: Architecture
}

// Best-effort CPU architecture detection via the high-entropy User-Agent Client
// Hints API. SSR-safe and defensive: browsers/extensions can intercept navigator
// access and throw, so every property read lives inside the try (mirrors getOS).
export async function getArchitecture(): Promise<Architecture | undefined> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- assertion required for type narrowing; removing it breaks tsc
    const uaData = (ssrSafeWindow?.navigator as (Navigator & NavigatorUserAgent) | undefined)?.userAgentData
    const values = await uaData?.getHighEntropyValues?.(['architecture'])
    return values?.architecture === 'arm' || values?.architecture === 'x86' ? values.architecture : undefined
  } catch {
    return undefined
  }
}

// Map the detected OS onto one of the platforms a caller actually supports.
// Returns the detected OS when it's supported; otherwise falls back to the first
// supported platform (in the order provided) so callers never end up with an
// unsupported result. Returns undefined only when no platforms are supported.
export function resolveSupportedOS<T extends OS>(detectedOS: OS, supportedPlatforms: readonly [T, ...T[]]): T
export function resolveSupportedOS<T extends OS>(detectedOS: OS, supportedPlatforms: readonly T[]): T | undefined
export function resolveSupportedOS<T extends OS>(detectedOS: OS, supportedPlatforms: readonly T[]): T | undefined {
  if (supportedPlatforms.includes(detectedOS as T)) return detectedOS as T
  return supportedPlatforms[0]
}

// Pick the best-matching item for the resolved OS/arch. Falls back to the first
// item overall when the resolved OS has no matching item (e.g. a Linux visitor
// on a product that only ships macOS/Windows builds) so callers never get an
// empty result. Note: when resolvedArch is omitted this returns the first item
// for the OS in data order — it does not apply sortByOS's default-arch
// preference, matching the original resolve behavior.
export function resolveByOS<T extends OSItem>(
  items: readonly T[],
  resolvedOS: OS,
  resolvedArch?: Architecture,
): T | undefined {
  const osItems = items.filter(item => item.platform === resolvedOS)
  if (osItems.length === 0) return items[0]
  if (resolvedArch) {
    const archMatch = osItems.find(item => item.arch === resolvedArch)
    if (archMatch) return archMatch
  }
  return osItems[0]
}

// Order items so the resolved OS (and detected/preferred arch) surface first,
// while keeping each platform's items grouped in their original data order.
export function sortByOS<T extends OSItem>(items: readonly T[], resolvedOS: OS, resolvedArch?: Architecture): T[] {
  const platformOrder = new Map<OS, number>()
  for (const item of items) {
    if (!platformOrder.has(item.platform)) platformOrder.set(item.platform, platformOrder.size)
  }
  // Prefer the user's detected architecture; fall back to the most common arch per platform.
  const archRank = (platform: OS, arch?: Architecture) => {
    const preferred = resolvedArch ?? (platform === OS.macOS ? 'arm' : 'x86')
    return arch === preferred ? 0 : arch ? 1 : 2
  }
  return items.slice().sort((a, b) => {
    // Preferred OS first
    const osRank = (platform: OS) => (platform === resolvedOS ? 0 : 1)
    if (osRank(a.platform) !== osRank(b.platform)) return osRank(a.platform) - osRank(b.platform)
    // Keep each platform's items grouped together, preserving the data's platform order
    if (a.platform !== b.platform) {
      return (platformOrder.get(a.platform) ?? 0) - (platformOrder.get(b.platform) ?? 0)
    }
    // Within a platform, order by arch (detected/preferred arch first, then other, then no arch)
    return archRank(a.platform, a.arch) - archRank(b.platform, b.arch)
  })
}
