import {ssrSafeDocument} from '@github-ui/ssr-utils'

const MAX_ENTRIES = 10
const buffer: Array<string | null> = new Array(MAX_ENTRIES).fill(null)
let currentIndex = 0

export function addRequestId(id: string) {
  buffer[currentIndex] = id
  currentIndex = (currentIndex + 1) % MAX_ENTRIES
}

export function getRecentRequestIds(): string[] {
  const result: string[] = []
  for (let i = 0; i < MAX_ENTRIES; i++) {
    const idx = (currentIndex - 1 - i + MAX_ENTRIES) % MAX_ENTRIES
    const id = buffer[idx]
    if (id) result.push(id)
  }
  return result
}

export function initRequestIdFromMeta() {
  const definedDocument = ssrSafeDocument
  if (!definedDocument) {
    return
  }
  const meta = definedDocument.querySelector('meta[name="request-id"]')
  const id = meta?.getAttribute('content')
  if (id) {
    addRequestId(id)
  }
}

export function clearRecentRequestIds() {
  for (let i = 0; i < MAX_ENTRIES; i++) {
    buffer[i] = null
  }
  currentIndex = 0
}
