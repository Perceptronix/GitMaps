/*
 * From https://github.com/GoogleChrome/web-vitals/blob/7b44bea0d5ba6629c5fd34c3a09cc683077871d0/src/lib/getSelector.ts
 * I want to make sure we get element names the same way as web-vitals does.
 */

const getName = (node: Node) => {
  const name = node.nodeName
  return node.nodeType === 1 ? name.toLowerCase() : name.toUpperCase().replace(/^#/, '')
}

// React 19 useId() generates non-deterministic IDs like _r_0_, _r_2l_, _R_0_, _R_1a_.
// These are useless for identifying elements in analytics since they change across renders.
// Match both client-rendered (_r_) and SSR/hydrated (_R_) variants.
const REACT_ID_RE = /^_[rR]_[\da-z]+_$/

function hasStableId(el: Element): boolean {
  return Boolean(el.id) && !REACT_ID_RE.test(el.id)
}

export const getSelector = (node: Node | null | undefined, maxLen?: number) => {
  let sel = ''

  try {
    while (node && node.nodeType !== 9) {
      const el: Element = node as Element
      const shouldUseId = hasStableId(el)
      const part = shouldUseId
        ? `#${el.id}`
        : getName(el) +
          (el.classList && el.classList.value && el.classList.value.trim() && el.classList.value.trim().length
            ? `.${el.classList.value.trim().replace(/\s+/g, '.')}`
            : '')
      if (sel.length + part.length > (maxLen || 100) - 1) return sel || part
      sel = sel ? `${part}>${sel}` : part
      if (shouldUseId) break
      node = el.parentNode
    }
  } catch {
    // Do nothing...
  }
  return sel
}
