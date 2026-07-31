//
// Updatable Content
//
// Markup
//
//     <div class="js-socket-channel js-updatable-content"
//          data-channel="pull:123"
//          data-url="/pull/123?partial=commits">
//     </div>
//
import {fromEvent} from '@github-ui/subscription'
import {observe} from '@github-ui/selector-observer'
import {makeSocketMessageHandler} from '@github-ui/alive-socket-channel'

const handleSocketMessage = makeSocketMessageHandler()

observe('.js-socket-channel.js-updatable-content', {
  subscribe: el => fromEvent(el, 'socket:message', handleSocketMessage),
})
