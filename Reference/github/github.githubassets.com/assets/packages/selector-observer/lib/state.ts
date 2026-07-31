// Shared lifecycle state: maps an element to the ids of observers whose "add"
// hook has run for it. The apply phase (apply.ts) writes to it and the
// change-detection phase (changes.ts) reads from it, so it lives in its own
// module to keep those two phases decoupled.
export const addMap = new WeakMap<Element, number[]>()
