export type PreventAutofocusProp = {preventAutofocus?: boolean}

export interface NavigateOptionExtensions extends PreventAutofocusProp {
  reloadDocument?: boolean
  preventTurbo?: boolean
}

export type PreloadProps = {
  preload?: false | 'intent' | 'render' | 'viewport'
  preloadDelay?: number
}

export interface PreloadableRoute {
  path: string
  preload(params: Record<string, string>, searchParams?: URLSearchParams): void
}

export const PREVENT_AUTOFOCUS_KEY = '__gh__react-core-preventAutofocus'
export const DEFAULT_INTENT_PRELOAD_DELAY = 100
