import {getPlatform} from '@github-ui/platform-toggle'
import {observe} from '@github-ui/selector-observer'

function runningOnPlatform(element: Element): boolean {
  const platforms = (element.getAttribute('data-platforms') || '').split(',')
  const platform = getPlatform()
  return Boolean(platform && platforms.includes(platform))
}

observe('.js-remove-unless-platform', function (el) {
  if (!runningOnPlatform(el)) {
    el.remove()
  }
})
