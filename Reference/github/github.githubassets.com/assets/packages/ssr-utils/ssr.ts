import {ssrSafeDocument} from './ssr-globals'

/***
 * Are we rendering on the server?
 */
export const IS_SERVER = typeof ssrSafeDocument === 'undefined'

/***
 * Are we rendering on the client?
 */
export const IS_BROWSER = !IS_SERVER

/***
 * This helper returns `true` if:
 * - we are rendering on the server
 * - we are on the client, and the app has been hydrated from a server-render
 */
export function wasServerRendered() {
  if (IS_SERVER || !ssrSafeDocument) {
    return true
  }

  // The UI Service (TanStack Start) renders this marker on the root <html>
  // element: `'true'` for the initial server-rendered document (present from SSR,
  // before any client JS runs) and `'false'` once a client-side soft navigation
  // has occurred (see RootComponent). Its presence distinguishes a UI Service page
  // from a dotcom page, so we can branch on it without importing
  // @github-ui/runtime-environment (which imports this module and would create a
  // cycle).
  const uiServiceSsr = ssrSafeDocument.documentElement.getAttribute('data-render-ssr')
  if (uiServiceSsr !== null) {
    return uiServiceSsr === 'true'
  }

  return Boolean(
    ssrSafeDocument.querySelector('react-app[data-ssr="true"]') ||
    ssrSafeDocument.querySelector('react-partial[data-ssr="true"][partial-name="repos-overview"]'),
  )
}
