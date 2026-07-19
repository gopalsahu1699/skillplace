import { BaseAppError } from './BaseAppError'
import { ErrorCodes } from './ErrorCodes'

export class ValidationError extends BaseAppError {
  public readonly fieldErrors?: Record<string, string[]>

  constructor(
    message = 'Validation failed',
    options: {
      fieldErrors?: Record<string, string[]>
      details?: unknown
      cause?: unknown
    } = {},
  ) {
    super(message, {
      code: ErrorCodes.VALIDATION_ERROR,
      statusCode: 422,
      details: options.details ?? options.fieldErrors,
      cause: options.cause,
      actionable: false,
    })
    this.fieldErrors = options.fieldErrors
  }
}
