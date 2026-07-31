import React, {useCallback, useState, useRef, useMemo} from 'react'
import {
  Overlay,
  Heading,
  TextInput,
  IconButton,
  ActionMenu,
  ActionList,
  TreeView,
  FormControl,
  Button,
} from '@primer/react'

import {
  GraphIcon,
  DownloadIcon,
  TrashIcon,
  XIcon,
  SortDescIcon,
  KebabHorizontalIcon,
  DatabaseIcon,
  EyeClosedIcon,
  EyeIcon,
  NoEntryIcon,
} from '@primer/octicons-react'
import {noop} from '@github-ui/noop'
import {PerformancePaneItem} from './PerformancePaneItem'
import type {TraceData} from './types'
import type {SortType} from './DatabaseTreeItem'
import {ssrSafeWindow} from '@github-ui/ssr-utils'
import {useMediaQuery} from '@github-ui/use-media-query'
import {TraceDataKey, TraceDataRefreshCallbackKey} from '@github-ui/api-insights-tracing'
import {isGraphQLRequest} from './utils'

import styles from './PerformancePane.module.css'
import {announce} from '@github-ui/aria-live'
import {ClustersDisabler} from './ClustersDisabler'

const topMargin = 110

export const PerformancePane = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [isSqlGrouped, setIsSqlGrouped] = useState(false)
  const [showFieldsPathInQueries, setShowFieldsPathInQueries] = useState(false)
  const [sortType, setSortType] = useState<SortType>('none')
  const [threshold, setThreshold] = useState(0)
  // Small viewport if width < 768px or height < 400px. A media query fires only
  // when a breakpoint is crossed, unlike a ResizeObserver on document.body which
  // reacts to every layout change.
  const isSmallViewport = useMediaQuery('(max-width: 767px), (max-height: 399px)')
  const noButtonRef = useRef(null)
  const anchorRef = useRef(null)
  const apiInsightsButtonRef = useRef<HTMLButtonElement | null>(null)
  const openedByUserRef = useRef(false)
  const [showSubscriptionQueries, setShowSubscriptionQueries] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rootWindowContent = ssrSafeWindow as {[key: string]: any}

  if (!rootWindowContent[TraceDataKey]) {
    // eslint-disable-next-line react-hooks/immutability
    rootWindowContent[TraceDataKey] = []
  }

  const [traces, setTraces] = useState<TraceData>([...(rootWindowContent[TraceDataKey] as TraceData)])

  const handleUserOpen = useCallback(() => {
    openedByUserRef.current = true
    setIsOpen(true)
  }, [])

  React.useEffect(() => {
    if (isOpen) return

    if (openedByUserRef.current) {
      if (apiInsightsButtonRef.current) {
        apiInsightsButtonRef.current.focus()
      }
    } else {
      const urlParams = new URLSearchParams(window.location.search)
      const hasStaffbarParam = urlParams.get('staffbar') === 'true'
      if (hasStaffbarParam) {
        const triggerElement = document.getElementById('enable-api-insights-button')
        if (triggerElement) {
          triggerElement.focus()
        }
      }
    }
    openedByUserRef.current = false
  }, [isOpen])

  // eslint-disable-next-line react-hooks/immutability
  rootWindowContent[TraceDataRefreshCallbackKey] = useCallback(() => {
    // spread the array in a new one to force a re-render since this callback is
    // being used outside of the react world
    setTraces([...(rootWindowContent[TraceDataKey] as TraceData)])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const clearTraces = useCallback(() => {
    setTraces([])
    rootWindowContent[TraceDataKey] = []
  }, [rootWindowContent])

  const sortLabel = (sType: SortType) => {
    switch (sType) {
      case 'duration':
        return 'by duration'
      case 'resultCount':
        return 'by count'
      default:
        return 'by time'
    }
  }

  // Calculate responsive positioning
  const overlayProps = useMemo(() => {
    if (isSmallViewport) {
      // For small viewports, position with margins but keep as overlay
      return {
        overflow: 'auto' as const,
        top: 10,
        left: 10,
        style: {
          width: 'calc(100vw - 15px)',
          maxHeight: 'calc(100vh - 20px)',
        },
      }
    } else {
      // For larger viewports, use current positioning
      return {
        width: 'xlarge' as const,
        height: 'auto' as const,
        top: topMargin,
        left: Math.max(10, window.innerWidth - 640), // Ensure minimum 10px from left edge
      }
    }
  }, [isSmallViewport])

  // Check if there are any GraphQL requests in the traces
  const hasGraphQLRequests = useMemo(() => {
    return traces.some(trace => isGraphQLRequest(trace))
  }, [traces])

  if (!traces) {
    return null
  }

  if (!isOpen) {
    return (
      <Button
        ref={apiInsightsButtonRef}
        leadingVisual={GraphIcon}
        onClick={handleUserOpen}
        className={styles.PerformancePaneButton}
      >
        API insights
      </Button>
    )
  }

  return (
    <Overlay
      initialFocusRef={noButtonRef}
      returnFocusRef={anchorRef}
      ignoreClickRefs={[anchorRef]}
      onEscape={() => setIsOpen(!isOpen)}
      onClickOutside={noop}
      role="dialog"
      aria-label="API insights dialog"
      {...overlayProps}
      className={styles.PerformancePaneOverlay}
    >
      <div className={styles.PerformancePaneBox}>
        <div className={styles.PerformancePaneHeaderContainer}>
          <GraphIcon />
          <Heading as="h2" className={styles.PerformancePaneHeading}>
            API insights
          </Heading>

          <div className={styles.PerformancePaneControlsContainer}>
            <FormControl className={styles.PerformancePaneFormControl}>
              <FormControl.Label className={styles.PerformancePaneFormControlLabel}>Threshold</FormControl.Label>
              <TextInput
                name="threshold"
                size="small"
                trailingVisual="ms"
                placeholder="threshold"
                onChange={event => {
                  const newThreshold = parseFloat(event.target.value)
                  setThreshold(isNaN(newThreshold) ? 0 : newThreshold)
                }}
                aria-label="Threshold for filtering items by duration"
                className={styles.PerformancePaneTextInput}
              />
            </FormControl>
            <Button
              size="small"
              onClick={() => {
                setSortType(currentSort => {
                  let newSort: SortType
                  switch (currentSort) {
                    case 'none':
                      newSort = 'duration'
                      break
                    case 'duration':
                      newSort = 'resultCount'
                      break
                    case 'resultCount':
                      newSort = 'none'
                      break
                  }
                  announce(`Sorting ${sortLabel(newSort)}`, {assertive: true})
                  return newSort
                })
              }}
              leadingVisual={SortDescIcon}
              className={styles.PerformancePaneSortButton}
            >
              {sortLabel(sortType)}
            </Button>

            <ActionMenu>
              <ActionMenu.Anchor>
                <IconButton icon={KebabHorizontalIcon} size="small" aria-label="Open more options" />
              </ActionMenu.Anchor>
              <ActionMenu.Overlay width="medium">
                <ActionList showDividers>
                  <ActionList.LinkItem onClick={clearTraces}>
                    <TrashIcon />
                    <span className={styles.PerformancePaneActionMenuText}>Clear</span>
                  </ActionList.LinkItem>
                  <ActionList.LinkItem
                    href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(traces))}`}
                    download="api-traces.json"
                  >
                    <DownloadIcon />
                    <span className={styles.PerformancePaneActionMenuText}>Download</span>
                  </ActionList.LinkItem>
                  {hasGraphQLRequests && (
                    <ActionList.LinkItem onClick={() => setShowSubscriptionQueries(!showSubscriptionQueries)}>
                      {showSubscriptionQueries ? <EyeClosedIcon /> : <EyeIcon />}
                      <span className={styles.PerformancePaneActionMenuText}>
                        {showSubscriptionQueries ? 'Hide subscription queries' : 'Show subscription queries'}
                      </span>
                    </ActionList.LinkItem>
                  )}
                  <ActionList.LinkItem onClick={() => setIsSqlGrouped(!isSqlGrouped)}>
                    <DatabaseIcon />
                    <span className={styles.PerformancePaneActionMenuText}>
                      {isSqlGrouped ? 'Ungroup MySQL queries by cluster' : 'Group MySQL queries by cluster'}
                    </span>
                  </ActionList.LinkItem>
                  {hasGraphQLRequests && (
                    <ActionList.LinkItem onClick={() => setShowFieldsPathInQueries(!showFieldsPathInQueries)}>
                      <DatabaseIcon />
                      <span className={styles.PerformancePaneActionMenuText}>
                        {showFieldsPathInQueries
                          ? 'Hide GraphQL fields path in queries'
                          : 'Show GraphQL fields path in queries'}
                      </span>
                    </ActionList.LinkItem>
                  )}
                  <ActionMenu>
                    <ActionMenu.Anchor>
                      <ActionList.Item>
                        <div className={styles.PerformancePaneActionMenuItemBox}>
                          <NoEntryIcon />
                          <span className={styles.PerformancePaneActionMenuTextFlex}>Disable clusters</span>
                        </div>
                      </ActionList.Item>
                    </ActionMenu.Anchor>
                    <ActionMenu.Overlay>
                      <ClustersDisabler traces={traces} />
                    </ActionMenu.Overlay>
                  </ActionMenu>
                </ActionList>
              </ActionMenu.Overlay>
            </ActionMenu>
            <IconButton
              size="small"
              onClick={() => setIsOpen(false)}
              icon={XIcon}
              aria-label="Close"
              tooltipDirection="n"
            />
          </div>
        </div>
        <div className={styles.PerformancePaneTreeContainer}>
          <nav aria-label="Files" className={styles.PerformancePaneTreeNav}>
            <TreeView aria-label="Files">
              {traces.map((trace, index) => (
                <PerformancePaneItem
                  // eslint-disable-next-line @eslint-react/no-array-index-key
                  key={index}
                  name={trace['query_name'] as string}
                  variables={trace['query_variables'] as object}
                  item={trace}
                  isRoot
                  sortType={sortType}
                  threshold={threshold}
                  showSubscriptionQueries={showSubscriptionQueries}
                  groupSqlByClusters={isSqlGrouped}
                  showFieldsPathInQueries={showFieldsPathInQueries}
                  query_text={trace['query_text'] as string}
                />
              ))}
            </TreeView>
          </nav>
        </div>
      </div>
    </Overlay>
  )
}
