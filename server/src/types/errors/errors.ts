import { DefaultErrorCodes } from './errorCodes'

class BaseError extends Error {
  public status: number
  public stack: any
  public requestId: string
  public expose: boolean
  public properties: any
  public code: string
}

class APIError extends BaseError {
  constructor({
    status = 500,
    code = DefaultErrorCodes.API_ERROR,
    properties,
  }: {
    status: number
    code: string
    properties?: any
  }) {
    const message = properties?.message ?? code
    super(message)
    this.code = code
    this.status = status
    this.expose = true
    this.properties = properties
  }
}

class BadRequest extends APIError {
  constructor(code: string = DefaultErrorCodes.BAD_REQUEST, properties?: any) {
    super({ status: 400, code, properties })
  }
}

class Unauthorized extends APIError {
  constructor(code: string = DefaultErrorCodes.UNAUTHORIZED, properties?: any) {
    super({ status: 401, code, properties })
  }
}

class Forbidden extends APIError {
  constructor(
    code: string = DefaultErrorCodes.ACCESS_DENIED,
    properties?: any
  ) {
    super({ status: 403, code, properties })
  }
}

class NotFound extends APIError {
  constructor(
    code: string = DefaultErrorCodes.RESOURCE_NOT_FOUND,
    properties?: any
  ) {
    super({ status: 404, code, properties })
  }
}

class Conflict extends APIError {
  constructor(
    code: string = DefaultErrorCodes.RESOURCE_HAS_CONFLICT,
    properties?: any
  ) {
    super({ status: 409, code, properties })
  }
}

class UnprocessableEntity extends APIError {
  constructor(
    code: string = DefaultErrorCodes.UNPROCESSABLE_ENTITY,
    properties?: any
  ) {
    super({ status: 422, code, properties })
  }
}

class Locked extends APIError {
  constructor(
    code: string = DefaultErrorCodes.RESOURCE_LOCKED,
    properties?: any
  ) {
    super({ status: 423, code, properties })
  }
}

class TooManyRequests extends APIError {
  constructor(
    code: string = DefaultErrorCodes.TOO_MANY_REQUESTS,
    properties?: any
  ) {
    super({ status: 429, code, properties })
  }
}

class InternalServerError extends APIError {
  constructor(
    code: string = DefaultErrorCodes.INTERNAL_SERVER_ERROR,
    properties?: any
  ) {
    super({ status: 500, code, properties })
  }
}

class Gone extends APIError {
  constructor(code: string = DefaultErrorCodes.GONE, properties?: any) {
    super({ status: 410, code, properties })
  }
}

class NotModified extends APIError {
  constructor(code: string = DefaultErrorCodes.NOT_MODIFIED, properties?: any) {
    super({ status: 304, code, properties })
  }
}

class PayloadTooLarge extends APIError {
  constructor(
    code: string = DefaultErrorCodes.PAYLOAD_TOO_LARGE,
    properties?: any
  ) {
    super({ status: 413, code, properties })
  }
}

class ApiError extends APIError {
  constructor(
    status: number,
    code: string = DefaultErrorCodes.API_ERROR,
    properties?: any
  ) {
    super({ status, code, properties })
  }
}

export {
  BaseError,
  APIError,
  BadRequest,
  Unauthorized,
  Forbidden,
  NotFound,
  Conflict,
  UnprocessableEntity,
  InternalServerError,
  Locked,
  Gone,
  NotModified,
  TooManyRequests,
  ApiError,
  PayloadTooLarge,
}
