import {
  APPEND_AND_FOCUS_EVENT,
  type AppendAndFocusEventDetail,
  PROVIDE_FEEDBACK_EVENT,
  REACT_CONNECTED_EVENT,
  REACT_DISCONNECTED_EVENT,
  RETRANSMIT_REACT_EVENT,
  SAVE_QUERY_AS_CUSTOM_SCOPE_EVENT,
  SEARCH_EVENT,
  type SearchEventDetail,
  SET_GLOBAL_NAV_VISIBILITY_EVENT,
  UPDATE_INPUT_EVENT,
} from './search-bar-events'

/*
 * Trigger the search bar to append a query to the current query and focus it
 * (used by faceting to suggest further facets)
 */
export function appendAndFocusSearchBar({
  appendQuery,
  retainScrollPosition,
  returnTarget,
}: AppendAndFocusEventDetail): void {
  window.dispatchEvent(
    new CustomEvent(APPEND_AND_FOCUS_EVENT, {
      detail: {
        appendQuery,
        retainScrollPosition,
        returnTarget,
      },
    }),
  )
}

/**
 * Ask any mounted React search-results page to re-announce itself (it replies
 * with `REACT_CONNECTED_EVENT`). Dispatched by the search bar on startup.
 */
export function dispatchRetransmitReact(): void {
  window.dispatchEvent(new CustomEvent(RETRANSMIT_REACT_EVENT))
}

/**
 * Ask a mounted React search-results page to run `search` via a soft client
 * navigation. `searchParams` values of `undefined` clear that param from the URL.
 */
export function dispatchSearch(search: string, searchParams?: SearchEventDetail['searchParams']): void {
  window.dispatchEvent(new CustomEvent<SearchEventDetail>(SEARCH_EVENT, {detail: {search, searchParams}}))
}

/**
 * Tell the search bar that a React results page is now mounted (reply to
 * {@link RETRANSMIT_REACT_EVENT} / dispatched by the page on mount).
 */
export function dispatchReactConnected(): void {
  window.dispatchEvent(new CustomEvent(REACT_CONNECTED_EVENT))
}

/**
 * Tell the search bar that the React results page is unmounting (e.g. during a
 * soft navigation away).
 */
export function dispatchReactDisconnected(): void {
  window.dispatchEvent(new CustomEvent(REACT_DISCONNECTED_EVENT))
}

/**
 * Tell the search bar to show or hide the global nav while the search UI is active.
 */
export function dispatchSetGlobalNavVisibility(visible: boolean): void {
  window.dispatchEvent(new CustomEvent(SET_GLOBAL_NAV_VISIBILITY_EVENT, {detail: visible}))
}

/**
 * Reflect an updated search back into the search bar's input.
 */
export function dispatchUpdateInput(search: string): void {
  window.dispatchEvent(new CustomEvent<string>(UPDATE_INPUT_EVENT, {detail: search}))
}

/**
 * Trigger the search bar's "provide feedback" dialog.
 */
export function dispatchProvideFeedback(): void {
  window.dispatchEvent(new CustomEvent(PROVIDE_FEEDBACK_EVENT))
}

/**
 * Ask the search bar to save the current query as a custom scope. `returnTarget`
 * is the element focus should return to when the dialog closes.
 */
export function dispatchSaveQueryAsCustomScope(returnTarget: HTMLElement): void {
  window.dispatchEvent(new CustomEvent(SAVE_QUERY_AS_CUSTOM_SCOPE_EVENT, {detail: returnTarget}))
}
