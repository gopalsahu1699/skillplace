import { BaseAppError } from './BaseAppError'
import { ErrorCodes } from './ErrorCodes'

export class UnknownError extends BaseAppError {
  constructor(
    message = 'An unknown error occurred',
    options: {
      details?: unknown
      cause?: unknown
    } = {},
  ) {
    super(message, {
      code: ErrorCodes.UNKNOWN,
      statusCode: 500,
      details: options.details,
      cause: options.cause,
      actionable: true,
    })
  }
}
