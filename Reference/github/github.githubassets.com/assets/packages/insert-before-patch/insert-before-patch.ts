import {isReactInStackTrace} from '@github-ui/is-react-in-stack-trace'

export const applyInsertBeforePatch = () => {
  if (typeof Node === 'function' && Node.prototype) {
    const originalInsertBefore = Node.prototype.insertBefore
    Node.prototype.insertBefore = function <T extends Node>(node: T, child: Node | null): T {
      try {
        // @ts-expect-error some subtyping constraints
        return originalInsertBefore.apply(this, [node, child])
      } catch (e) {
        if (e instanceof Error && isReactInStackTrace(e.stack)) {
          return node
        }
        throw e
      }
    }
  }
}
