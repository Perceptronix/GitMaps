/**
 * Fast deep equality comparison optimized for analytics use cases.
 * Compares two values for deep structural equality with early exit optimizations.
 *
 * Performance characteristics:
 * - O(1) for primitive equality (same reference, primitives)
 * - O(n) for objects/arrays where n is the total number of nested properties
 * - Fails fast on size mismatches and type differences
 * - Handles circular references by tracking visited object pairs
 *
 * Circular references: Two objects with identical circular structure (e.g., obj1.self = obj1
 * and obj2.self = obj2) are considered equal if their non-circular properties match.
 */
export function fastDeepEqual(a: unknown, b: unknown): boolean {
  // Use a Map to track pairs of visited objects for circular reference detection
  const visited = new Map<unknown, Set<unknown>>()
  return deepEqualWithTracking(a, b, visited)
}

function deepEqualWithTracking(a: unknown, b: unknown, visited: Map<unknown, Set<unknown>>): boolean {
  // Fast path: same reference or strict equality (primitives, null, undefined)
  if (a === b) {
    return true
  }

  // Fast path: different types or one is null/undefined
  if (typeof a !== typeof b || a == null || b == null) {
    return false
  }

  // Handle dates
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime()
  }

  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    // Check for circular reference
    if (visited.has(a)) {
      // If we've seen 'a' before, check if we've compared it with 'b'
      const visitedSet = visited.get(a)
      return visitedSet ? visitedSet.has(b) : false
    }

    // Track this pair
    let visitedSet = visited.get(a)
    if (!visitedSet) {
      visitedSet = new Set()
      visited.set(a, visitedSet)
    }
    visitedSet.add(b)

    // Fast path: different lengths
    if (a.length !== b.length) {
      return false
    }

    // Compare each element
    for (let i = 0; i < a.length; i++) {
      if (!deepEqualWithTracking(a[i], b[i], visited)) {
        return false
      }
    }

    return true
  }

  // Handle plain objects
  if (typeof a === 'object' && typeof b === 'object') {
    // Only compare plain objects, not class instances
    if (!isPlainObject(a) || !isPlainObject(b)) {
      return false
    }

    // Check for circular reference
    if (visited.has(a)) {
      // If we've seen 'a' before, check if we've compared it with 'b'
      const visitedSet = visited.get(a)
      return visitedSet ? visitedSet.has(b) : false
    }

    // Track this pair
    let visitedSet = visited.get(a)
    if (!visitedSet) {
      visitedSet = new Set()
      visited.set(a, visitedSet)
    }
    visitedSet.add(b)

    const keysA = Object.keys(a)
    const keysB = Object.keys(b)

    // Fast path: different number of keys
    if (keysA.length !== keysB.length) {
      return false
    }

    // Compare each property
    for (const key of keysA) {
      // Check that b has this key
      if (!Object.prototype.hasOwnProperty.call(b, key)) {
        return false
      }

      // Deep compare the values
      if (!deepEqualWithTracking(a[key], b[key], visited)) {
        return false
      }
    }

    return true
  }

  // For primitives that aren't strictly equal (NaN, different values)
  return false
}

/**
 * Check if a value is a plain object (not a class instance, array, etc.)
 * Modified from: https://github.com/jonschlinkert/is-plain-object
 */
function isPlainObject(o: unknown): o is Record<string, unknown> {
  if (!hasObjectPrototype(o)) {
    return false
  }

  // If has modified constructor
  const ctor = o.constructor
  if (typeof ctor === 'undefined') {
    return true
  }

  const prot = ctor.prototype
  if (
    // If has modified prototype
    !hasObjectPrototype(prot) ||
    // If constructor does not have an Object-specific method
    !hasConstructorObjectSpecificMethod(prot)
  ) {
    return false
  }

  // Most likely a plain Object
  return true
}

function hasObjectPrototype(o: unknown): o is object {
  return Object.prototype.toString.call(o) === '[object Object]'
}

function hasConstructorObjectSpecificMethod(o: unknown): o is object {
  return Object.prototype.hasOwnProperty.call(o, 'isPrototypeOf')
}
