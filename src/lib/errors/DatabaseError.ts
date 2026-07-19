import { BaseAppError } from './BaseAppError'
import { ErrorCodes } from './ErrorCodes'

export class DatabaseError extends BaseAppError {
  constructor(
    message = 'A database error occurred',
    options: {
      details?: unknown
      cause?: unknown
    } = {},
  ) {
    super(message, {
      code: ErrorCodes.DATABASE_ERROR,
      statusCode: 500,
      details: options.details,
      cause: options.cause,
      actionable: true,
    })
  }
}
