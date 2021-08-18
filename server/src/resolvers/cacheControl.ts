import { CacheHint, CacheScope } from 'apollo-server-types'
import { UseMiddleware, Directive } from 'type-graphql'

function TypeCacheControl(hint: CacheHint) {
  return Directive(
    `@cacheControl(maxAge: ${hint.maxAge}, scope: ${
      hint.scope ?? CacheScope.Public
    }, inheritMaxAge: false)`
  )
}

function CacheControl(hint: CacheHint) {
  return UseMiddleware(({ info }, next) => {
    info.cacheControl.setCacheHint(hint)
    return next()
  })
}

export { CacheControl, TypeCacheControl }
