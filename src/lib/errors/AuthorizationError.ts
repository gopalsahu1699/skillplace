import { BaseAppError } from './BaseAppError'
import { ErrorCodes } from './ErrorCodes'

export class AuthorizationError extends BaseAppError {
  constructor(
    message = 'Permission denied',
    options: {
      details?: unknown
      cause?: unknown
    } = {},
  ) {
    super(message, {
      code: ErrorCodes.FORBIDDEN,
      statusCode: 403,
      details: options.details,
      cause: options.cause,
      actionable: false,
    })
  }
}
