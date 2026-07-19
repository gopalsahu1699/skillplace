import { BaseAppError } from './BaseAppError'
import { ErrorCodes } from './ErrorCodes'

export class StorageError extends BaseAppError {
  constructor(
    message = 'A storage error occurred',
    options: {
      details?: unknown
      cause?: unknown
    } = {},
  ) {
    super(message, {
      code: ErrorCodes.STORAGE_ERROR,
      statusCode: 500,
      details: options.details,
      cause: options.cause,
      actionable: true,
    })
  }
}
