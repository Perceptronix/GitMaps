/**
 * Resolves the Scheduler API off `globalThis` rather than `window`.
 *
 * `globalThis` is the same object as `window` in a document, but also resolves in
 * Web/Service Workers (where `window` is not merely undefined — referencing it
 * throws a `ReferenceError`, which would skip the fallbacks below) and in Node
 * during SSR. The tradeoff is that `eslint-plugin-compat` only pattern-matches
 * `window.x`, so it cannot see through this and check the API against our
 * browserslist; the explicit `typeof === 'function'` guards at each call site are
 * what actually keep this safe, and they hold regardless of browserslist.
 */
function getScheduler(): Scheduler | undefined {
  if ('scheduler' in globalThis) return globalThis.scheduler
}

function noop(): void {}

// A single MessageChannel is shared by every yield. Each `postMessage` delivers
// exactly one `message` event, so a FIFO of resolvers stays in lockstep with the
// events without needing a channel (or a listener) per yield.
let yieldPort: MessagePort | undefined
const pendingResolvers: Array<() => void> = []

/**
 * Schedules a macrotask via `MessageChannel`, which — unlike `setTimeout` — is not
 * subject to the ~4ms per-task clamp browsers apply to nested timers. This is the
 * same trick React's scheduler uses, and it matters most in Safari, which exposes
 * neither `scheduler.yield` nor `scheduler.postTask`: without it, a loop that
 * yields between chunks of work pays ~4ms of dead time per chunk.
 */
function messageChannelYield(): Promise<void> {
  if (!yieldPort) {
    const channel = new MessageChannel()
    // Assigning `onmessage` implicitly starts the port (no explicit `start()` needed).
    channel.port1.onmessage = () => {
      pendingResolvers.shift()?.()
    }
    yieldPort = channel.port2
  }

  const port = yieldPort
  return new Promise<void>(resolve => {
    pendingResolvers.push(resolve)
    port.postMessage(undefined)
  })
}

/**
 * Yields control back to the browser so it can service pending input and paint,
 * then resumes as soon as possible. Await it between chunks of a long task to
 * break that task up, which is what improves INP — a single 200ms task blocks
 * every interaction for its whole duration, whereas forty 5ms tasks block for at
 * most 5ms at a time.
 *
 * Preference order, best to worst:
 *
 * 1. `scheduler.yield()` — resumes the continuation *ahead* of other tasks of the
 *    same priority, so yielding does not send this work to the back of the queue.
 *    Only this method gives that guarantee.
 * 2. `scheduler.postTask()` at `user-visible` priority — a real task, but queued
 *    behind already-pending same-priority work.
 * 3. `MessageChannel` — a macrotask with no timer clamp (see
 *    {@link messageChannelYield}). The fallback for Safari.
 * 4. `setTimeout` — for any environment without `MessageChannel` (e.g. some SSR
 *    and test environments).
 *
 * Deliberately *not* in the list: `requestIdleCallback`. Callers yield here to
 * stay responsive while still finishing their work promptly; an idle callback can
 * be deferred indefinitely on a busy thread (and by up to its `timeout` even when
 * one is set), which is the opposite of the intent. Use `requestIdleCallback`
 * directly for work that genuinely should wait for idle.
 *
 * Note that options 1-3 all resume without waiting for a paint, so a loop that
 * yields on every iteration can still starve rendering. Pair this with a work
 * budget (do N ms of work, then yield) rather than yielding after every unit.
 *
 * The returned promise resolves with an unspecified value; do not depend on it.
 * `scheduler.yield()` may *reject* with an `AbortError` when the surrounding task
 * is aborted — that propagates to the caller by design, so an aborted task stops
 * instead of continuing to run.
 */
export function yieldToMain(): Promise<unknown> {
  const scheduler = getScheduler()
  if (scheduler) {
    if (typeof scheduler.yield === 'function') return scheduler.yield()
    if (typeof scheduler.postTask === 'function') return scheduler.postTask(noop, {priority: 'user-visible'})
  }

  if (typeof MessageChannel === 'function') return messageChannelYield()

  return new Promise(resolve => setTimeout(resolve, 0))
}
