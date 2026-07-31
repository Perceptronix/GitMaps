// eslint-disable-next-line @github-ui/github-monorepo/prefer-github-ui-react-router
import {Link as RouterLink, matchRoutes, NavLink as RouterNavLink, resolvePath} from 'react-router'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {type ReactElement, use} from 'react'
import {type PreloadProps, PREVENT_AUTOFOCUS_KEY, type PreventAutofocusProp} from '../shared'
import {RoutesContext} from './use-navigate'
import {useLinkPreloadProps} from './use-link-preload-props'

type ExtendedLinkProps = React.ComponentProps<typeof RouterLink> & PreventAutofocusProp & PreloadProps
type ExtendedNavLinkProps = React.ComponentProps<typeof RouterNavLink> & PreventAutofocusProp & PreloadProps

function useResolvedReloadDocument(to: ExtendedLinkProps['to'], reloadDocument: boolean | undefined) {
  const {routes} = use(RoutesContext)
  const pathname = resolvePath(to, ssrSafeLocation.pathname).pathname
  return reloadDocument ?? !matchRoutes(routes, pathname)
}

function buildState(preventAutofocus: boolean | undefined, state: unknown) {
  return preventAutofocus ? {[PREVENT_AUTOFOCUS_KEY]: true, ...(state as object)} : state
}

/**
 * Inner Link that mounts preload hooks. Only rendered when preload is enabled.
 */
function PreloadableLink({to, reloadDocument, preventAutofocus, preload, preloadDelay, ...props}: ExtendedLinkProps) {
  const preloadProps = useLinkPreloadProps({
    to,
    preload,
    preloadDelay,
    disabled: !!reloadDocument,
  })

  return (
    <RouterLink
      to={to}
      {...preloadProps}
      {...props}
      state={buildState(preventAutofocus, props.state)}
      reloadDocument={reloadDocument}
    />
  )
}

/**
 * React Router Link that supports preventAutofocus and resolves
 * reloadDocument based on whether the target route is within the app's RoutesContext.
 *
 * Preload hooks are only mounted when the `preload` prop is set, so links that
 * don't opt in have zero hook overhead — important for pages with many links.
 */
export function ExtendedLink({preload, preloadDelay, preventAutofocus, ...props}: ExtendedLinkProps): ReactElement {
  const reloadDocument = useResolvedReloadDocument(props.to, props.reloadDocument)

  if (preload) {
    return (
      <PreloadableLink
        preload={preload}
        preloadDelay={preloadDelay}
        preventAutofocus={preventAutofocus}
        reloadDocument={reloadDocument}
        {...props}
      />
    )
  }

  return (
    <RouterLink
      {...props}
      to={props.to}
      state={buildState(preventAutofocus, props.state)}
      reloadDocument={reloadDocument}
    />
  )
}

/**
 * Inner NavLink that mounts preload hooks. Only rendered when preload is enabled.
 */
function PreloadableNavLink({
  to,
  reloadDocument,
  preventAutofocus,
  preload,
  preloadDelay,
  ...props
}: ExtendedNavLinkProps) {
  const preloadProps = useLinkPreloadProps({
    to,
    preload,
    preloadDelay,
    disabled: !!reloadDocument,
  })

  return (
    <RouterNavLink
      to={to}
      {...preloadProps}
      {...props}
      state={buildState(preventAutofocus, props.state)}
      reloadDocument={reloadDocument}
    />
  )
}

/**
 * React Router NavLink that supports preventAutofocus and resolves
 * reloadDocument based on whether the target route is within the app's RoutesContext.
 *
 * Preload hooks are only mounted when the `preload` prop is set.
 */
export function ExtendedNavLink({
  preload,
  preloadDelay,
  preventAutofocus,
  ...props
}: ExtendedNavLinkProps): ReactElement {
  const reloadDocument = useResolvedReloadDocument(props.to, props.reloadDocument)

  if (preload) {
    return (
      <PreloadableNavLink
        preload={preload}
        preloadDelay={preloadDelay}
        preventAutofocus={preventAutofocus}
        reloadDocument={reloadDocument}
        {...props}
      />
    )
  }

  return (
    <RouterNavLink
      {...props}
      to={props.to}
      state={buildState(preventAutofocus, props.state)}
      reloadDocument={reloadDocument}
    />
  )
}

// Re-export non-wrapped versions of Link and NavLink for use in cases where external
// route detection is not supported (e.g., Memex)
export {RouterNavLink as NavLink, RouterLink as Link}
