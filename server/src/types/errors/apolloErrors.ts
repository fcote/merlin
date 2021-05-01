import { ApolloError } from 'apollo-server-core'

import { DefaultErrorCodes } from './errorCodes'

class ApolloResourceNotFound extends ApolloError {
  constructor(
    code: string = DefaultErrorCodes.RESOURCE_NOT_FOUND,
    properties?: Record<string, any>
  ) {
    const message = properties?.message ?? code
    super(message, code, properties)

    this.extensions.status = 404

    Object.defineProperty(this, 'name', { value: 'ResourceNotFound' })
  }
}

class ApolloForbidden extends ApolloError {
  constructor(
    code: string = DefaultErrorCodes.ACCESS_DENIED,
    properties?: Record<string, any>
  ) {
    const message = properties?.message ?? code
    super(message, code, properties)

    this.extensions.status = 403

    Object.defineProperty(this, 'name', { value: 'Forbidden' })
  }
}

class ApolloBadRequest extends ApolloError {
  constructor(
    code: string = DefaultErrorCodes.BAD_REQUEST,
    properties?: Record<string, any>
  ) {
    const message = properties?.message ?? code
    super(message, code, properties)

    this.extensions.status = 400

    Object.defineProperty(this, 'name', { value: 'BadRequest' })
  }
}

class ApolloConflict extends ApolloError {
  constructor(
    code: string = DefaultErrorCodes.RESOURCE_HAS_CONFLICT,
    properties?: Record<string, any>
  ) {
    const message = properties?.message ?? code
    super(message, code, properties)

    this.extensions.status = 409

    Object.defineProperty(this, 'name', { value: 'Conflict' })
  }
}

class ApolloUnprocessableEntity extends ApolloError {
  constructor(
    code: string = DefaultErrorCodes.UNPROCESSABLE_ENTITY,
    properties?: Record<string, any>
  ) {
    const message = properties?.message ?? code
    super(message, code, properties)

    this.extensions.status = 422

    Object.defineProperty(this, 'name', { value: 'UnprocessableEntity' })
  }
}

class ApolloLocked extends ApolloError {
  constructor(
    code: string = DefaultErrorCodes.RESOURCE_LOCKED,
    properties?: Record<string, any>
  ) {
    const message = properties?.message ?? code
    super(message, code, properties)

    this.extensions.status = 423

    Object.defineProperty(this, 'name', { value: 'Locked' })
  }
}

class ApolloTooManyRequests extends ApolloError {
  constructor(
    code: string = DefaultErrorCodes.TOO_MANY_REQUESTS,
    properties?: Record<string, any>
  ) {
    const message = properties?.message ?? code
    super(message, code, properties)

    this.extensions.status = 429

    Object.defineProperty(this, 'name', { value: 'TooManyRequests' })
  }
}

class ApolloInternalServerError extends ApolloError {
  constructor(
    code: string = DefaultErrorCodes.INTERNAL_SERVER_ERROR,
    properties?: Record<string, any>
  ) {
    const message = properties?.message ?? code
    super(message, code, properties)

    this.extensions.status = 500

    Object.defineProperty(this, 'name', { value: 'InternalServerError' })
  }
}

class ApolloUnauthorized extends ApolloError {
  constructor(
    code: string = DefaultErrorCodes.UNAUTHORIZED,
    properties?: Record<string, any>
  ) {
    const message = properties?.message ?? code
    super(message, code, properties)

    this.extensions.status = 401

    Object.defineProperty(this, 'name', { value: 'Unauthorized' })
  }
}

class ApolloGone extends ApolloError {
  constructor(
    code: string = DefaultErrorCodes.GONE,
    properties?: Record<string, any>
  ) {
    const message = properties?.message ?? code
    super(message, code, properties)

    this.extensions.status = 410

    Object.defineProperty(this, 'name', { value: 'Gone' })
  }
}

class ApolloNotModified extends ApolloError {
  constructor(
    code: string = DefaultErrorCodes.NOT_MODIFIED,
    properties?: Record<string, any>
  ) {
    const message = properties?.message ?? code
    super(message, code, properties)

    this.extensions.status = 304

    Object.defineProperty(this, 'name', { value: 'NotModified' })
  }
}

class ApolloPayloadTooLarge extends ApolloError {
  constructor(
    code: string = DefaultErrorCodes.PAYLOAD_TOO_LARGE,
    properties?: Record<string, any>
  ) {
    const message = properties?.message ?? code
    super(message, code, properties)

    this.extensions.status = 413

    Object.defineProperty(this, 'name', { value: 'PayloadTooLarge' })
  }
}

class ApolloApiError extends ApolloError {
  constructor(
    status: number,
    code: string = DefaultErrorCodes.APOLLO_API_ERROR,
    properties?: Record<string, any>
  ) {
    const message = properties?.message ?? code
    super(message, code, properties)

    this.extensions.status = status ?? 500

    Object.defineProperty(this, 'name', { value: 'ApiError' })
  }
}

export {
  ApolloResourceNotFound,
  ApolloBadRequest,
  ApolloForbidden,
  ApolloConflict,
  ApolloUnprocessableEntity,
  ApolloInternalServerError,
  ApolloUnauthorized,
  ApolloGone,
  ApolloNotModified,
  ApolloLocked,
  ApolloTooManyRequests,
  ApolloPayloadTooLarge,
  ApolloApiError,
}
