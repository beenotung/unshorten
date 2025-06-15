export type ResponseMiddleware = (res: Response) => Response | Promise<Response>

let responseMiddlewares: ResponseMiddleware[] = []

export let responseMiddleware: ResponseMiddleware = async res => {
  for (let middleware of responseMiddlewares) {
    res = await middleware(res)
  }
  return res
}

export function addResponseMiddleware(middleware: ResponseMiddleware) {
  setTimeout(() => {
    responseMiddlewares.push(middleware)
  })
}

export type LinkMiddleware = (link: string) => string | Promise<string>

let linkMiddlewares: LinkMiddleware[] = []

export let linkMiddleware: LinkMiddleware = async link => {
  for (let middleware of linkMiddlewares) {
    link = await middleware(link)
  }
  return link
}

export function addLinkMiddleware(middleware: LinkMiddleware) {
  setTimeout(() => {
    linkMiddlewares.push(middleware)
  })
}

import './reurl.cc.js'
import './xhslink.com.js'
