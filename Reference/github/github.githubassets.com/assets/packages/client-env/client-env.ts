export interface ClientEnvironment {
  readonly locale: string
  readonly featureFlags: string[]
  readonly login?: string
  copilotApiOverrideUrl: string | undefined
  cmcApiUrl: string | undefined
}

let env: ClientEnvironment | undefined

let getServerEnv: (() => ClientEnvironment | undefined) | null = null

export function getEnv() {
  const serverEnv = getServerEnv ? getServerEnv() : undefined
  const targetEnv = serverEnv ?? env

  if (!targetEnv) {
    throw new Error(
      'Client env was requested before it was loaded. This likely means you are attempting to use client env at the module level in SSR, which is not supported. Please move your client env usage into a function.',
    )
  }

  return targetEnv
}

export function getLocale() {
  return getEnv().locale ?? 'en-US'
}

export function isLoggedIn() {
  return !!getEnv().login
}

export function getCurrentUserLogin() {
  return getEnv().login
}

function loadEnv() {
  if (typeof document !== 'undefined') {
    const envTag = document.getElementById('client-env')
    if (envTag) {
      try {
        env = JSON.parse(envTag.textContent || '')
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error parsing client-env', error)
      }
    }
  }
}

// Automatically load the env on initial page load
loadEnv()

// This is a special helper method for setting the env in the SSR environment only
export function setClientEnvForSsr(clientEnv: ClientEnvironment | undefined) {
  env = clientEnv
}

export function setServerEnvGetter(getter: () => ClientEnvironment | undefined) {
  getServerEnv = getter
}

// This env object is used as a default for tests only and is not included in production builds
export const clientEnvForTests: ClientEnvironment = {
  locale: 'en',
  featureFlags: ['test_flag'],
  copilotApiOverrideUrl: 'http://copilot-api.test',
  cmcApiUrl: undefined,
}

export function _resetForTests({loadNewEnv, forceUndefined}: {loadNewEnv: boolean; forceUndefined?: boolean}) {
  // forget the current env
  env = forceUndefined ? undefined : clientEnvForTests
  // Note: we don't reset getServerEnv here because it's set once at module load time
  // by client-env.server.ts and should persist across test resets

  if (loadNewEnv) {
    // load the latest env
    loadEnv()
  }
}
