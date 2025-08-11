import { removeTrackingParamsExcept } from '../untrack.js'
import { addLinkMiddleware } from './index.js'

addLinkMiddleware(link => {
  let start = pickIndex(
    link.indexOf('http://xhslink.com/a/'),
    link.indexOf('http://xhslink.com/m/'),
    link.indexOf('https://xhslink.com/a/'),
    link.indexOf('https://xhslink.com/m/'),
  )
  if (start == -1) return link

  let end_1 = link.indexOf('，', start)
  let end_2 = link.indexOf(' ', start)
  let end = pickIndex(end_1, end_2)
  if (end == -1) return link

  return link.slice(start, end)
})

function pickIndex(...indexList: number[]) {
  indexList = indexList.filter(index => index != -1)
  if (indexList.length == 0) return -1
  return Math.min(...indexList)
}

export function removeXhsTrackingParams(context: {
  removedTrackingParams: Record<string, string[]>
  url: URL
}) {
  removeTrackingParamsExcept(context, ['xsec_token'])
}
