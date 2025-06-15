import { removeTrackingParamsExcept } from '../untrack.js'
import { addLinkMiddleware } from './index.js'

addLinkMiddleware(link => {
  let start = link.indexOf('http://xhslink.com/a/')
  if (start == -1) return link

  let end = link.indexOf('，', start)
  if (end == -1) return link

  return link.slice(start, end)
})

export function removeXhsTrackingParams(context: {
  removedTrackingParams: Record<string, string[]>
  url: URL
}) {
  removeTrackingParamsExcept(context, ['xsec_token'])
}
