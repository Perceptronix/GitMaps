import {useCallback, useEffect, useState} from 'react'

import {NavDropdown} from './components/NavDropdown/NavDropdown'
import {NavLink} from './components/NavLink/NavLink'

import {UrlProvider} from './contexts/UrlContext'

import {getMarketingNavigationData} from './marketing-navigation.data'
import type {MarketingNavigationProps} from './marketing-navigation.types'
import styles from './MarketingNavigation.module.css'

export function MarketingNavigation(props: MarketingNavigationProps) {
  const {should_use_dotcom_links: shouldUseDotcomLinks = false} = props

  const data = getMarketingNavigationData()

  // Single source of truth for the open dropdown, so only one is open at a time (replaces the legacy
  // global `header.ts` coordination). Keyed by a stable position-derived id, not localized title text.
  const [openId, setOpenId] = useState<string | null>(null)

  const handleOpenChange = useCallback((id: string, nextOpen: boolean) => {
    // Race-safe close: a stale close from a previously-open dropdown must not clear a sibling that
    // just opened, so only clear when this id is still the open one.
    setOpenId(current => (nextOpen ? id : current === id ? null : current))
  }, [])

  // Nav-level Escape dismissal (WCAG 1.4.13). A hover-opened dropdown can have focus outside it, so
  // Escape never reaches its container handler. This document listener runs only while a dropdown is
  // open and closes it regardless of focus. Capture phase runs before the marketing-header's
  // bubble-phase handler, and `stopPropagation` keeps this first Escape local — once closed the
  // listener is torn down, so a second Escape reaches the header.
  useEffect(() => {
    if (openId === null) return

    function handleDocumentEscape(event: KeyboardEvent) {
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      setOpenId(null)
    }

    document.addEventListener('keydown', handleDocumentEscape, {capture: true})
    return () => document.removeEventListener('keydown', handleDocumentEscape, {capture: true})
  }, [openId])

  return (
    <UrlProvider shouldUseDotcomLinks={shouldUseDotcomLinks}>
      <nav className={styles.nav} aria-label="Global">
        <ul className={styles.list}>
          {data.map((item, index) => {
            const id = `marketing-nav-item-${index}`

            return (
              <li key={item.title}>
                {'groups' in item ? (
                  <NavDropdown
                    {...item}
                    isOpen={openId === id}
                    onOpenChange={nextOpen => handleOpenChange(id, nextOpen)}
                  />
                ) : (
                  <NavLink {...item} context={item.title} className={styles.navLink} />
                )}
              </li>
            )
          })}
        </ul>
      </nav>
    </UrlProvider>
  )
}
