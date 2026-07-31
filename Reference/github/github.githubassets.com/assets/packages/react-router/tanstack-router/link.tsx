import {useLinkProps, useRouter, Link as TanStackLink} from '@tanstack/react-router'
import type {To} from './use-navigate'
import type {AnchorHTMLAttributes, CSSProperties, ReactNode, Ref} from 'react'
import {isExternalToApp} from './is-external-to-app'
import {PREVENT_AUTOFOCUS_KEY, type PreloadProps, type PreventAutofocusProp} from '../shared'

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement>, PreventAutofocusProp, PreloadProps {
  to: To
  reloadDocument?: boolean
  replace?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state?: any
}
type NavLinkRenderProps = {isActive: boolean; isPending: boolean; isTransitioning: boolean}
interface NavLinkProps extends Omit<LinkProps, 'className' | 'style' | 'children'> {
  children?: ReactNode | ((props: NavLinkRenderProps) => ReactNode)
  className?: string | ((props: NavLinkRenderProps) => string | undefined)
  style?: CSSProperties | ((props: NavLinkRenderProps) => CSSProperties | undefined)
  end?: boolean
}

// Intentionally strip `href` from `props`. Primer's `as={Link}` pattern passes `href` which would
// override TanStack Link's internal href generation from the `to` prop
export function Link({
  ref,
  to,
  href: _href,
  reloadDocument,
  preventAutofocus,
  children,
  ...props
}: LinkProps & {ref?: Ref<HTMLAnchorElement>}) {
  const router = useRouter()
  const resolvedTo = toTanstackPathString(to, router.state.location.pathname)
  const shouldReload = Boolean(reloadDocument) || (!!to && isExternalToApp(router, resolvedTo))
  const resolvedState = preventAutofocus
    ? {
        [PREVENT_AUTOFOCUS_KEY]: true,
        ...props.state,
      }
    : props.state

  // If reloadDocument is true, render a regular anchor tag
  if (shouldReload) {
    const {state: _state, replace: _replace, preload, preloadDelay, ...anchorProps} = props
    return (
      <a {...anchorProps} href={resolvedTo} ref={ref}>
        {children}
      </a>
    )
  }

  // TanStack Router expects 'to' as a string path.
  // Note: We intentionally discard 'href' above because TanStack Router uses 'href' as an
  // alternative navigation target that takes precedence in buildAndCommitLocation. This conflicts
  // with Primer's UnderlineNav.Item, which always passes href (defaulting to "#") alongside our 'to' prop.
  // The problem is with UnderlineNav, and this shim is a workaround for that (the TSRouter link behavior is
  // reasonable).
  return (
    <TanStackLink to={resolvedTo} ref={ref} {...props} state={resolvedState}>
      {children}
    </TanStackLink>
  )
}

// Intentionally strip `href` from `props`. Primer's `as={Link}` pattern passes `href` which would
// override TanStack Link's internal href generation from the `to` prop
export function NavLink({
  ref,
  to,
  end,
  href: _href,
  className,
  style,
  children,
  reloadDocument,
  preventAutofocus,
  ...props
}: NavLinkProps & {ref?: Ref<HTMLAnchorElement>}) {
  const router = useRouter()
  const resolvedTo = toTanstackPathString(to, router.state.location.pathname)
  const isExternal = !!to && isExternalToApp(router, resolvedTo)
  const shouldReload = Boolean(reloadDocument) || isExternal
  const resolvedState = preventAutofocus
    ? {
        [PREVENT_AUTOFOCUS_KEY]: true,
        ...props.state,
      }
    : props.state

  const linkProps = useLinkProps({
    ...props,
    state: resolvedState,
    to: resolvedTo,
    // React Router `end` means "only active on exact match"; TSR expresses this as `activeOptions.exact`.
    activeOptions: {exact: end},
  })

  // React Router's NavLink supports render functions for className, style, and children
  // based on the active state.
  const dataStatus = 'data-status' in linkProps ? linkProps['data-status'] : undefined
  const isActive = dataStatus === 'active' && !isExternal
  const state = {isActive, isPending: false, isTransitioning: false}
  const resolvedClassName = typeof className === 'function' ? className(state) : className
  const resolvedStyle = typeof style === 'function' ? style(state) : style
  const resolvedChildren = typeof children === 'function' ? children(state) : children

  const {state: _state, replace: _replace, preload, preloadDelay, ...anchorProps} = props
  const resolvedProps = {
    ...anchorProps,
    // If shouldReload is true, we'll render a regular anchor tag without useLinkProps output
    ...(shouldReload ? {href: resolvedTo} : linkProps),
    className: resolvedClassName,
    style: resolvedStyle,
    ref,
  }

  return <a {...resolvedProps}>{resolvedChildren}</a>
}

function toTanstackPathString(to: To, defaultPathname: string): string {
  if (typeof to === 'string') {
    return to
  }
  const {pathname = defaultPathname, search = '', hash = ''} = to
  const normalizedSearch = search ? (search.startsWith('?') ? search : `?${search}`) : ''
  const normalizedHash = hash ? (hash.startsWith('#') ? hash : `#${hash}`) : ''
  return `${pathname}${normalizedSearch}${normalizedHash}`
}

/**
 * Extended and base versions support the same behavior in TanStack router context.
 */
export {Link as ExtendedLink, NavLink as ExtendedNavLink}
