import {clsx} from 'clsx'

import {ChevronRightIcon, LinkExternalIcon} from '@primer/octicons-react'
import type {Icon} from '@primer/octicons-react'

import {Text} from '@primer/react-brand/esm'

import {getAnalyticsEvent} from '@github-ui/swp-core/lib/utils/analytics'

import {useUrlContext} from '../../contexts/UrlContext'

import styles from './NavLink.module.css'

export type NavLinkType = {
  className?: string
  context?: string
  external?: boolean
  icon?: Icon
  label?: string
  render?: boolean
  subtitle?: string
  title: string
  url: string
  withArrow?: boolean
}

export function NavLink(props: NavLinkType) {
  const {shouldUseDotcomLinks} = useUrlContext()

  const {
    className,
    context,
    external = false,
    icon: IconComponent,
    label,
    render = true,
    subtitle,
    title,
    url,
    withArrow = false,
  } = props

  if (render === false) {
    return null
  }

  const resolvedUrl = shouldUseDotcomLinks && url.startsWith('/') ? `https://github.com${url}` : url

  const analyticsAttrs = {
    ...getAnalyticsEvent({
      action: title,
      tag: 'link',
      context: context || '',
      location: 'navbar',
    }),
  }

  if (external) {
    return (
      <a href={resolvedUrl} {...analyticsAttrs} className={styles.link} target="_blank" rel="noreferrer">
        <span className={styles.title}>{title}</span>

        <LinkExternalIcon size={16} className={styles.externalIcon} />
      </a>
    )
  }

  if (withArrow) {
    return (
      <a href={resolvedUrl} {...analyticsAttrs} className={styles.link}>
        <span className={styles.title}>{title}</span>

        <ChevronRightIcon size={16} className={styles.arrowIcon} />
      </a>
    )
  }

  if (subtitle || IconComponent || label) {
    return (
      <a href={resolvedUrl} {...analyticsAttrs} className={styles.link}>
        <div className={styles.text}>
          {IconComponent ? <IconComponent size={24} className={styles.icon} /> : null}

          <Text as="span" className={styles.title} size="200" weight="semibold">
            {title}

            {label ? <sup className={styles.label}>{label}</sup> : null}
          </Text>

          {subtitle ? (
            <Text as="span" className={styles.subtitle} variant="muted" size="200">
              {subtitle}
            </Text>
          ) : null}
        </div>
      </a>
    )
  }

  return (
    <a href={resolvedUrl} {...analyticsAttrs} className={clsx(styles.link, className)}>
      <span className={styles.title}>{title}</span>
    </a>
  )
}
