import type {CodeSection} from './code-section'

/**
 * A drop-in replacement for `Map<number, CodeSection[]>` that answers
 * "which sections contain this interior line?" using sorted intervals
 * and binary search instead of materializing an entry for every line.
 *
 * Construction is O(n log n) (sort) + O(n) (prefix-max).
 * Lookup is O(log n + k) where k = number of containing sections,
 * thanks to a prefix-max endLine array that enables early termination.
 *
 * A line is considered "interior" to a section when startLine < line < endLine,
 * matching the original lineToSectionMap behavior.
 */
export class SectionIntervalMap {
  /** Sections sorted by startLine ascending (for binary search). */
  #sections: CodeSection[]
  /**
   * prefixMaxEnd[i] = max(sections[0].endLine, ..., sections[i].endLine).
   * Used to break early during the backward scan in get(): if
   * prefixMaxEnd[i] <= line, no section at index i or earlier can contain line.
   */
  #prefixMaxEnd: number[]

  constructor(sections: CodeSection[]) {
    // Sections are already derived from symbols which are ordered by line,
    // but we sort defensively to guarantee the binary search invariant.
    this.#sections = sections.slice().sort((a, b) => a.startLine - b.startLine)

    // Build prefix-max of endLine for early termination in get().
    const n = this.#sections.length
    this.#prefixMaxEnd = new Array<number>(n)
    if (n > 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.#prefixMaxEnd[0] = this.#sections[0]!.endLine
      for (let i = 1; i < n; i++) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.#prefixMaxEnd[i] = Math.max(this.#prefixMaxEnd[i - 1]!, this.#sections[i]!.endLine)
      }
    }
  }

  /**
   * Returns all sections whose interior contains `line`
   * (i.e. section.startLine < line < section.endLine),
   * or undefined if none match.
   *
   * Matches the Map<number, CodeSection[]>.get() contract.
   */
  get(line: number): CodeSection[] | undefined {
    // Find the first section whose startLine >= line via binary search.
    // All candidate sections must have startLine < line, so they're before this index.
    const firstNotBefore = this.#lowerBound(line)

    let result: CodeSection[] | undefined
    for (let i = firstNotBefore - 1; i >= 0; i--) {
      // If the maximum endLine among sections[0..i] can't reach past line,
      // no section at this index or earlier can contain line — break early.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (this.#prefixMaxEnd[i]! <= line) break

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const section = this.#sections[i]!
      if (line < section.endLine) {
        if (!result) result = []
        result.push(section)
      }
    }

    // Reverse so the order matches the original map behavior (sections ordered
    // by startLine ascending, since we iterated backwards).
    if (result && result.length > 1) {
      result.reverse()
    }

    return result
  }

  /**
   * Binary search: returns the index of the first section with startLine >= line.
   */
  #lowerBound(line: number): number {
    let lo = 0
    let hi = this.#sections.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (this.#sections[mid]!.startLine < line) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    return lo
  }
}
