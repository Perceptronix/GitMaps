// eslint-disable-next-line @github-ui/github-monorepo/prefer-github-ui-react-router
import type {ScrollRestorationProps as ScrollRestorationPropsReactRouter} from 'react-router'
import {
  useIsTanStackRouter,
  Outlet as OutletTanStack,
  Link as LinkTanStack,
  NavLink as NavLinkTanStack,
} from './tanstack-router'
import {
  Outlet as OutletReactRouter,
  Link as LinkReactRouter,
  NavLink as NavLinkReactRouter,
  ExtendedLink as ExtendedLinkReactRouter,
  ExtendedNavLink as ExtendedNavLinkReactRouter,
  type LinkProps as LinkPropsReactRouter,
  type NavLinkProps as NavLinkPropsReactRouter,
  ScrollRestoration as ScrollRestorationReactRouter,
} from './react-router'
import type {PreventAutofocusProp, PreloadProps} from './shared'

type RefProp = {ref?: React.Ref<HTMLAnchorElement>}
type LinkProps = LinkPropsReactRouter & RefProp & PreloadProps
type NavLinkProps = NavLinkPropsReactRouter & RefProp & PreloadProps

/**
 * Export an Outlet based on the router context.
 *
 * TanStack Router's Outlet does not accept props, so we don't support them here.
 * No existing callsites use React Router Outlet props.
 */
export const Outlet = () => {
  const isTanstackContext = useIsTanStackRouter()
  if (isTanstackContext) {
    return <OutletTanStack />
  }
  return <OutletReactRouter />
}

export const Link = (props: LinkProps) => {
  const isTanstackContext = useIsTanStackRouter()
  if (isTanstackContext) {
    /** TSR Link always supports PreventAutofocusProp and external route detection */
    return <LinkTanStack {...props} />
  }
  return <LinkReactRouter {...props} />
}

export const NavLink = (props: NavLinkProps) => {
  const isTanstackContext = useIsTanStackRouter()
  if (isTanstackContext) {
    /** TSR NavLink always supports PreventAutofocusProp and external route detection */
    return <NavLinkTanStack {...props} />
  }
  return <NavLinkReactRouter {...props} />
}

/**
 * Link extended to support preventAutofocus and detect external routes.
 */
export const ExtendedLink = (props: LinkProps & PreventAutofocusProp) => {
  const isTanstackContext = useIsTanStackRouter()
  if (isTanstackContext) {
    /** TSR Link always supports PreventAutofocusProp and external route detection */
    return <LinkTanStack {...props} />
  }
  return <ExtendedLinkReactRouter {...props} />
}

/**
 * NavLink extended to support preventAutofocus and detect external routes.
 */
export const ExtendedNavLink = (props: NavLinkProps & PreventAutofocusProp) => {
  const isTanstackContext = useIsTanStackRouter()
  if (isTanstackContext) {
    /** TSR NavLink always supports PreventAutofocusProp and external route detection */
    return <NavLinkTanStack {...props} />
  }
  return <ExtendedNavLinkReactRouter {...props} />
}

export const ScrollRestoration = (props: ScrollRestorationPropsReactRouter) => {
  const isTanstackContext = useIsTanStackRouter()
  if (isTanstackContext) {
    // TanStack Router scroll restoration is configured at the router level.
    return null
  }
  return <ScrollRestorationReactRouter {...props} />
}
