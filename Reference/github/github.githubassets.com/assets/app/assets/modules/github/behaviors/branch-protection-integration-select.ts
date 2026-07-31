import {on} from 'delegated-events'

function changeSelection(event: Event) {
  const input = event.target as HTMLElement
  const container = input?.closest<HTMLDetailsElement>('.js-branch-protection-integration-select')
  const currentSelection = container?.querySelector<HTMLElement>('.js-branch-protection-integration-select-current')
  const item = input?.closest<HTMLElement>('.js-branch-protection-integration-select-item')
  const label = item?.querySelector<HTMLElement>('.js-branch-protection-integration-select-label')
  if (currentSelection && label && container) {
    // eslint-disable-next-line @github-ui/github-monorepo/require-set-sanitized-inner-html -- pre-existing innerHTML sink grandfathered when enabling the rule; not migrated in this rollout
    currentSelection.innerHTML = label.innerHTML
    container.open = false
  }
}

on('change', '.js-branch-protection-integration-select-input', changeSelection)
