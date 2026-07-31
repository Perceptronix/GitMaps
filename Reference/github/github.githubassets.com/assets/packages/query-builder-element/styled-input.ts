import {TextElementStyle, type QueryElement} from './query-builder-api'

/**
 * The DOM elements and sizing config `StyledInput` needs to render and measure
 * the visually styled query. `QueryBuilderElement` satisfies this via its
 * target getters, so it can pass itself as the host.
 */
export interface StyledInputHost {
  readonly input: HTMLInputElement
  readonly styledInputContent: HTMLElement
  readonly styledInputContainer: HTMLDivElement
  readonly sizer: HTMLElement
  readonly minWidth: number
}

export interface StyleOptions {
  usingCustomParser: boolean
  filterKey: string
}

/**
 * Owns the query builder's styled-input rendering, signature caching, and input
 * sizing. Extracted from `QueryBuilderElement` so this hot render path — which
 * runs on every keystroke and provider update — can be reasoned about and
 * changed independently of provider lifecycle and results rendering.
 */
export class StyledInput {
  #host: StyledInputHost
  #lastSignature: string | undefined

  constructor(host: StyledInputHost) {
    this.#host = host
  }

  // Forces the next `render` to rebuild the styled DOM even if the tokens match
  // the previous render. Used when providers attach and existing text may now
  // style differently.
  resetSignature() {
    this.#lastSignature = undefined
  }

  render(elements: QueryElement[], {usingCustomParser, filterKey}: StyleOptions) {
    this.#setSizer(this.#host.input.value)

    // The styled spans are a pure function of the token list, the custom-parser
    // flag, and the `filterKey` separator, so skip rebuilding them when those are
    // unchanged from the last render. Redundant calls are common — focus reparses,
    // provider-attach reparses, and repeated `parseQuery` for the same value all
    // re-invoke this with identical inputs. We still run `#setSizer`/`#resizeInput`
    // because those depend on the caret position, which moves without changing tokens.
    const signature = this.#signature(elements, usingCustomParser, filterKey)
    if (signature !== this.#lastSignature) {
      const fragment = document.createDocumentFragment()
      for (const element of elements) {
        const queryItem = document.createElement('span')
        const trailingSpaceElement = document.createElement('span')
        trailingSpaceElement.textContent = ' '

        // If the user overrides the parser, make no assumption about leading or trailing spaces
        const shouldAddTrailingSpace = !usingCustomParser

        if (element.type === 'filter') {
          const {filter, value} = element
          const filterItem = document.createElement('span')

          queryItem.setAttribute('data-type', 'filter-expression')
          filterItem.setAttribute('data-type', 'filter')
          filterItem.textContent = filter

          const filterKeyElement = document.createElement('span')
          filterKeyElement.textContent = filterKey

          const filterValue = document.createElement('span')
          filterValue.setAttribute('data-type', 'filter-value')
          filterValue.textContent = value

          queryItem.appendChild(filterItem)
          queryItem.appendChild(filterKeyElement)
          queryItem.appendChild(filterValue)

          // Adds the trailing space as a separate element so it isn't included in the styling for the filter value
          if (shouldAddTrailingSpace) queryItem.appendChild(trailingSpaceElement)
        } else {
          if (shouldAddTrailingSpace) {
            queryItem.textContent = `${element.value} `
          } else {
            queryItem.textContent = element.value
          }

          if (element.style === TextElementStyle.Constant) {
            queryItem.classList.add('qb-constant')
          } else if (element.style === TextElementStyle.Entity) {
            queryItem.classList.add('qb-entity')
          } else if (element.style === TextElementStyle.FilterValue) {
            queryItem.classList.add('qb-filter-value')
          }
        }

        fragment.append(queryItem)
      }
      this.#host.styledInputContent.replaceChildren(fragment)
      this.#lastSignature = signature
    }

    // Resize once after the whole query has been committed to the DOM. Calling
    // this per token scheduled one layout-reading rAF per element, and because
    // each callback reads (`offsetLeft`/`scrollWidth`) after the previous one
    // wrote (`scrollLeft`/`style.width`) it forced a synchronous reflow per
    // token. `#resizeInput` measures the full sizer/input, so a single call is
    // sufficient and avoids the read-after-write thrash on every parse. The old
    // loop ran the resize once per element, so an empty token list (the
    // `clearInput()` path) scheduled none — preserve that so clearing does not
    // reset the retained input width/scroll position.
    if (elements.length > 0) this.#resizeInput()
  }

  // Serializes everything the styled spans render, so `render` can skip
  // rebuilding the DOM when the token list is unchanged. Only the fields that
  // affect the rendered output are included: type, filter/value, and text style,
  // plus `filterKey` (the separator rendered between a filter and its value) since
  // it can change at runtime while the token list stays the same.
  #signature(elements: QueryElement[], usingCustomParser: boolean, filterKey: string): string {
    return JSON.stringify([
      usingCustomParser,
      filterKey,
      elements.map(element =>
        element.type === 'filter' ? ['f', element.filter, element.value] : ['t', element.style ?? '', element.value],
      ),
    ])
  }

  // Gets the width of the input text to help set the visually styled input
  #setSizer(value: string) {
    const {input, sizer} = this.#host
    sizer.textContent = ''

    if (input.selectionStart !== null && input.selectionStart === input.selectionEnd) {
      // insert an element where the cursor should be so we can find it
      const index = input.selectionStart
      const cursor = document.createElement('span')

      sizer.append(value.substring(0, index), cursor, value.substring(index))
    } else {
      sizer.textContent = value
    }
  }

  // Determines the size of the input for styling purposes
  #resizeInput() {
    const {input, sizer, styledInputContainer, minWidth} = this.#host
    requestAnimationFrame(() => {
      const cursor = sizer.querySelector('span')

      if (cursor) {
        // make sure the cursor is visible
        if (cursor.offsetLeft < styledInputContainer.scrollLeft) {
          styledInputContainer.scrollLeft = cursor.offsetLeft - minWidth
        } else if (cursor.offsetLeft > styledInputContainer.scrollLeft + styledInputContainer.clientWidth) {
          styledInputContainer.scrollLeft = cursor.offsetLeft - styledInputContainer.clientWidth + minWidth
        }
      }

      const currentSizerScrollWidth = sizer.scrollWidth
      const newInputWidth = Math.max(currentSizerScrollWidth + 2, input.value === '' ? 2 : 0, minWidth)

      input.style.width = `${newInputWidth}px`
    })
  }
}
