// Observer-free lazy element definition.
//
// Instead of a document-wide MutationObserver, this uses the browser's style
// engine to notice when a matching element renders: a no-op CSS animation is
// attached to the registered selector, and an `animationstart` listener fires
// the loader. For custom elements the rule uses `:not(:defined)` so that once
// the module self-defines the element (via `@controller`), `:defined` flips
// true, the rule stops matching, and the browser upgrades every instance
// natively. Elements that already match when a selector is registered skip the
// animation entirely and load via a one-time `querySelector` fast path.
//
// Trade-offs vs the MutationObserver approach:
//   - CSS does not pierce shadow DOM, so lazy elements nested in a shadow root
//     need the detection sheet adopted into that root (see observeRootNative).
//   - A `display:none` element inserted *after* its selector is registered runs
//     no animation, so it is not detected until shown. Often desirable (no
//     offscreen work), but it is a behaviour change. Ones already present at
//     registration are still caught by the fast path.
//   - A page-global animation reset (e.g. a reduced-motion
//     `*{animation:none!important}`) could out-`!important` the detection rule
//     and silently stop `animationstart` from firing. The detection animation is
//     therefore declared `!important`, and it wins the cascade on two counts,
//     even against another `!important` reset added later: (1) our detection
//     selectors are always more specific than the universal `*` a reset uses
//     (`.foo` is 0,1,0; `foo-bar:not(:defined)` is 0,1,1), and for conflicting
//     `!important` declarations specificity is compared before source order; and
//     (2) it lives in an adopted stylesheet, which the cascade orders after every
//     regular author sheet. Only a reset deliberately targeting these internal
//     detection selectors could override it. The animation is imperceptible (a
//     transparent-to-transparent outline color), so forcing it does not defeat
//     the user's motion preference.

type Loader = () => Promise<unknown>
type Strategy = (el: Element, selector: string) => Promise<void>

const ANIMATION_NAME = 'catalyst-lazy-detect'

// Selectors may be a bare custom-element tag ('profile-pins'), a custom element
// plus attributes ('react-partial[partial-name="x"]'), or a plain class/attribute
// selector on a native element ('.js-sub-dependencies').
interface Registration {
  // Original selector key, used to dedupe repeat registrations.
  selector: string
  // The selector actually written into the stylesheet (see detectionSelector).
  ruleSelector: string
  // Unique keyframes/animation name for this selector, so `animationstart`
  // dispatch is O(1) (event.animationName -> registration) with no matches().
  animationName: string
  loader: Loader
}

const bySelector = new Map<string, Registration>()
const byAnimation = new Map<string, Registration>()
let nextId = 0

let readyPromise: Promise<void> | undefined
const whenReady = (): Promise<void> =>
  (readyPromise ||= new Promise<void>(resolve => {
    if (document.readyState !== 'loading') {
      resolve()
    } else {
      document.addEventListener('readystatechange', () => resolve(), {once: true})
    }
  }))

let firstInteraction: Promise<void> | undefined
// Primed eagerly when the native system initializes (see lazyDefineNative), so it
// starts listening at page load like catalyst's module-level promise. Without
// that, a `firstInteraction` element inserted *after* the user already interacted
// would create a fresh promise and wait for the *next* interaction — a silent
// non-load. Listeners self-remove on the first interaction via the abort signal.
const whenFirstInteraction = (): Promise<void> =>
  (firstInteraction ||= new Promise<void>(resolve => {
    const controller = new AbortController()
    const options = {once: true, passive: true, signal: controller.signal}
    const handler = () => {
      controller.abort()
      resolve()
    }
    document.addEventListener('mousedown', handler, options)
    // eslint-disable-next-line github/require-passive-events
    document.addEventListener('touchstart', handler, options)
    document.addEventListener('keydown', handler, options)
    document.addEventListener('pointerdown', handler, options)
  }))

const whenVisible = (selector: string, firedEl: Element): Promise<void> =>
  new Promise<void>(resolve => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.disconnect()
            resolve()
            return
          }
        }
      },
      // Load about 256px before the element scrolls into view, matching the
      // catalyst `visible` strategy, so the module is ready just in time.
      {rootMargin: '0px 0px 256px 0px', threshold: 0.01},
    )
    // Observe every current match (like catalyst) so an offscreen first element
    // does not delay loading when another instance is already in/near the
    // viewport. Fall back to the element that fired if the query finds none.
    const matches = document.querySelectorAll(selector)
    if (matches.length > 0) {
      for (const match of matches) observer.observe(match)
    } else {
      observer.observe(firedEl)
    }
  })

const strategies = {
  ready: () => whenReady(),
  firstInteraction: () => whenFirstInteraction(),
  visible: (el: Element, selector: string) => whenVisible(selector, el),
} satisfies Record<string, Strategy>

type StrategyName = keyof typeof strategies

function isStrategyName(name: string): name is StrategyName {
  return name in strategies
}

let sheet: CSSStyleSheet | undefined
function ensureSheet(): CSSStyleSheet {
  if (sheet) return sheet
  sheet = new CSSStyleSheet()
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet]
  return sheet
}

// The `animationstart` listener is attached lazily, only while at least one
// selector is waiting to be detected, and removed once the registry empties. If
// every selector resolves via the present-at-registration fast path, it is never
// attached at all.
let listening = false
function ensureListening(): void {
  if (listening) return
  listening = true
  document.addEventListener('animationstart', onAnimationStart, {capture: true})
}
function stopListeningIfIdle(): void {
  if (listening && byAnimation.size === 0) {
    listening = false
    document.removeEventListener('animationstart', onAnimationStart, {capture: true})
  }
}

// `:not(:defined)` is only correct for a BARE custom-element tag, where the
// loader defining that tag is exactly what "loaded" means. A compound selector
// (tag + attribute/class, e.g. `react-partial[partial-name="x"]`) must NOT use
// it: the tag may be defined independently of the specific module we lazy-load
// (or shared across many such selectors), so `:defined` could flip before — or
// without — our loader running. Those, and native-element selectors, use the raw
// selector and are removed on first hit (load-once, presence-based like catalyst).
const CUSTOM_ELEMENT_TAG = /^[a-z][a-z0-9]*-[a-z0-9-]*$/
function detectionSelector(selector: string): string {
  return CUSTOM_ELEMENT_TAG.test(selector) ? `${selector}:not(:defined)` : selector
}

function onAnimationStart(event: Event): void {
  const {animationName, target} = event as AnimationEvent
  const registration = byAnimation.get(animationName)
  if (!registration || !(target instanceof Element)) return
  // Detection has done its job for this selector; remove the rule and registry
  // entries synchronously so no further animations run and no further events
  // walk the maps. This is essential for broad native selectors (e.g. a class
  // matching hundreds of elements) that have no `:not(:defined)` off-switch.
  cleanup(registration)
  void runLoader(registration, target)
}

async function runLoader(registration: Registration, el: Element): Promise<void> {
  const name = el.getAttribute('data-load-on') || 'ready'
  const strategy = isStrategyName(name) ? strategies[name] : strategies.ready
  try {
    await strategy(el, registration.selector)
    await registration.loader()
  } catch (error) {
    reportError(error)
  }
}

function cleanup(registration: Registration): void {
  byAnimation.delete(registration.animationName)
  bySelector.delete(registration.selector)
  removeDetectionRule(registration)
  stopListeningIfIdle()
}

// Re-find rules by content rather than a cached index, since deleting a rule
// shifts every later index. Removing from the shared sheet propagates to every
// shadow root that adopted it (see observeRootNative), which is intended.
function removeDetectionRule(registration: Registration): void {
  if (!sheet) return
  for (let i = sheet.cssRules.length - 1; i >= 0; i--) {
    const rule = sheet.cssRules[i]
    const isDetectionRule =
      rule instanceof CSSStyleRule &&
      rule.selectorText === registration.ruleSelector &&
      rule.style.animationName === registration.animationName
    const isKeyframes = rule instanceof CSSKeyframesRule && rule.name === registration.animationName
    if (isDetectionRule || isKeyframes) sheet.deleteRule(i)
  }
}

/** Drop-in for catalyst `lazyDefine({selector: loader})`, without a MutationObserver. */
export function lazyDefineNative(definitions: Record<string, Loader>): void {
  const target = ensureSheet()
  // Prime the interaction promise at init (parity with catalyst's module-level
  // listener) so a `firstInteraction` element rendered after the user has
  // already interacted loads immediately instead of waiting for another one.
  whenFirstInteraction()
  for (const [selector, loader] of Object.entries(definitions)) {
    const existing = bySelector.get(selector)
    if (existing) {
      existing.loader = loader
      continue
    }

    const animationName = `${ANIMATION_NAME}-${nextId++}`
    const ruleSelector = detectionSelector(selector)
    const registration: Registration = {selector, ruleSelector, animationName, loader}

    // Fast path: if a match already exists, load it directly instead of waiting
    // for a CSS animation. This turns a broad selector matching hundreds of
    // present elements into one query + one load (no animation burst), and — since
    // `querySelector` ignores `:defined` state and `display` — it also covers
    // already-defined custom elements and already-present `display:none` elements
    // that the animation would never catch (parity with the MutationObserver).
    let present: Element | null
    try {
      present = document.querySelector(selector)
    } catch (error) {
      // Malformed selector; keep it isolated so the rest of the batch registers.
      reportError(error)
      continue
    }
    if (present) {
      void runLoader(registration, present)
      continue
    }

    // No match yet: install a detection rule to catch the first future insertion.
    // `!important` so a page-global animation reset (e.g. a reduced-motion
    // `*{animation:none!important}` on dotcom) cannot suppress it. Our selector is
    // more specific than the universal `*` a reset uses, and for `!important`
    // conflicts specificity beats source order, so this holds even if the reset is
    // added later (as a regular or adopted sheet). Detection would silently break
    // otherwise.
    try {
      target.insertRule(`${ruleSelector}{animation:${animationName} .001s !important}`, target.cssRules.length)
    } catch (error) {
      reportError(error)
      continue
    }
    // Each selector gets its own (identical) keyframes so `event.animationName`
    // identifies the selector directly. Inserted after the rule so a throw above
    // leaves no orphan keyframes.
    target.insertRule(
      `@keyframes ${animationName}{from{outline-color:transparent}to{outline-color:transparent}}`,
      target.cssRules.length,
    )

    bySelector.set(selector, registration)
    byAnimation.set(animationName, registration)
    ensureListening()
  }
}

/**
 * Adopt the detection stylesheet into a shadow root so lazy elements nested in
 * shadow DOM are detected too (CSS does not cross shadow boundaries). Every root
 * shares the one sheet, so removing a rule on trigger (see removeDetectionRule)
 * cleans it from every adopting root at once, which is intended.
 */
export function observeRootNative(root: ShadowRoot): void {
  const target = ensureSheet()
  if (!root.adoptedStyleSheets.includes(target)) {
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, target]
  }
}
