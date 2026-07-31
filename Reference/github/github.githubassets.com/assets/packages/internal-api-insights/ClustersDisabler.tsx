import {ActionList} from '@primer/react'
import {CheckIcon, NoEntryIcon} from '@primer/octicons-react'

import {getAllUsedClusters} from './utils'
import type {TraceData} from './types'
import {isClusterDisabled, toggleClusterState} from '@github-ui/api-insights-tracing'

import styles from './ClustersDisabler.module.css'

type ClustersDisablerProps = {
  traces: TraceData
}

export const ClustersDisabler = ({traces}: ClustersDisablerProps) => {
  const usedClusters = getAllUsedClusters(traces)

  return (
    <ActionList>
      {usedClusters.length === 0 ? (
        <ActionList.Item disabled>No clusters found</ActionList.Item>
      ) : (
        usedClusters.map((cluster, index) => (
          // eslint-disable-next-line @eslint-react/no-array-index-key
          <ActionList.Item key={index} onSelect={() => toggleClusterState(cluster)}>
            <div className={styles.ClustersDisablerBox}>
              <span className={styles.ClustersDisablerText}>{cluster}</span>
              {isClusterDisabled(cluster) ? <NoEntryIcon /> : <CheckIcon />}
            </div>
          </ActionList.Item>
        ))
      )}
    </ActionList>
  )
}
