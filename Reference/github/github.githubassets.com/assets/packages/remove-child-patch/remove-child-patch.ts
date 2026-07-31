import {isReactInStackTrace} from '@github-ui/is-react-in-stack-trace'

export const applyRemoveChildPatch = () => {
  if (typeof Node === 'function' && Node.prototype) {
    const originalRemoveChild = Node.prototype.removeChild
    // @ts-expect-error we always return a Node which is narrower than the function expects
    Node.prototype.removeChild = function (child) {
      try {
        return originalRemoveChild.apply(this, [child])
      } catch (e) {
        if (e instanceof Error && isReactInStackTrace(e.stack)) {
          return child
        }
        throw e
      }
    }
  }
}
