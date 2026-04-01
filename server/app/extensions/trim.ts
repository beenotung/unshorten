import { addLinkMiddleware } from './index.js'

let delimiters = `'"「」『』（）【】()<>[]{}。，、。！？；,.'`

addLinkMiddleware(link => {
  let match = link.match(/\s*(https?:\/\/[^\s，、。！？；：""''()【】<>"]+)\s*/)
  if (match) {
    link = match[1]
  }

  for (;;) {
    if (delimiters.includes(link.slice(0, 1))) {
      link = link.slice(1)
      continue
    }
    if (delimiters.includes(link.slice(-1))) {
      link = link.slice(0, -1)
      continue
    }
    break
  }

  return link
})
