import { GraphQLError } from 'graphql'
import type { Plugin } from 'graphql-yoga'

// Preserve the existing Apollo-compatible preflight contract, including
// rejection of empty headers and browser-simple content types.
export const usePreflightProtection = (): Plugin => ({
  onRequestParse({ request }) {
    const contentType = request.headers
      .get('content-type')
      ?.split(';')[0]
      .trim()
      .toLowerCase()
    if (
      contentType &&
      ![
        'text/plain',
        'application/x-www-form-urlencoded',
        'multipart/form-data',
      ].includes(contentType)
    )
      return
    if (
      ['apollo-require-preflight', 'x-apollo-operation-name'].some((header) =>
        request.headers.get(header)?.trim()
      )
    )
      return
    throw new GraphQLError('Required CSRF header(s) not present', {
      extensions: { code: 'BAD_REQUEST', http: { status: 400 } },
    })
  },
})
