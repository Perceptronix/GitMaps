import {controller} from '@github/catalyst'
import type {ErrorContext} from '@github-ui/failbot'
import type {ReactPartialAnchorElement} from '@github-ui/react-partial-anchor-element'
import {Route, Routes} from '@github-ui/react-router'

import type {EmbeddedPartialData} from './embedded-data-types'
import {PartialEntry} from './PartialEntry'
import {PartialRouter} from './PartialRouter'
import {AppProfiler, ProfilerProvider} from './ProfilerContext'
import {getPartialAnchorProps} from './react-partial-anchor'
import {getReactPartial} from './react-partial-registry'
import {ReactBaseElement} from './ReactBaseElement'

// What is this silliness? Is it react or a web component?!
// It's a web component we use to bootstrap react partials within the monolith.
@controller('react-partial')
class ReactPartialElement extends ReactBaseElement<EmbeddedPartialData> {
  nameAttribute = 'partial-name'

  async getReactNode(embeddedData: EmbeddedPartialData, onError: (error: Error, context?: ErrorContext) => void) {
    const {Component} = await getReactPartial(this.name)

    // Some React Partials will be wrapped in a react-partial-anchor, which is used to conditionally render the Partial
    const anchorElement = this.closest<ReactPartialAnchorElement>('react-partial-anchor')

    const partialAnchorProps = getPartialAnchorProps(anchorElement)

    const mergedEmbeddedData = {
      ...embeddedData,
      props: {
        ...embeddedData.props,
        ...partialAnchorProps,
      },
    }
    const routeContent = (
      <Routes>
        <Route path="*" element={<Component {...mergedEmbeddedData.props} />} />
      </Routes>
    )

    return (
      <ProfilerProvider appName={this.name} isDataRouterEnabled={false}>
        <AppProfiler id={this.name}>
          <PartialEntry partialName={this.name} onError={onError} ssrError={this.ssrError}>
            <PartialRouter partialName={this.name}>{routeContent}</PartialRouter>
          </PartialEntry>
        </AppProfiler>
      </ProfilerProvider>
    )
  }
}
