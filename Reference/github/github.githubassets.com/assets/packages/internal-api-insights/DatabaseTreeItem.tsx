import {Token, Link, TreeView} from '@primer/react'
import {RowsIcon, AlertFillIcon} from '@primer/octicons-react'
import {DatabaseDetail, TimingDetail} from './NameWithDetails'
import type {QueryLog, TraceNode} from './types'
import {getLinkFromBacktrace} from './utils'

import styles from './DatabaseTreeItem.module.css'

export type SortType = 'none' | 'duration' | 'resultCount'

type DatabaseTreeItemProps = {
  title: string
  queries: QueryLog[]
  nPlusOnes: TraceNode[]
  sort?: SortType
  showFieldsPathInQueries?: boolean
}

function querySummary(query: QueryLog): string {
  let fallbacks = 'unknown'
  if (query.fallbacks?.length) {
    fallbacks = query.fallbacks.join(', ')
  }
  return `${query.duration.toFixed(2)}ms, ${query.result} results, fallbacks: ${fallbacks}`
}

export const DatabaseTreeItem = ({title, queries, nPlusOnes, sort, showFieldsPathInQueries}: DatabaseTreeItemProps) => {
  const totalTime = queries.reduce((acc, cur) => acc + cur.duration, 0)
  const totalResults = queries.reduce((acc, cur) => acc + (cur.result ?? 0), 0)

  if (queries.length === 0) {
    return null
  }

  const sortedQueries = sortQueries(queries, sort)

  return (
    <TreeView.Item id={`${title}-database-item`}>
      <div className={styles.DatabaseTreeItemBox}>
        <span className={styles.DatabaseTreeItemText}>{title}</span>
        <DatabaseDetail count={queries.length} />
        {nPlusOnes.length > 0 && (
          <Token
            text={`${nPlusOnes.length} N+1`}
            leadingVisual={AlertFillIcon}
            className={styles.DatabaseTreeItemToken}
          />
        )}
        <Token
          text={totalResults.toString()}
          leadingVisual={RowsIcon}
          className={styles.DatabaseTreeItemTokenSecondary}
        />
        <TimingDetail duration={totalTime} />
      </div>
      <TreeView.SubTree>
        {sortedQueries.map(query => (
          <TreeView.Item key={query.query} id={`${query.query}-query-item`}>
            <div>
              <Link
                target="_blank"
                href={getLinkFromBacktrace(query.backtrace)}
                muted
                className={styles.DatabaseTreeItemLink}
              >
                {query.query}
              </Link>
              <br />
              {showFieldsPathInQueries && <span className={styles.DatabaseTreeItemTextMuted}>{query.path}</span>}
              <div className={styles.DatabaseTreeItemBoxNested}>
                <span className={styles.DatabaseTreeItemTextSmallMuted}>{querySummary(query)}</span>
                {nPlusOneHitsCount(query, nPlusOnes) > 0 && (
                  <Token
                    text={`${nPlusOneHitsCount(query, nPlusOnes)} N+1`}
                    leadingVisual={AlertFillIcon}
                    className={styles.DatabaseTreeItemTokenAttention}
                  />
                )}
              </div>
            </div>
          </TreeView.Item>
        ))}
      </TreeView.SubTree>
    </TreeView.Item>
  )
}

function sortQueries(queries: QueryLog[], sort: SortType | undefined) {
  switch (sort) {
    case 'duration':
      return [...queries].sort((a, b) => b.duration - a.duration)
    case 'resultCount':
      return [...queries].sort((a, b) => (b.result ?? 0) - (a.result ?? 0))
    default:
      return queries
  }
}

function nPlusOneHitsCount(query: QueryLog, nPlusOnes: TraceNode[]) {
  const nPlusOne = nPlusOnes?.find(n => n['sql'] === query.digested_query)
  return nPlusOne ? nPlusOne.count : 0
}
