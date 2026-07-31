import {useId} from 'react'
import {clsx} from 'clsx'

import {ChevronRightIcon} from '@primer/octicons-react'

import {NavGroup, type NavGroupType} from '../NavGroup/NavGroup'
import {NavLink} from '../NavLink/NavLink'
import type {NavLinkType} from '../NavLink/NavLink'

import {useDropdownDisclosure} from './use-dropdown-disclosure'
import {useDropdownPositioning} from './use-dropdown-positioning'

import styles from './NavDropdown.module.css'

export type NavDropdownType = {
  groups: NavGroupType[]
  render?: boolean
  title: string
  trailingLink?: NavLinkType
}

type NavDropdownProps = NavDropdownType & {
  isOpen?: boolean
  onOpenChange?: (nextOpen: boolean) => void
}

export function NavDropdown(props: NavDropdownProps) {
  const {title, groups, render = true, trailingLink, isOpen = false, onOpenChange} = props

  const panelId = useId()

  const {containerRef, dropdownRef, buttonRef, containerHandlers, onButtonClick} = useDropdownDisclosure({
    isOpen,
    onOpenChange,
  })

  useDropdownPositioning(containerRef, dropdownRef, isOpen)

  if (render === false) {
    return null
  }

  return (
    // Container handlers only add dismissal affordances (Escape, focus-out, mouse-leave); the button
    // is the interactive control, so the wrapper intentionally has no role.
    <div
      ref={containerRef}
      className={clsx(styles.container, {
        // Global `open` class drives the CSS open state, derived from React state.
        // eslint-disable-next-line @github-ui/github-monorepo/no-global-classname-literals
        open: isOpen,
      })}
      {...containerHandlers}
    >
      <button
        ref={buttonRef}
        type="button"
        className={clsx(styles.button)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onButtonClick}
      >
        {title}

        <ChevronRightIcon className={clsx(styles.buttonIcon)} />
      </button>

      <div ref={dropdownRef} id={panelId} className={clsx(styles.dropdown)}>
        <ul className={styles.list}>
          {groups.map(group => (
            <li key={group.title}>
              <NavGroup {...group} context={title} />
            </li>
          ))}
        </ul>

        {trailingLink ? (
          <div className={styles.trailingLinkContainer}>
            <NavLink {...trailingLink} context={title} withArrow />
          </div>
        ) : null}
      </div>
    </div>
  )
}
