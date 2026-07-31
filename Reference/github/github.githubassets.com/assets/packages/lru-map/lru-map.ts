interface LRUOptions<K, V> {
  size: number
  min?: number
  ttl?: number
  onDelete?: (key: K, value: V) => void
}

/**
 * A Least Recently Used (LRU) cache implementation.
 */
export class LRUMap<K, V> implements Map<K, V> {
  #map: Map<K, V>
  #ttlMap: Map<K, NodeJS.Timeout>
  #list: Set<K>
  #maxSize: number
  #min: number
  #ttl?: number
  onDelete?: (key: K, value: V) => void

  constructor({size, min, ttl, onDelete}: LRUOptions<K, V>) {
    this.#map = new Map()
    this.#ttlMap = new Map()
    this.#list = new Set()
    this.#maxSize = size
    this.#ttl = ttl
    this.#min = min || 0
    this.onDelete = onDelete
  }

  get(key: K): V | undefined {
    if (!this.#list.has(key)) return

    this.refreshTTL(key)

    this.#list.delete(key)
    this.#list.add(key)
    return this.#map.get(key)
  }

  set(key: K, value: V) {
    this.#list.delete(key)
    this.#list.add(key)
    this.#map.set(key, value)

    this.setTTL(key)

    while (this.#list.size > this.#maxSize) {
      const evictKey = this.#list.values().next().value
      if (evictKey) this.delete(evictKey)
    }
    return this
  }

  evictIfFull() {
    if (this.#list.size === this.#maxSize) {
      const evictKey = this.#list.values().next().value
      if (evictKey) this.delete(evictKey)
    }
  }

  delete(key: K) {
    this.#list.delete(key)
    this.removeTTL(key)

    if (this.onDelete) {
      const value = this.#map.get(key)
      if (value) this.onDelete(key, value)
    }

    return this.#map.delete(key)
  }

  clear() {
    this.#map.clear()
    this.#list.clear()
    this.clearTTL()
  }

  get size(): number {
    return this.#map.size
  }

  has(key: K) {
    return this.#map.has(key)
  }

  keys() {
    return this.#map.keys()
  }

  values() {
    return this.#map.values()
  }

  entries() {
    return this.#map.entries()
  }

  forEach(callback: (value: V, key: K, map: LRUMap<K, V>) => void) {
    for (const [key, value] of this.#map) {
      callback(value, key, this)
    }
  }

  [Symbol.iterator]() {
    return this.#map[Symbol.iterator]()
  }

  get [Symbol.toStringTag](): 'LRUMap' {
    return 'LRUMap'
  }

  setTTL(key: K) {
    if (!this.#ttl) return

    const timer = setTimeout(() => {
      if (this.size > this.#min) {
        this.delete(key)
      } else {
        this.refreshTTL(key)
      }
    }, this.#ttl)

    this.#ttlMap.set(key, timer)
  }

  refreshTTL(key: K) {
    if (!this.#ttl) return

    const timer = this.#ttlMap.get(key)

    if (!timer) return

    clearTimeout(timer)
    this.setTTL(key)
  }

  clearTTL() {
    for (const timer of this.#ttlMap.values()) {
      clearTimeout(timer)
    }
    this.#ttlMap.clear()
  }

  removeTTL(key: K) {
    clearTimeout(this.#ttlMap.get(key))
    this.#ttlMap.delete(key)
  }
}
