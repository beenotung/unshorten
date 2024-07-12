export type ResponseMiddleware = (res: Response) => Response | Promise<Response>

let middlewares: ResponseMiddleware[] = []

export let responseMiddleware: ResponseMiddleware = async res => {
  for (let middleware of middlewares) {
    res = await middleware(res)
  }
  return res
}

export function addResponseMiddleware(middleware: ResponseMiddleware) {
  setTimeout(() => {
    middlewares.push(middleware)
  })
}

import './reurl.cc.js'
