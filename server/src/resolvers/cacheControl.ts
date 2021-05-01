import { CacheHint, CacheScope } from 'apollo-cache-control'
import { UseMiddleware, Directive } from 'type-graphql'

function TypeCacheControl(hint: CacheHint) {
  const cacheScope =
    hint.scope === CacheScope.Private
      ? `, scope: ${CacheScope.Private}`
      : `, scope: ${CacheScope.Public}`
  return Directive(`@cacheControl(maxAge: ${hint.maxAge}${cacheScope})`)
}

function CacheControl(hint: CacheHint) {
  return UseMiddleware(({ info }, next) => {
    info.cacheControl.setCacheHint(hint)
    return next()
  })
}

export { CacheControl, TypeCacheControl }
