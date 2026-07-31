import {TreeView, Link} from '@primer/react'
import {CopyToClipboardButton} from '@github-ui/copy-to-clipboard/Button'
import {DatabaseTreeItem, type SortType} from './DatabaseTreeItem'
import {NameWithDetails, DatabaseDetail} from './NameWithDetails'
import type {QueryLog, TraceNode} from './types'
import {
  findSqlQueries,
  groupMySqlQueriesByCluster,
  findSqlNPlusOne,
  findEsQueries,
  tryGetNumber,
  tryGetRemoteUrl,
  isGraphQLRequest,
  getRequestType,
} from './utils'

import styles from './PerformancePaneItem.module.css'
import {clsx} from 'clsx'

type PerformancePaneItemProps = {
  name: string
  isRoot?: boolean
  item: TraceNode
  sortType?: SortType
  threshold: number
  variables?: object
  showSubscriptionQueries?: boolean
  groupSqlByClusters?: boolean
  showFieldsPathInQueries?: boolean
  query_text?: string
}

export const PerformancePaneItem = ({
  name,
  isRoot,
  item,
  sortType,
  threshold,
  variables,
  showSubscriptionQueries,
  groupSqlByClusters,
  showFieldsPathInQueries,
  query_text,
}: PerformancePaneItemProps) => {
  const keys = Object.keys(item)

  const sqlQueries = new Array<QueryLog>()
  if (isRoot) {
    findSqlQueries(sqlQueries, item)
  }
  const allocationsCount = tryGetNumber(item, ['total/allocated_objects_count'], 0) || 0

  const groupedLogs = groupSqlByClusters ? groupMySqlQueriesByCluster(sqlQueries) : []

  const sqlNPlusOne = isRoot ? findSqlNPlusOne(item) : []

  const esQueries = new Array<QueryLog>()
  if (isRoot) {
    findEsQueries(esQueries, item)
  }

  if (parseInt(name, 10).toString() === name && typeof item['name'] === 'string') {
    name = item['name']
  }

  let nameElement: React.ReactElement = <span>{name}</span>
  let timing = tryGetNumber(item, ['total/duration_ms', '__trace/children_duration_ms', 'duration_ms'], threshold)

  const children = keys.filter(key => typeof item[key] === 'object' && (!timing || key !== 'total'))
  const values = getValues(item, name)

  if (!timing) {
    // If the element doesn't have timing info, try to get it by summing the duration for each **direct** child
    timing = sumChildrenTiming(children, item, threshold)
  }

  if (!timing) {
    return <></>
  }

  const type = getRequestType(name, item)
  if (!showSubscriptionQueries && isGraphQLRequest(item) && type === 'gql-subscription') {
    return <></>
  }

  let cacheStatus: 'HIT' | 'REFRESH' | undefined = undefined
  if (item['cache_result'] === 'hit') {
    cacheStatus = 'HIT'
  } else if (item['cache_result'] === 'refresh') {
    cacheStatus = 'REFRESH'
  }

  nameElement = (
    <NameWithDetails
      name={name}
      type={type}
      duration={timing}
      sqlQueriesCount={sqlQueries.length}
      allocationsCount={allocationsCount}
      traces={item}
      cacheStatus={cacheStatus}
    />
  )

  const valuesForSubTree = getValuesForSubtree(values)
  const subTree: Array<React.ReactElement | null> =
    valuesForSubTree.length > 0 ? buildSubTree(valuesForSubTree, item, name) : []

  const childPerformancePaneItems = children
    .filter(key => shouldIncludeChildItem(item[key] as TraceNode, key, threshold))
    .map(key => <PerformancePaneItem key={key} name={key} item={item[key] as TraceNode} threshold={threshold} />)

  return (
    <TreeView.Item key={name} id={`${name}-pane-item`}>
      {nameElement}
      {(subTree.length > 0 || isRoot || childPerformancePaneItems.length > 0) && (
        <TreeView.SubTree>
          {subTree}
          {isRoot && (
            <>
              <TreeView.Item id={`${name}-pane-query-item`}>
                query
                <TreeView.SubTree>
                  {query_text && (
                    <TreeView.Item id={`${name}-pane-query-text-item`}>
                      query_text
                      <TreeView.SubTree>
                        <TreeView.Item id={`${name}-pane-query-text-sub-item`}>
                          <div className={styles.PerformancePaneItemBox}>
                            <span className={styles.PerformancePaneItemText}>{query_text}</span>
                            <CopyToClipboardButton
                              tooltipProps={{direction: 'nw'}}
                              textToCopy={query_text}
                              ariaLabel="Copy to clipboard"
                              className={clsx('px-2 pt-1', styles.PerformancePaneItemCopyToClipboardButton)}
                            />
                          </div>
                        </TreeView.Item>
                      </TreeView.SubTree>
                    </TreeView.Item>
                  )}
                  <TreeView.Item id={`${name}-pane-query-variable-item`}>
                    query_variables
                    <TreeView.SubTree>
                      {variables &&
                        Object.entries(variables)
                          .filter(([, value]) => !!value)
                          .map(([key, value], index) => (
                            // eslint-disable-next-line @eslint-react/no-array-index-key
                            <TreeView.Item id={`${index}-pane-query-variable-item`} key={index}>
                              {key}: {value.toString()}
                            </TreeView.Item>
                          ))}
                    </TreeView.SubTree>
                  </TreeView.Item>
                </TreeView.SubTree>
              </TreeView.Item>
              {groupSqlByClusters && (
                <TreeView.Item id={`${name}-pane-mysql-item`}>
                  <div className={styles.PerformancePaneItemDetailsContainer}>
                    <span className={styles.PerformancePaneItemName}>mysql</span>
                    <span className={styles.PerformancePaneItemClusterCount}>
                      {Object.entries(groupedLogs).length} clusters
                    </span>
                    <DatabaseDetail count={sqlQueries.length} />
                  </div>
                  <TreeView.SubTree>
                    {Object.entries(groupedLogs)
                      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
                      .map(([key, value]) => (
                        <DatabaseTreeItem
                          key={key}
                          title={key}
                          queries={value}
                          nPlusOnes={sqlNPlusOne}
                          sort={sortType}
                          showFieldsPathInQueries={showFieldsPathInQueries}
                        />
                      ))}
                  </TreeView.SubTree>
                </TreeView.Item>
              )}
            </>
          )}
          {!groupSqlByClusters && (
            <DatabaseTreeItem
              title="mysql"
              queries={sqlQueries}
              nPlusOnes={sqlNPlusOne}
              sort={sortType}
              showFieldsPathInQueries={showFieldsPathInQueries}
            />
          )}
          <DatabaseTreeItem title="elastic search" queries={esQueries} nPlusOnes={[]} sort={sortType} />
          {childPerformancePaneItems}
        </TreeView.SubTree>
      )}
    </TreeView.Item>
  )
}

function sumChildrenTiming(children: string[], item: TraceNode, threshold: number) {
  let subTreeDuration = 0
  for (const key of children) {
    const duration = tryGetNumber(item[key], ['total/duration_ms', '__trace/children_duration_ms'], threshold)
    if (duration) {
      subTreeDuration += duration
    }
  }
  return subTreeDuration > 0 ? subTreeDuration : undefined
}

function getValues(item: TraceNode, name: string) {
  const keys = Object.keys(item)
  return keys.filter(key => typeof item[key] !== 'object' && item[key] !== name && key !== 'query_text')
}

function getValuesForSubtree(values: string[]): string[] {
  return values.filter(value => !(value === 'duration_ms' || value === 'children_duration_ms'))
}

function buildSubTree(values: string[], item: TraceNode, name: string): Array<React.ReactElement | null> {
  return values
    .map(key => {
      function getKeyValue() {
        const keyValue = item[key]
        switch (typeof keyValue) {
          case 'number': {
            if (key.endsWith('ms')) {
              return keyValue.toFixed(1)
            }
            return keyValue
          }
          case 'string': {
            const url = tryGetRemoteUrl(keyValue)
            if (url) {
              return (
                <Link target="_blank" href={url.remoteUrl}>
                  {url.relativePath}:{url.line}
                </Link>
              )
            }
            return keyValue
          }
          case 'object': {
            return JSON.stringify(keyValue)
          }
          case 'boolean': {
            return keyValue.toString()
          }
          default: {
            return keyValue
          }
        }
      }

      return (
        <TreeView.Item key={key} id={`${key}-${name}-pane-sub-item`}>
          <span className={styles.PerformancePaneItemText}>
            {key} {getKeyValue()}
          </span>
        </TreeView.Item>
      )
    })
    .filter(subTreeItem => subTreeItem !== null)
}

function shouldIncludeChildItem(item: TraceNode, name: string, threshold: number): boolean {
  const keys = Object.keys(item)
  const values = getValues(item, name)
  const timing = tryGetNumber(item, ['total/duration_ms', '__trace/children_duration_ms', 'duration_ms'], threshold)
  const children = keys.filter(key => typeof item[key] === 'object' && (!timing || key !== 'total'))

  const valuesForSubTree = getValuesForSubtree(values)
  const subTree: Array<React.ReactElement | null> =
    valuesForSubTree.length > 0 ? buildSubTree(valuesForSubTree, item, name) : []

  if (name === '__trace' && subTree.length === 0 && children.length === 0) {
    return false
  }
  return true
}
