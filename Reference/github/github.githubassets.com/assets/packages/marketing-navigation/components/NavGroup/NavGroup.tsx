import {useId} from 'react'
import {clsx} from 'clsx'

import {Text} from '@primer/react-brand/esm'

import {NavLink, type NavLinkType} from '../NavLink/NavLink'

import styles from './NavGroup.module.css'

export type NavGroupType = {
  context?: string
  hasSeparator?: boolean
  items: NavLinkType[]
  render?: boolean
  title: string
}

export function NavGroup(props: NavGroupType) {
  const {title, items, render = true, hasSeparator = false, context} = props
  const titleId = useId()

  if (render === false) {
    return null
  }

  return (
    <div className={clsx(styles.group, {[styles.hasSeparator]: hasSeparator})}>
      <Text as="span" id={titleId} className={styles.title} font="monospace" variant="muted" size="100">
        {title}
      </Text>

      <ul className={styles.list} aria-labelledby={titleId}>
        {items.map(item => (
          <li key={item.title}>
            <NavLink {...item} context={context} />
          </li>
        ))}
      </ul>
    </div>
  )
}
