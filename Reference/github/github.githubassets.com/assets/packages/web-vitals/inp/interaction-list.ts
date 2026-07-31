import type {InteractionType} from './metric'

export interface Interaction {
  id: string
  latency: number
  entries: PerformanceEventTiming[]
  /** Eagerly captured CSS selector for the interaction target, before GC can reclaim the DOM node. */
  targetSelector: string
  /** Eagerly captured interaction type, derived from entry event name + target DOM properties. */
  interactionType: InteractionType
}

/*
 * The InteractionList is a list of interactions that are sorted by latency DESCENDING.
 * The list has a maximum size and will remove the shortest interaction if the list is full.
 */
export class InteractionList {
  interactions: Interaction[] = []
  interactionsMap: Map<string, Interaction> = new Map()
  maxSize: number

  constructor(size: number) {
    this.maxSize = size
  }

  get shortestInteraction() {
    return this.interactions[this.interactions.length - 1]
  }

  get(id: string) {
    return this.interactionsMap.get(id)
  }

  update(interaction: Interaction, entry: PerformanceEventTiming) {
    if (entry.duration > interaction.latency) {
      // New entry is longer — replace all entries and update latency
      interaction.entries = [entry]
      interaction.latency = entry.duration
      this.sort()
    } else if (
      entry.duration === interaction.latency &&
      interaction.entries[0] &&
      entry.startTime === interaction.entries[0].startTime
    ) {
      // Same duration and startTime — co-occurring events (e.g., pointerdown + mousedown)
      interaction.entries.push(entry)
    }
    // Otherwise: shorter duration, silently ignored (matches web-vitals v5 behavior)
  }

  add(interaction: Interaction) {
    const shortestInteraction = this.shortestInteraction

    // Only add interaction if list is not full or if the interaction is longer than the shortest one
    if (
      this.interactions.length <= this.maxSize ||
      !shortestInteraction ||
      interaction.latency > shortestInteraction.latency
    ) {
      this.interactionsMap.set(interaction.id, interaction)
      this.interactions.push(interaction)
      this.sort()

      // Remove the shortest interaction if list reached the limit
      if (this.interactions.length > this.maxSize) {
        const removed = this.interactions.pop()
        if (removed) {
          this.interactionsMap.delete(removed.id)
        }
      }
    }
  }

  sort() {
    this.interactions.sort((a, b) => b.latency - a.latency)
  }

  findEntry(entry: PerformanceEventTiming) {
    return this.interactions.some((interaction: Interaction) => {
      return interaction.entries.some(prevEntry => {
        return entry.duration === prevEntry.duration && entry.startTime === prevEntry.startTime
      })
    })
  }

  // from https://github.com/GoogleChrome/web-vitals/blob/7b44bea0d5ba6629c5fd34c3a09cc683077871d0/src/onINP.ts#L112-L123
  estimateP98(numOfPageInteractions: number) {
    const candidateInteractionIndex = Math.min(this.interactions.length - 1, Math.floor(numOfPageInteractions / 50))

    return this.interactions[candidateInteractionIndex]
  }
}
