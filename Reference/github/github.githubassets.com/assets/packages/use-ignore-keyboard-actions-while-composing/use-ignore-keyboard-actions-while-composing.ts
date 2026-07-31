import {isMacOS} from '@github-ui/get-os'
import {type CompositionEventHandler, type KeyboardEventHandler, useCallback, useMemo, useRef} from 'react'

const ignoredKeysLowercase = new Set(['enter', 'tab'])

/**
 * If the user is composing text, we don't want to respond to
 * the `Enter` key to perform a typical activation
 *
 * Composing text is a special case where the user is inputting
 * text from IME (e.g. Japanese) and we don't want to save the
 * item upon receiving the enter key as that may be part of the
 * selection of the character into the input.
 *
 * issue: https://github.com/github/memex/issues/5680
 * related: https://github.com/github/memex/issues/5680
 * related: https://github.com/facebook/react/issues/3926
 *
 * @param onKeyDown: A keyboard handler callback to wrap with a callback which ignores `ENTER`
 * and `TAB` while composing.
 *
 * @returns props which should be spread onto an `<input>` element
 **/
export const useIgnoreKeyboardActionsWhileComposing = (
  onKeyDown: KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLDivElement>,
) => {
  const isComposingRef = useRef(false)

  const handleComposition: CompositionEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLDivElement> =
    useCallback(event => {
      if (event.type === 'compositionstart') {
        isComposingRef.current = true
      }
      if (event.type === 'compositionend') {
        isComposingRef.current = false
      }
    }, [])

  const wrappedOnKeyDown: KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLDivElement> = useCallback(
    event => {
      // Cross-browser check for IME composition state
      const nativeEvent = event.nativeEvent
      const isComposingNative = nativeEvent && 'isComposing' in nativeEvent && nativeEvent.isComposing

      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      const isSafariProcessKey = event.key === 'Process'
      const isSafariIme229 = isMacOS() && event.keyCode === 229

      /*
       * Safari is known to fire the a unprintable keydown event of 229
       * after the `compositionend` event.
       * This is a workaround to prevent the keydown event from firing and causing
       * the input to be saved.
       *
       * Related: https://bugs.webkit.org/show_bug.cgi?id=165004
       * Related: https://www.stum.de/2016/06/24/handling-ime-events-in-javascript/
       */
      // Ignore Safari's phantom 229 keydown entirely
      if (isSafariIme229) return

      const isComposingInput = isComposingRef.current || isComposingNative || isSafariProcessKey

      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if (ignoredKeysLowercase.has(event.key.toLowerCase()) && isComposingInput) {
        return
      }

      onKeyDown(event)
    },
    [onKeyDown],
  )

  const inputProps = useMemo(() => {
    return {
      onCompositionStart: handleComposition,
      onCompositionEnd: handleComposition,
      onKeyDown: wrappedOnKeyDown,
    }
  }, [handleComposition, wrappedOnKeyDown])

  return inputProps
}
