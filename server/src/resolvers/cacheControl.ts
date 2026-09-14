import {
  CacheHint,
  maybeCacheControlFromInfo,
} from '@apollo/cache-control-types'
import { UseMiddleware, Directive } from 'type-graphql'

function TypeCacheControl(hint: CacheHint) {
  return Directive(
    `@cacheControl(maxAge: ${hint.maxAge}, scope: ${
      hint.scope ?? 'PUBLIC'
    }, inheritMaxAge: false)`
  )
}

function CacheControl(hint: CacheHint) {
  return UseMiddleware(({ info }, next) => {
    maybeCacheControlFromInfo(info)?.setCacheHint(hint)
    return next()
  })
}

export { CacheControl, TypeCacheControl }
