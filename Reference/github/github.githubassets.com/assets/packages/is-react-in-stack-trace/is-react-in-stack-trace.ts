const REACT_STACK_PATTERN = /\breact-(?:dom|lib|profiling)\b/

export function isReactInStackTrace(stack?: string) {
  if (!stack) {
    return false
  }

  return REACT_STACK_PATTERN.test(stack)
}
