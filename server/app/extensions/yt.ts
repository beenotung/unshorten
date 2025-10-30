import { addLinkMiddleware } from './index.js'

// Essential YouTube parameters to keep
const essentialParams = ['v', 't', 'list', 'index']

// Helper function to copy essential parameters from source URL to target URL
function copyEssentialParams(sourceUrl: URL, targetUrl: URL) {
  for (let key of essentialParams) {
    if (sourceUrl.searchParams.has(key)) {
      for (let value of sourceUrl.searchParams.getAll(key)) {
        targetUrl.searchParams.append(key, value)
      }
    }
  }
}

addLinkMiddleware(link => {
  let start = pickIndex(
    link.indexOf('https://youtu.be/'),
    link.indexOf('https://www.youtube.com/watch?v='),
  )
  if (start == -1) return link

  let end = pickIndex(
    link.indexOf(' ', start),
    link.indexOf('\n', start),
    link.indexOf('\t', start),
  )
  if (end == -1) {
    // If no delimiter found, use the rest of the string
    end = link.length
  }

  let youtubeUrl = link.slice(start, end)
  let url = new URL(youtubeUrl)

  // Handle youtu.be short URLs - expand to full YouTube URL
  // Example: https://youtu.be/xxx?si=abc123 -> https://www.youtube.com/watch?v=xxx
  if (url.hostname === 'youtu.be') {
    let videoId = url.pathname.slice(1) // Remove leading slash
    let fullUrl = new URL(`https://www.youtube.com/watch`)
    fullUrl.searchParams.set('v', videoId)

    // Copy over essential parameters from the short URL
    copyEssentialParams(url, fullUrl)

    return fullUrl.href
  }

  // Handle full YouTube URLs - remove tracking parameters
  // Example: https://www.youtube.com/watch?v=xxx&si=abc123 -> https://www.youtube.com/watch?v=xxx
  if (
    url.hostname === 'www.youtube.com' &&
    url.pathname === '/watch' &&
    url.searchParams.has('v')
  ) {
    let cleanUrl = new URL(url.href)
    cleanUrl.search = '' // Clear all parameters

    // Add back only essential parameters
    copyEssentialParams(url, cleanUrl)

    return cleanUrl.href
  }

  return youtubeUrl
})

function pickIndex(...indexList: number[]) {
  indexList = indexList.filter(index => index != -1)
  if (indexList.length == 0) return -1
  return Math.min(...indexList)
}
