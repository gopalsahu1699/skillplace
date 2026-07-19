import { BaseAppError } from './BaseAppError'
import { ErrorCodes } from './ErrorCodes'

export class AuthenticationError extends BaseAppError {
  constructor(
    message = 'Authentication required',
    options: {
      details?: unknown
      cause?: unknown
      expired?: boolean
    } = {},
  ) {
    super(message, {
      code: options.expired ? ErrorCodes.SESSION_EXPIRED : ErrorCodes.UNAUTHORIZED,
      statusCode: 401,
      details: options.details,
      cause: options.cause,
      actionable: true,
    })
  }
}
