import { BaseAppError } from './BaseAppError'
import { ErrorCodes } from './ErrorCodes'

export class ApiError extends BaseAppError {
  constructor(
    message: string,
    options: {
      statusCode?: number
      details?: unknown
      cause?: unknown
    } = {},
  ) {
    const code = mapStatusToErrorCode(options.statusCode)
    const isActionable =
      options.statusCode === 429 ||
      options.statusCode === 500 ||
      options.statusCode === 502 ||
      options.statusCode === 503 ||
      options.statusCode === 504

    super(message, {
      code,
      statusCode: options.statusCode ?? 500,
      details: options.details,
      cause: options.cause,
      actionable: isActionable,
    })
  }
}

function mapStatusToErrorCode(status?: number) {
  switch (status) {
    case 400: return ErrorCodes.BAD_REQUEST
    case 401: return ErrorCodes.UNAUTHORIZED
    case 403: return ErrorCodes.FORBIDDEN
    case 404: return ErrorCodes.NOT_FOUND
    case 409: return ErrorCodes.CONFLICT
    case 422: return ErrorCodes.VALIDATION_ERROR
    case 429: return ErrorCodes.RATE_LIMITED
    case 500: return ErrorCodes.INTERNAL_ERROR
    case 502:
    case 503: return ErrorCodes.SERVICE_UNAVAILABLE
    case 504: return ErrorCodes.TIMEOUT
    default: return ErrorCodes.UNKNOWN
  }
}
