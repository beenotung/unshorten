export let trackingParamKeys = [
  // reference: https://en.wikipedia.org/wiki/UTM_parameters
  'utm_id',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  // reference: https://www.karooya.com/blog/list-of-all-valuetrack-parameters-in-google-adwords/
  'gad',
  'gclid',
  // facebook tracking parameters
  'fbclid',
  // Taboola (advertising platform)
  'tblci',
]

export let facebookTrackParamKeys = ['extid', 'mibextid', 'ref', 'acontext']

export function removeTrackingParams(
  context: {
    removedTrackingParams: Record<string, string[]>
    url: URL
  },
  trackingParamKeys: string[],
) {
  let { url, removedTrackingParams } = context
  let { searchParams } = url
  for (let key of trackingParamKeys) {
    if (searchParams.has(key)) {
      removedTrackingParams[key] = searchParams.getAll(key)
      searchParams.delete(key)
    }
  }
}

// instead of remove blacklist params, this function only keep whitelist params
export function removeTrackingParamsExcept(
  context: {
    removedTrackingParams: Record<string, string[]>
    url: URL
  },
  allowedKeys: string[],
) {
  let { url, removedTrackingParams } = context
  let { searchParams } = url
  let keys = Array.from(searchParams.keys())
  for (let key of keys) {
    if (allowedKeys.includes(key)) continue
    removedTrackingParams[key] = searchParams.getAll(key)
    searchParams.delete(key)
  }
}
