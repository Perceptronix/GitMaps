import {clsx} from 'clsx'
import {ActionMenu, ActionList, Link, Truncate, Token} from '@primer/react'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {
  CacheIcon,
  ContainerIcon,
  DatabaseIcon,
  FlameIcon,
  GraphIcon,
  KebabHorizontalIcon,
  LogIcon,
} from '@primer/octicons-react'
import type {TraceNode} from './types'

import styles from './NameWithDetails.module.css'

const timingFast = 100
const timingSlow = 500
const allocationsP99 = 300_000
const allocationsP95 = 100_000

type ExportData = {
  cleanTrace: TraceNode
  flamegraphData: string
}

const RequestType = {
  http_get: 'get',
  http_put: 'put',
  http_post: 'post',
  http_delete: 'delete',
  graphql_query: 'gql-query',
  graphql_mutation: 'gql-mutation',
  graphql_subscription: 'gql-subscription',
} as const

export type RequestType = (typeof RequestType)[keyof typeof RequestType]

type NameWithDetailsProps = {
  name: string
  type?: RequestType
  duration: number
  sqlQueriesCount: number
  allocationsCount: number
  traces: TraceNode
  cacheStatus?: 'HIT' | 'REFRESH'
}

export const NameWithDetails = ({
  name,
  type,
  duration,
  sqlQueriesCount,
  allocationsCount,
  traces,
  cacheStatus,
}: NameWithDetailsProps) => {
  const trailingVisual = type ? <Token text={type.toString()} /> : null
  const dataForExport = prepareDataForExport(traces)

  const onFlamegraphClick = async ({
    e,
    objectFlamegraph,
    vernier,
  }: {
    e: React.MouseEvent
    objectFlamegraph?: boolean
    vernier?: boolean
  }) => {
    e.preventDefault()
    e.stopPropagation()

    const url = traces['url'] as string
    const method = traces['method'] as string

    if (url && method) {
      let flamegraphParams = 'flamegraph=1&flamegraph_output=json&flamegraph_interval=500'
      flamegraphParams += objectFlamegraph ? '&flamegraph_mode=object' : ''
      flamegraphParams += vernier ? '&flamegraph_mode=vernier' : ''

      // make sure to remove the _tracing param to capture a trace without the tracing overhead
      const cleanUrl = url.replace(/([&\\?])_tracing=true/, '')
      const flamegraphUrl =
        cleanUrl.indexOf('?') < 0 ? `${cleanUrl}?${flamegraphParams}` : `${cleanUrl}&${flamegraphParams}`

      let response
      if (traces['verified_fetch']) {
        response = await verifiedFetch(flamegraphUrl, {
          method,
          cache: 'no-cache',
          headers: {
            accept: 'application/json',
          },
        })
      } else {
        response = await fetch(flamegraphUrl, {
          method,
          mode: 'no-cors',
          cache: 'no-cache',
          headers: {
            accept: 'application/json',
          },
        })
      }

      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = 'flamegraph.json'
      document.body.appendChild(a)
      a.click()
      a.remove()
    } else {
      alert('Unable to find url where to get flamegraph')
    }
  }

  const requestId = traces['request_id'] as string | undefined

  let cacheToken = null
  if (cacheStatus === 'HIT') {
    cacheToken = <Token leadingVisual={CacheIcon} text={'Hit'} />
  } else if (cacheStatus === 'REFRESH') {
    cacheToken = <Token leadingVisual={CacheIcon} text={'↺'} />
  }

  return (
    <div className={styles.NameWithDetailsContainer}>
      <Truncate expandable title={name} className={styles.NameWithDetailsTruncate}>
        {name}
      </Truncate>
      {cacheToken}
      {trailingVisual}
      <DatabaseDetail count={sqlQueriesCount} />
      <AllocationDetail count={allocationsCount} />
      <TimingDetail duration={duration} />
      {trailingVisual && (
        <LinksMenu
          name={name}
          isGraphqlQuery={type === RequestType.graphql_query || type === RequestType.graphql_mutation}
          cleanTrace={dataForExport.cleanTrace}
          onFlamegraphClick={onFlamegraphClick}
          requestId={requestId}
        />
      )}
    </div>
  )
}

export const TimingDetail = ({duration}: {duration: number}) => {
  const text = `${duration.toFixed(1)}ms`
  const colorClass =
    duration < timingFast
      ? styles.NameWithDetailsTokenSuccess
      : duration < timingSlow
        ? styles.NameWithDetailsTokenAttention
        : styles.NameWithDetailsTokenDanger

  return <Token text={text} className={clsx(styles.NameWithDetailsToken, colorClass)} />
}

type LinksMenuProps = {
  name: string
  cleanTrace: TraceNode
  isGraphqlQuery: boolean
  onFlamegraphClick: ({
    e,
    objectFlamegraph,
    vernier,
  }: {
    e: React.MouseEvent
    objectFlamegraph?: boolean
    vernier?: boolean
  }) => void
  requestId?: string
}

const LinksMenu = ({name, isGraphqlQuery, onFlamegraphClick, requestId}: LinksMenuProps) => {
  return (
    <ActionMenu>
      <ActionMenu.Anchor>
        <Token text={''} leadingVisual={KebabHorizontalIcon} className={styles.NameWithDetailsTokenPadded} />
      </ActionMenu.Anchor>
      <ActionMenu.Overlay width="medium">
        <ActionList showDividers>
          <ActionList.LinkItem
            download={`api-traces-${name}.json`}
            aria-label="Download Vernier flamegraph"
            onClick={(e: React.MouseEvent) => onFlamegraphClick({e, vernier: true})}
          >
            <ActionList.LeadingVisual>
              <FlameIcon />
            </ActionList.LeadingVisual>
            <div className={styles.NameWithDetailsBoxFontMedium}>Download Vernier flamegraph</div>
            <ActionList.Description variant={'block'}>
              JSON data for use with{' '}
              <Link inline href="https://vernier.prof">
                Vernier (Firefox) profiler
              </Link>
            </ActionList.Description>
          </ActionList.LinkItem>
          {isGraphqlQuery && (
            <ActionList.LinkItem href={getDataDogUrl(name)} target="_blank" aria-label="Datadog dashboard">
              <ActionList.LeadingVisual>
                <GraphIcon />
              </ActionList.LeadingVisual>
              <div className={styles.NameWithDetailsBoxFontMedium}>Datadog dashboard</div>
              <ActionList.Description variant={'block'}>
                View last week&apos;s data for this GraphQL query
              </ActionList.Description>
            </ActionList.LinkItem>
          )}
          {isGraphqlQuery && (
            <ActionList.LinkItem href={getDataDogApmUrl(name)} target="_blank" aria-label="Datadog APM logs">
              <ActionList.LeadingVisual>
                <LogIcon />
              </ActionList.LeadingVisual>
              <div className={styles.NameWithDetailsBoxFontMedium}>Datadog APM </div>
              <ActionList.Description variant={'block'}>
                View traces for this GraphQL query in DataDog APM
              </ActionList.Description>
            </ActionList.LinkItem>
          )}
          {requestId && (
            <ActionList.LinkItem href={getSplunkUrl(requestId)} target="_blank" aria-label="Splunk logs">
              <ActionList.LeadingVisual>
                <LogIcon />
              </ActionList.LeadingVisual>
              <div className={styles.NameWithDetailsBoxFontMedium}>Splunk logs</div>
              <ActionList.Description variant={'block'}>View logs for this query in Splunk</ActionList.Description>
            </ActionList.LinkItem>
          )}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}

const getDataDogUrl = (name: string) => {
  const operationName = name.toLowerCase()
  const to = Date.now().toString()
  const from = (Date.now() - 7 * 24 * 60 * 60 * 1000).toString()
  const params = new URLSearchParams()

  params.set('tpl_var_operation_name[0]', operationName)
  params.set('from_ts', from)
  params.set('to_ts', to)

  return `https://app.datadoghq.com/dashboard/vyc-z7e-fna?${params}`
}

const getDataDogApmUrl = (queryName: string) => {
  return `https://app.datadoghq.com/apm/traces?query=@graphql.operation.name:${queryName}`
}

const getSplunkUrl = (requestId: string) => {
  const to = Math.floor((Date.now() + 60 * 1000) / 1000).toString()
  const from = Math.floor((Date.now() - 60 * 1000) / 1000).toString()
  const params = new URLSearchParams()
  params.set('display.page.search.mode', 'verbose')
  params.set('q', `search index=* "${requestId}"`)
  params.set('dispatch.sample_ratio', '1')
  params.set('earliest', from)
  params.set('latest', to)

  return `https://splunk.githubapp.com/en-US/app/gh_reference_app/search?${params}`
}

export const DatabaseDetail = ({count}: {count: number}) => {
  if (count < 1) return null
  return <Token text={count.toString()} leadingVisual={DatabaseIcon} className={styles.NameWithDetailsToken} />
}

const AllocationDetail = ({count}: {count: number}) => {
  if (count < 1) return null

  const colorClass =
    count < allocationsP95
      ? styles.NameWithDetailsTokenSuccess
      : count < allocationsP99
        ? styles.NameWithDetailsTokenAttention
        : styles.NameWithDetailsTokenDanger

  return (
    <Token
      text={numberWithCommas(count)}
      leadingVisual={ContainerIcon}
      className={clsx(styles.NameWithDetailsToken, colorClass)}
    />
  )
}

function numberWithCommas(x: number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function prepareDataForExport(traces: TraceNode): ExportData {
  const cleanTrace = JSON.parse(JSON.stringify(traces))
  delete cleanTrace['flamegraph']
  return {
    cleanTrace,
    flamegraphData: traces['flamegraph'] as string,
  }
}
