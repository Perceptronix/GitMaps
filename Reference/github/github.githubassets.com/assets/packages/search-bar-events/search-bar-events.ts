/**
 * Shared window-event names for the search-bar <-> results-page contract.
 *
 * Two peers talk over these events:
 * - the search bar (legacy `<qbsearch-input>` or the new QuickSearch), and
 * - the React search results page (`useSearchBarEvents`).
 *
 * Both import the names from here so the string literals can never drift apart.
 */

/** Bar -> page: "are you mounted?" (bar asks on mount). */
export const RETRANSMIT_REACT_EVENT = 'blackbird_monolith_retransmit_react'
/** Page -> bar: "I'm mounted" (reply to retransmit / on page mount). */
export const REACT_CONNECTED_EVENT = 'blackbird_monolith_react_connected'
/** Page -> bar: "I'm unmounting" (e.g. during a soft navigation away). */
export const REACT_DISCONNECTED_EVENT = 'blackbird_monolith_react_disconnected'
/** Bar -> page: run this search via a soft client navigation. */
export const SEARCH_EVENT = 'blackbird_monolith_search'
/** Page -> bar: reflect this query back into the bar's input. */
export const UPDATE_INPUT_EVENT = 'blackbird_monolith_update_input'
/** Page -> bar: show/hide the global nav while the search UI is active. */
export const SET_GLOBAL_NAV_VISIBILITY_EVENT = 'blackbird_monolith_set_global_nav_visibility'
/** Page -> bar: open the "provide feedback" dialog. */
export const PROVIDE_FEEDBACK_EVENT = 'blackbird_provide_feedback'
/** Anywhere -> bar: append a query fragment to the current query and focus it. */
export const APPEND_AND_FOCUS_EVENT = 'blackbird_monolith_append_and_focus_input'
/** Page -> bar: save the current query as a custom scope. */
export const SAVE_QUERY_AS_CUSTOM_SCOPE_EVENT = 'blackbird_monolith_save_query_as_custom_scope'

/** `detail` payload for {@link APPEND_AND_FOCUS_EVENT}. */
export interface AppendAndFocusEventDetail {
  appendQuery?: string
  retainScrollPosition?: boolean
  returnTarget?: HTMLElement
}

/** `detail` payload for {@link SEARCH_EVENT}. */
export interface SearchEventDetail {
  search: string
  // `undefined` values clear that param from the resulting search URL.
  searchParams?: {[key: string]: string | null | undefined}
}
