export let trackingParamKeys = [
  // reference: https://en.wikipedia.org/wiki/UTM_parameters
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  // reference: https://www.karooya.com/blog/list-of-all-valuetrack-parameters-in-google-adwords/
  'gad',
  'gclid',
]

export let facebookTrackParamKeys = ['extid', 'mibextid', 'ref']

export function removeTrackingParams(params: URLSearchParams) {
  let removeCount = 0
  for (let key of trackingParamKeys) {
    if (!params.has(key)) continue
    params.delete(key)
    removeCount++
  }
  return removeCount
}
