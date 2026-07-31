import {sendEvent} from '@github-ui/hydro-analytics'
import {sendCustomMetric} from '@github-ui/stats'

/**
 * Typing latency monitoring: measures how responsive the UI feels during text input.
 *
 * For each keystroke during active typing, we measure the "input delay" — the time
 * between the browser creating the keydown event (event.timeStamp) and our handler
 * executing (performance.now()). This captures main thread blocking that makes
 * typing feel sluggish.
 *
 * Keystrokes are grouped into "typing sessions" — consecutive keystrokes with gaps
 * under 1 second. When a session ends, we report aggregate metrics:
 * - keyCount: total keystrokes in the session
 * - totalInputDelay: sum of all per-keystroke delays (the "time lost" value)
 * - maxInputDelay: worst single-keystroke delay
 * - avgInputDelay: average per-keystroke delay
 * - sessionDuration: wall-clock time of the entire session
 *
 * The "time lost" (totalInputDelay) is the key metric: it represents the accumulated
 * time the user spent waiting for the UI to respond to their keystrokes during a
 * typing session. A totalInputDelay of 200ms across 20 keystrokes means the user
 * experienced 200ms of cumulative lag — each keystroke felt ~10ms delayed on average.
 *
 * Sampling is handled by sendStats session-level sampling (see @github-ui/stats).
 */

/** Gap between keystrokes that ends a typing session */
const SESSION_GAP_MS = 1000

/** Minimum keystrokes to consider a session worth reporting */
const MIN_SESSION_KEYS = 5

const TEXT_INPUT_TYPES = new Set(['text', 'search', 'url', 'email', 'password', ''])

function isTextInput(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  if (target instanceof HTMLTextAreaElement) return true
  if (target instanceof HTMLInputElement) {
    return TEXT_INPUT_TYPES.has(target.type.toLowerCase())
  }
  return false
}

function getInputType(target: EventTarget | null): string {
  if (!target || !(target instanceof HTMLElement)) return 'unknown'
  if (target.isContentEditable) return 'contenteditable'
  if (target instanceof HTMLTextAreaElement) return 'textarea'
  if (target instanceof HTMLInputElement) return target.type || 'text'
  return 'unknown'
}

interface TypingSession {
  startTime: number
  keyCount: number
  totalInputDelay: number
  maxInputDelay: number
  inputType: string
}

export function observeTypingLatency(): void {
  let session: TypingSession | null = null
  let sessionTimer: ReturnType<typeof setTimeout> | undefined

  function endSession() {
    if (session && session.keyCount >= MIN_SESSION_KEYS) {
      reportTypingSession(session)
    }
    session = null
  }

  document.addEventListener(
    'keydown',
    (kbd: KeyboardEvent) => {
      if (!isTextInput(kbd.target)) return
      // Skip IME composition events — CJK input fires keydown during composition
      // but the character isn't committed yet, creating artificial input delay.
      // kbd.key can be undefined at runtime despite the TS types (synthetic events, some IME implementations).
      if (kbd.isComposing || kbd.key == null) return
      // Filter to character-producing keys — avoid counting modifier/navigation keys.
      // We check for single-character keys (printable chars) or Backspace/Delete.
      const isCharKey = kbd.key.length === 1
      const isEditKey = kbd.key === 'Backspace' || kbd.key === 'Delete'
      if (!isCharKey && !isEditKey) return

      const now = performance.now()
      // Input delay: how long the event waited in the queue before our handler ran
      const inputDelay = Math.max(0, now - kbd.timeStamp)

      if (!session) {
        session = {
          startTime: now,
          keyCount: 0,
          totalInputDelay: 0,
          maxInputDelay: 0,
          inputType: getInputType(kbd.target),
        }
      }

      session.keyCount++
      session.totalInputDelay += inputDelay
      session.maxInputDelay = Math.max(session.maxInputDelay, inputDelay)

      clearTimeout(sessionTimer)
      sessionTimer = setTimeout(endSession, SESSION_GAP_MS)
    },
    {capture: true},
  )
}

function reportTypingSession(session: TypingSession): void {
  const sessionDuration = performance.now() - session.startTime
  const avgInputDelay = session.totalInputDelay / session.keyCount

  // Round values for cleaner data
  const roundedTotal = Math.round(session.totalInputDelay * 100) / 100
  const roundedMax = Math.round(session.maxInputDelay * 100) / 100
  const roundedAvg = Math.round(avgInputDelay * 100) / 100

  sendEvent(
    'typing-session',
    {
      keyCount: String(session.keyCount),
      totalInputDelayMs: String(roundedTotal),
      maxInputDelayMs: String(roundedMax),
      avgInputDelayMs: String(roundedAvg),
      sessionDurationMs: String(Math.round(sessionDuration)),
      inputType: session.inputType,
      url: window.location.href,
    },
    {batched: true},
  )

  const tags = {inputType: session.inputType}

  sendCustomMetric(
    {
      name: 'BROWSER_VITALS_DIST_TYPING_AVG_INPUT_DELAY',
      value: roundedAvg,
      tags,
      requestUrl: window.location.href,
    },
    false,
  )

  sendCustomMetric(
    {
      name: 'BROWSER_VITALS_DIST_TYPING_MAX_INPUT_DELAY',
      value: roundedMax,
      tags,
      requestUrl: window.location.href,
    },
    false,
  )

  sendCustomMetric(
    {
      name: 'BROWSER_VITALS_DIST_TYPING_TOTAL_INPUT_DELAY',
      value: roundedTotal,
      tags,
      requestUrl: window.location.href,
    },
    false,
  )
}
