/**
 * Recursively filters an object, replacing all leaf values with '[FILTERED]'
 * while preserving the structure (keys, nesting, array shapes).
 * The 'errors' key is preserved without filtering as it contains useful debugging information.
 */
export function filterSensitiveData(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => {
      if (item === null || item === undefined) {
        return item
      }
      if (typeof item === 'object') {
        return filterSensitiveData(item)
      }
      return '[FILTERED]'
    })
  }

  if (typeof obj === 'object') {
    const filtered: Record<string, unknown> = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = (obj as Record<string, unknown>)[key]
        // Preserve 'errors' key without filtering - it's useful for debugging
        if (key === 'errors') {
          filtered[key] = value
        } else if (value === null || value === undefined) {
          filtered[key] = value
        } else if (typeof value === 'object') {
          filtered[key] = filterSensitiveData(value)
        } else {
          filtered[key] = '[FILTERED]'
        }
      }
    }
    return filtered
  }

  return obj
}
