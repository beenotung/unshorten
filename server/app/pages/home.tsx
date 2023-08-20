import { Link, renderRedirect } from '../components/router.js'
import { o } from '../jsx/jsx.js'
import { prerender } from '../jsx/html.js'
import SourceCode from '../components/source-code.js'
import { ResolvedPageRoue, Routes, StaticPageRoute } from '../routes.js'
import { config, title } from '../../config.js'
import { DynamicContext } from '../context.js'
import { renderError } from '../components/error.js'
import sanitize from 'sanitize-html'
import { trackingParamKeys } from '../untrack.js'
import { format_byte } from '@beenotung/tslib/format.js'
import { formatSize } from '../format.js'

let home = prerender(
  <div id="home">
    <h1>Reveal Shorten URL</h1>
    <form method="get" action="/reveal">
      <input name="link" placeholder="Paste shorten url here..." />
      <input type="submit" value="Reveal" />
    </form>
    <SourceCode page="home.tsx" />
  </div>,
)

function Reveal(attrs: { link: string; res: Response }) {
  let { link, res } = attrs
  let url = new URL(res.url)
  let removedTrackingParams = trackingParamKeys.filter(key => {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key)
      return true
    }
  })
  let destination = url.href
  if (url.searchParams.size > 0) {
    destination += '?' + url.searchParams
  }
  let size = +res.headers.get('content-length')!
  let server = res.headers.get('server')
  let poweredBy = res.headers.get('x-powered-by')
  return (
    <div id="reveal-page">
      <h1>Reveal Shorten URL</h1>
      <form method="get" action="/reveal">
        <input
          name="link"
          placeholder="Paste shorten url here..."
          value={link}
        />
        <input type="submit" value="Reveal" />
      </form>
      <p>
        Destination Link: <a href={destination}>{destination}</a>
      </p>
      {removedTrackingParams.length > 0 ? (
        <p>
          {removedTrackingParams.length} tracking parameters removed:{' '}
          {removedTrackingParams.join(', ')}
        </p>
      ) : null}
      <hr />
      <h2>Technical Details</h2>
      <p>Media Type: {res.headers.get('content-type') || 'Unknown'}</p>
      {size ? <p>Content Size: {formatSize(size)}</p> : null}
      {server ? <p>Server: {res.headers.get('server')}</p> : null}
      {poweredBy ? <p>Powered by: {res.headers.get('x-powered-by')}</p> : null}
      <p>Source Link: {link}</p>
      <p>Original Destination Link: {res.url}</p>
      <SourceCode page="home.tsx" />
    </div>
  )
}

function resolveReveal(
  context: DynamicContext,
): ResolvedPageRoue | StaticPageRoute {
  const link = context.routerMatch?.search
    ? new URLSearchParams(context.routerMatch?.search).get('link')
    : null
  let safeLink = link ? sanitize(link) : null
  let defaultTitle = 'Reveal Shorten URL'
  if (!link) {
    return {
      title: defaultTitle,
      description: config.site_description,
      node: renderRedirect('/'),
    }
  }
  if (!link.startsWith('http://') && !link.startsWith('https://')) {
    return {
      title: defaultTitle,
      description: config.site_description,
      node: renderError(
        'Invalid link, it should starts with http:// or https://',
        context,
      ),
    }
  }
  return fetch(link)
    .then(res => {
      return {
        title: 'Reveal ' + safeLink,
        description: `Reveal the destination of ${safeLink} and remove tracking parameters`,
        node: <Reveal link={link} res={res} />,
      }
    })
    .catch(err => {
      return {
        title: defaultTitle,
        description: `Reveal the destination of ${safeLink} and remove tracking parameters`,
        node: renderError(
          `Failed to resolve destination of ${safeLink}`,
          context,
        ),
      }
    })
}

let routes: Routes = {
  '/': {
    title: title('Home'),
    description: config.site_description,
    menuText: 'Home',
    menuUrl: '/',
    node: home,
  },
  '/reveal': {
    resolve: resolveReveal,
  },
}

export default routes
