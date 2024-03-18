import { renderRedirect } from '../components/router.js'
import { o } from '../jsx/jsx.js'
import { prerender } from '../jsx/html.js'
import SourceCode from '../components/source-code.js'
import { ResolvedPageRoue, Routes, StaticPageRoute } from '../routes.js'
import { config, title } from '../../config.js'
import { DynamicContext } from '../context.js'
import { renderError } from '../components/error.js'
import sanitize from 'sanitize-html'
import {
  facebookTrackParamKeys,
  removeTrackingParams,
  trackingParamKeys,
} from '../untrack.js'
import { formatSize } from '../format.js'
import { Style } from '../components/style.js'
import { new_counter } from '@beenotung/tslib/counter.js'
import { mapArray } from '../components/fragment.js'

let style = Style(/* css */ `
table.search-params {
  border-collapse: collapse;
  margin-top: 0.25rem;
  margin-inline-start: 0.25rem;
}
table.search-params th,
table.search-params td {
  border: 1px solid;
  padding: 0.25rem;
}
table.search-params th {
  text-align: start;
}
.long-line {
  word-wrap: anywhere;
}
.inline-block {
  display: inline-block;
}
.field-label {
  font-weight: 600;
}
`)

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
  if (url.href.startsWith('https://r.lihkg.com/link')) {
    let u = url.searchParams.get('u')
    if (u) url = new URL(u)
  }
  let removedTrackingParams: Record<string, string[]> = {}
  removeTrackingParams({ removedTrackingParams, url }, trackingParamKeys)
  if (url.hostname.indexOf('facebook')) {
    removeTrackingParams({ removedTrackingParams, url }, facebookTrackParamKeys)
  }
  let removedTrackingParamEntries = Object.entries(removedTrackingParams)
  let urlSearchParamEntries = Array.from(url.searchParams.entries())
  let short_url = url.href.replace(url.search, '').replace(/\/$/, '')
  let size = +res.headers.get('content-length')!
  let server = res.headers.get('server')
  let poweredBy = res.headers.get('x-powered-by')
  return (
    <div id="reveal-page">
      <h1>Reveal Shorten URL</h1>
      {style}
      <form method="get" action="/reveal">
        <input
          name="link"
          placeholder="Paste shorten url here..."
          value={decodeURI( link)}
        />
        <input type="submit" value="Reveal" />
      </form>
      <Field
        label="Destination Link"
        value={
          <a href={decodeURI(url.href)} rel="nofollow">
            {decodeURI(short_url)}
          </a>
        }
      />
      {urlSearchParamEntries.length > 0 ? (
        <div>
          <div class="label">Search params in the link: </div>
          <table class="search-params">
            <thead>
              <tr>
                <th>Param</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {[
                Array.from(urlSearchParamEntries, ([key, value]) => (
                  <tr>
                    <td>{key}</td>
                    <td class="long-line">{value}</td>
                  </tr>
                )),
              ]}
            </tbody>
          </table>
        </div>
      ) : null}
      {removedTrackingParamEntries.length > 0 ? (
        <Field
          label={
            removedTrackingParamEntries.length + ' tracking params removed'
          }
          value={mapArray(
            removedTrackingParamEntries,
            ([key, values]) => (
              <span
                title={values.map(value => `${key}=${value}`).join('&')}
                data-key={key}
                onclick="this.textContent=this.textContent==this.title?this.dataset.key:this.title"
              >
                {key}
              </span>
            ),
            ', ',
          )}
        />
      ) : null}

      <hr />
      <h2>Technical Details</h2>
      <Field
        label="Response Status"
        value={`${res.status} (${res.statusText})`}
      />
      <Field
        label="Media Type"
        value={res.headers.get('content-type') || 'Unknown'}
      />
      {size ? <Field label="Content Size" value={formatSize(size)} /> : null}
      {server ? <Field label="Server" value={server} /> : null}
      {poweredBy ? <Field label="Powered by" value={poweredBy} /> : null}
      <Field label="Source Link" value={link} />
      {res.url != url.href && res.url != link ? (
        <Field label="Original Destination Link" value={res.url} />
      ) : null}
      <Field label="Resolved Destination Link" value={decodeURI(url.href)} />
      <SourceCode page="home.tsx" />
    </div>
  )
}

let fieldCounter = new_counter()

function Field(attrs: { label: string; value: any }) {
  let id = 'field-' + fieldCounter.next()
  return (
    <p class="long-line">
      <label class="field-label" for={id}>
        {attrs.label}:{' '}
      </label>
      <span class="inline-block" id={id}>
        {attrs.value}
      </span>
    </p>
  )
}

function resolveReveal(
  context: DynamicContext,
): ResolvedPageRoue | StaticPageRoute {
  let link = context.routerMatch?.search
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
  if (!link.includes('://')) {
    link = 'https://' + link
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
        node: <Reveal link={link!} res={res} />,
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
