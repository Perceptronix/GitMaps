import verifySsoSession from './sso'
import {getBaseFetchHeaders} from '@github-ui/fetch-headers'

interface FilterOptions {
  limit?: number | null
}

// Only login, name & selected are attributes required on both server side and payload rendered elements.
// IE if we construct a user element from a .js-filterable-suggested-user HTMLElement.
interface User {
  id?: string
  type?: string
  login: string
  name: string
  selected: boolean
  disabled?: boolean
  ccr_quota_limited?: boolean
  element?: HTMLElement
  description?: string
  avatar?: string
  class?: string
  suggestion?: boolean
}

interface Data {
  suggestions: User[]
  users: User[]
}

interface TypeAheadData {
  lastSearchResult: Data
  lastSearchText?: string
  cachedSuggestions: User[]

  // Used to cache a user ID to a pre-existing rendered element (if they exist in multiple search results).
  // This is needed to persist their selected state across multiple searches.
  // Key is user.id (as a string) to the rendered element
  userResultCache: Map<string, HTMLElement>
}

// Used to abort any previous type-ahead request if not needed
let abortController = new AbortController()

const typeAheadCache = new WeakMap<Element, TypeAheadData>()
const cache = new WeakMap<Element, Data>()
const currentQueryForList = new WeakMap<Element, string>()

async function getData(list: Element, queryText: string, typeAhead: boolean): Promise<Data> {
  if (typeAhead && !typeAheadCache.has(list)) {
    initializeTypeAheadCache(list)
  }

  const data = await fetchQueryIfNeeded(list, queryText, typeAhead)
  const hasPreRenderedData = list.hasAttribute('data-filterable-data-pre-rendered')

  if (hasPreRenderedData) {
    data.suggestions = getPreRenderedUsers(list, typeAhead)
  }

  return data
}

async function fetchQueryIfNeeded(list: Element, queryText: string, typeAhead: boolean): Promise<Data> {
  const url = new URL(list.getAttribute('data-filterable-src') || '', window.location.origin)
  if (url.pathname === '/') throw new Error('could not get data-filterable-src')

  if (typeAhead) {
    const allowEmptySearch = list.hasAttribute('data-filterable-allow-empty-search') || false
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    const typeAheadData = typeAheadCache.get(list)!
    const trimmedText = queryText.trim()
    if (typeAheadData.lastSearchText === trimmedText) return typeAheadData.lastSearchResult
    const isInitialLoad = typeAheadData.lastSearchText === undefined
    typeAheadData.lastSearchText = trimmedText

    const inputId = list.getAttribute('data-filterable-for') || ''
    const inputElement = document.getElementById(inputId)

    // Abort any old requests (if any)
    abortController.abort()
    if (trimmedText === '' && !allowEmptySearch) {
      typeAheadData.lastSearchResult = {suggestions: [], users: []}
    } else {
      // Abort controller needs to be re-created, there exists one per abort.
      abortController = new AbortController()
      const requestHeaders = {
        headers: {Accept: 'application/json', ...getBaseFetchHeaders()},
        signal: abortController.signal,
      }

      const params = url.searchParams || new URLSearchParams()
      params.set('q', queryText)
      params.set('typeAhead', 'true')
      url.search = params.toString()

      if (!isInitialLoad) {
        inputElement?.classList.add('is-loading')
      }

      const response = await fetch(url.toString(), requestHeaders)
      typeAheadData.lastSearchResult = await response.json()
    }

    inputElement?.classList.remove('is-loading')
    return typeAheadData.lastSearchResult
  } else {
    const requestHeaders = {headers: {Accept: 'application/json', ...getBaseFetchHeaders()}}
    const response = await fetch(url.toString(), requestHeaders)
    return await response.json()
  }
}

// This function will try to find any server side rendered users through the tag `.js-filterable-suggested-user`
// If any are found, they will be added to the API returned data.
// This users are distinct from the 'suggestions' currently returned through the reviewers API call.
function getPreRenderedUsers(list: Element, typeAhead: boolean): User[] {
  const data = []
  // Add all server rendered users to the `suggestions` list (if any).
  const suggestedUsers = list.querySelectorAll<HTMLElement>('.js-filterable-suggested-user')

  // If the list has been refreshed, or first time loaded, this will be non-zero, and therefore we clear the array and re-add the new items
  if (suggestedUsers.length > 0) {
    // Read the server-side rendered elements that need to be added to suggestions.
    // This is a work-around to allow the server-side rendered elements to work with the filtering.
    for (const suggestedUser of list.querySelectorAll<HTMLElement>('.js-filterable-suggested-user')) {
      suggestedUser.classList.remove('js-filterable-suggested-user')

      // Deconstruct the element into a <User> object
      data.push({
        /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
        name: suggestedUser.querySelector('.js-description')!.textContent,
        /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
        login: suggestedUser.querySelector('.js-username')!.textContent,
        selected: suggestedUser.getAttribute('aria-checked') === 'true',
        element: suggestedUser,
        suggestion: true,
      })
    }
  }

  // If the list has been refreshed, or first time loaded, this will be non-zero, and therefore we clear the array and re-add the new items
  if (typeAhead) {
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    const typeAheadData = typeAheadCache.get(list)!
    if (suggestedUsers.length > 0) {
      typeAheadData.cachedSuggestions = data
      typeAheadData.userResultCache.clear()
    }

    return typeAheadData.cachedSuggestions
  }

  return data
}

function initializeTypeAheadCache(list: Element) {
  typeAheadCache.set(list, {
    lastSearchResult: {suggestions: [], users: []},
    cachedSuggestions: [],
    userResultCache: new Map<string, HTMLElement>(),
  })
}

// This is like `substringFilterList`, but instead of filtering down direct
// children of a DOM element, obtain most data from a JSON payload and search
// within that instead, only generating actual DOM elements when they are
// "revealed" by matching the search term. Similarly, remove elements from the
// DOM when they don't match a search term and they're not selected.
//
// Also, because elements might already exist in the DOM because of their
// pre-selected state, merge those elements with the data coming from JSON.
export async function substringMemoryFilterList(
  list: Element,
  queryText: string,
  options: FilterOptions,
): Promise<number> {
  currentQueryForList.set(list, queryText)

  await verifySsoSession()

  const showSuggestionsHeaderOnLoad = list.hasAttribute('data-filterable-show-suggestion-header')
  const typeAhead = list.hasAttribute('data-filterable-type-ahead')

  let data = cache.get(list)

  if (!data) {
    try {
      data = await getData(list, queryText, typeAhead)
      if (!typeAhead) cache.set(list, data)
    } catch (error) {
      // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
      if (error.name === 'AbortError') {
        // A stale type-ahead request was aborted
        return -1
      } else {
        throw error
      }
    }
  }

  // This logic only exists when type-ahead is disabled
  if (!typeAhead && currentQueryForList.get(list) !== queryText) {
    return -1
  }

  const limit = options.limit
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const template = list.querySelector<HTMLTemplateElement>('template')!

  // an index of items already rendered into DOM due to being preselected
  const existingElements: {[key: string]: HTMLInputElement} = {}
  for (const existing of list.querySelectorAll<HTMLInputElement>('input[type=hidden]')) {
    existingElements[`${existing.name}${existing.value}`] = existing
  }

  // remove all non-selected items after the template element
  let cutoffPoint = template.nextElementSibling
  while (cutoffPoint) {
    const el = cutoffPoint
    cutoffPoint = el.nextElementSibling
    if (
      el instanceof HTMLElement &&
      (typeAhead || el.getAttribute('aria-checked') === 'true' || el.classList.contains('select-menu-divider'))
    ) {
      el.hidden = true
    } else {
      el.remove()
    }
  }

  let visible = 0

  const queryTextEmpty = queryText.trim() === ''
  const items = document.createDocumentFragment()
  const suggestionsDivider = list.querySelector<HTMLElement>('.js-divider-suggestions')
  const restDivider = list.querySelector<HTMLElement>('.js-divider-rest')
  const typeAheadData = typeAheadCache.get(list)

  function addItem(user: User) {
    const containsQueryText = `${user.login} ${user.name}`.toLowerCase().trim().includes(queryText)
    const matching = !(limit != null && visible >= limit) && containsQueryText
    const shouldGenerate = matching || user.selected || user.suggestion
    if (shouldGenerate) {
      const item = createReviewerItem(user, template, existingElements, typeAheadData)
      item.hidden = !matching
      if (matching) visible++
      items.appendChild(item)
    }
  }

  let anyVisibleNonSelectedSuggestions = false

  // We show suggestions header if we
  // 1) Actually have suggestions, or
  // 2) If we still want to show suggestions title (declared by the attribute), but don't ever have any suggestions
  // (ie data.suggestions is undefined), the criteria simply becomes whether or not there is any query text.
  if (suggestionsDivider && (data.suggestions?.length > 0 || (showSuggestionsHeaderOnLoad && data.users.length > 0))) {
    const suggestions = data.suggestions ?? []
    const selectedSuggestions = suggestions.filter(u => u.selected)
    const nonSelectedSuggestions = suggestions.filter(u => !u.selected)

    for (const u of selectedSuggestions) {
      addItem(u)
    }

    // Put the suggestions after the already assigned users
    items.appendChild(suggestionsDivider)
    const preSuggestionsVisibleCount = visible
    for (const u of nonSelectedSuggestions) {
      addItem(u)
    }
    anyVisibleNonSelectedSuggestions = visible > preSuggestionsVisibleCount

    suggestionsDivider.hidden = !anyVisibleNonSelectedSuggestions || (typeAhead && !queryTextEmpty)

    // Special case where we want to force show the suggestions header even without suggestions in the payload.
    if (showSuggestionsHeaderOnLoad && data.users.length > 0) {
      suggestionsDivider.hidden = !queryTextEmpty
    }
  }

  if (restDivider) {
    items.appendChild(restDivider)
  }

  const preUsersVisibleCount = visible
  for (const u of data.users) {
    addItem(u)
  }

  if (restDivider) {
    restDivider.hidden = preUsersVisibleCount === visible || !anyVisibleNonSelectedSuggestions
  }

  list.append(items)
  return visible
}

function createReviewerItem(
  user: User,
  template: HTMLTemplateElement,
  existingElements: Record<string, HTMLElement>,
  typeAheadData: TypeAheadData | undefined,
): HTMLElement {
  if (user.element != null) {
    return user.element
  }

  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  if (typeAheadData?.userResultCache.has(user.id!)) {
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    return typeAheadData.userResultCache.get(user.id!)!
  }

  const li = template.content.cloneNode(true) as HTMLElement
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const input = li.querySelector<HTMLInputElement>('input[type=checkbox], input[type=radio]')!

  if (user.type) {
    input.name = `reviewer_${user.type}_ids[]`
  }
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  input.value = user.id!

  const inputKey = `${input.name}${user.id}`
  let selected = user.selected
  if (existingElements[inputKey]) {
    selected = true
    existingElements[inputKey].remove()
    delete existingElements[inputKey]
  }

  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const item = li.querySelector<HTMLElement>('[role^=menuitem]')!
  if (selected) {
    item.setAttribute('aria-checked', 'true')
    input.checked = true
  }

  if (user.disabled) {
    item.setAttribute('aria-disabled', 'true')
  }

  if (user.ccr_quota_limited) {
    input.setAttribute('data-ccr-quota-limited', 'true')
  }

  const login = li.querySelector('.js-username')
  if (login) login.textContent = user.login

  const fullName = li.querySelector('.js-description')
  if (fullName) {
    fullName.textContent = user.name
    if (user.ccr_quota_limited) fullName.classList.add('description-attention', 'ml-1')
  }

  const description = li.querySelector('.js-extended-description')
  if (description) {
    if (user.description) {
      description.textContent = user.description
    } else {
      description.remove()
    }
  }

  if (user.login === 'copilot-swe-agent') {
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    login!.textContent = 'Copilot'
    // eslint-disable-next-line i18n-text/no-en, @typescript-eslint/no-non-null-assertion
    fullName!.textContent = 'Your AI pair programmer'
  }

  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const avatar = li.querySelector<HTMLImageElement>('.js-avatar')!
  if (user.login === 'Copilot' || user.login === 'copilot-swe-agent') {
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    const copilotAvatar = li.querySelector<HTMLImageElement>('.js-copilot-avatar')!
    copilotAvatar.hidden = false
    avatar.hidden = true
  } else {
    avatar.className = `${avatar.className} ${user.class}`
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    avatar.src = user.avatar!
  }
  user.element = item

  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  typeAheadData?.userResultCache.set(user.id!, item)

  return user.element
}
