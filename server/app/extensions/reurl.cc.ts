import { addResponseMiddleware } from './index.js'
import { HTMLElement, parseHtmlDocument, walkNode } from 'html-parser.ts'

class Found {
  constructor(public url: string) {}
}

addResponseMiddleware(async res => {
  if (!res.url.startsWith('https://reurl.cc/')) {
    return res
  }
  try {
    let html = await res.text()
    let doc = parseHtmlDocument(html)
    walkNode(doc, node => {
      if (node instanceof HTMLElement) {
        if (node.isTagName('head')) return 'skip_child'
        let id = node.attributes?.getValue('id')
        let value = node.attributes?.getValue('value')
        if (
          (id == 'url' || id == 'target') &&
          (value?.startsWith('https://') || value?.startsWith('http://'))
        ) {
          throw new Found(value)
        }
      }
    })
    return res
  } catch (exception) {
    if (!(exception instanceof Found)) throw exception
    return fetch(exception.url)
  }
})
