import { removeTrackingParamsExcept } from '../untrack.js'
import { addLinkMiddleware } from './index.js'

addLinkMiddleware(link => {
  let start_1 = link.indexOf('http://xhslink.com/a/')
  let start_2 = link.indexOf('http://xhslink.com/m/')
  let start_3 = link.indexOf('http://xhslink.com/o/')
  let start = pickIndex(start_1, start_2, start_3)
  if (start == -1) return link

  let end_1 = link.indexOf('，', start)
  let end_2 = link.indexOf(' ', start)
  let end_3 = link.indexOf('\n', start)
  let end = pickIndex(end_1, end_2, end_3)
  if (end == -1) return link

  return link.slice(start, end)
})

function pickIndex(...args: number[]) {
  if (args.length === 0) return -1
  return Math.min(...args.filter(a => a !== -1))
}

export function removeXhsTrackingParams(context: {
  removedTrackingParams: Record<string, string[]>
  url: URL
}) {
  removeTrackingParamsExcept(context, ['xsec_token'])
}
