import { removeTrackingParamsExcept } from '../untrack.js'
import { addLinkMiddleware } from './index.js'

addLinkMiddleware(link => {
  let start_1 = link.indexOf('http://xhslink.com/a/')
  let start_2 = link.indexOf('http://xhslink.com/m/')
  let start = pickIndex(start_1, start_2)
  if (start == -1) return link

  let end_1 = link.indexOf('，', start)
  let end_2 = link.indexOf(' ', start)
  let end = pickIndex(end_1, end_2)
  if (end == -1) return link

  return link.slice(start, end)
})

function pickIndex(a: number, b: number) {
  if (a == -1) return b
  if (b == -1) return a
  return a < b ? a : b
}

export function removeXhsTrackingParams(context: {
  removedTrackingParams: Record<string, string[]>
  url: URL
}) {
  removeTrackingParamsExcept(context, ['xsec_token'])
}
