import {useEffect, useLayoutEffect, useRef} from 'react'

export function useTrackingRef<T>(value: T): React.RefObject<T> {
  const ref = useRef(value)

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref
}

export function useLayoutTrackingRef<T>(value: T): React.RefObject<T> {
  const ref = useRef(value)

  useLayoutEffect(() => {
    ref.current = value
  }, [value])

  return ref
}
