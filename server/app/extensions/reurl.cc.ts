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
        if (node.attributes?.getValue('id') != 'url') return
        let url = node.attributes.getValue('value')!
        if (url) throw new Found(url)
      }
    })
    return res
  } catch (exception) {
    if (!(exception instanceof Found)) throw exception
    return fetch(exception.url)
  }
})
