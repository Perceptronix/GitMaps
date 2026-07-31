import {ssrSafeDocument} from '@github-ui/ssr-utils'
import {useEffect, useState} from 'react'

export interface ColorModeOptions {
  colorMode?: string
  lightTheme: string
  darkTheme: string
}

function getSchemeFromMode(mode?: string) {
  switch (mode) {
    case 'light':
      return 'day'
    case 'dark':
      return 'night'
    default:
      return 'auto'
  }
}

function getColorModes(options: ColorModeOptions | DOMStringMap) {
  const mode = options.colorMode

  return {
    colorMode: getSchemeFromMode(mode),
    dayScheme: options.lightTheme,
    nightScheme: options.darkTheme,
  } as const
}

let getServerColorModeOptions: (() => ColorModeOptions | undefined) | null = null

export function setServerColorModeGetter(getter: () => ColorModeOptions | undefined) {
  getServerColorModeOptions = getter
}

function getColorModesSSR() {
  const serverOptions = getServerColorModeOptions ? getServerColorModeOptions() : undefined
  return getColorModes(serverOptions ?? {})
}

function useColorModes() {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const {documentElement} = ssrSafeDocument!
  // eslint-disable-next-line github/no-dataset
  const [colorMode, setColorMode] = useState(() => getColorModes(documentElement.dataset))

  useEffect(() => {
    // Update color modes any time color mode attributes change on the base html document element
    // eslint-disable-next-line github/no-dataset
    const observer = new MutationObserver(() => setColorMode(getColorModes(documentElement.dataset)))

    observer.observe(documentElement, {
      attributes: true,
      attributeFilter: ['data-color-mode', 'data-light-theme', 'data-dark-theme'],
    })

    return () => observer.disconnect()
  }, [documentElement])

  return {
    ...colorMode,
    dayScheme: getColorScheme(colorMode.dayScheme),
    nightScheme: getColorScheme(colorMode.nightScheme),
  }
}

const newHighContrastSupportedThemes = new Set([
  'light_colorblind_high_contrast',
  'light_tritanopia_high_contrast',
  'dark_colorblind_high_contrast',
  'dark_tritanopia_high_contrast',
  'dark_dimmed_high_contrast',
] as const)

type HighContrastTheme = typeof newHighContrastSupportedThemes extends Set<infer E> ? E : never

// Primer's `ThemeProvider` doesn't have access to color constants to these new high contrast themes since, as of May
// 2025, it's consulting a big TS object where we want to eventually migrate to CSS variables. Instead of adding more
// large legacy objects, we'll fall back to existing high contrast themes where appropriate.
const colorModeHighContrastMappings: Record<HighContrastTheme, string> = {
  light_colorblind_high_contrast: 'light_high_contrast',
  light_tritanopia_high_contrast: 'light_high_contrast',
  dark_colorblind_high_contrast: 'dark_high_contrast',
  dark_tritanopia_high_contrast: 'dark_high_contrast',
  dark_dimmed_high_contrast: 'dark_high_contrast',
} as const

function getColorScheme(value: string | undefined): string | undefined {
  if (value === undefined || !isHighContrastTheme(value)) {
    return value
  }

  return colorModeHighContrastMappings[value]
}

function isHighContrastTheme(value: string): value is HighContrastTheme {
  return newHighContrastSupportedThemes.has(value as HighContrastTheme)
}

export default ssrSafeDocument ? useColorModes : getColorModesSSR
