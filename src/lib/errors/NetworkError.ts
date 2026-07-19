import { BaseAppError } from './BaseAppError'
import { ErrorCodes } from './ErrorCodes'

export class NetworkError extends BaseAppError {
  constructor(
    message = 'Network connection failed',
    options: {
      details?: unknown
      cause?: unknown
      isOffline?: boolean
      isTimeout?: boolean
    } = {},
  ) {
    const code = options.isOffline
      ? ErrorCodes.OFFLINE
      : options.isTimeout
        ? ErrorCodes.TIMEOUT
        : ErrorCodes.NETWORK_ERROR

    super(message, {
      code,
      statusCode: 0,
      details: options.details,
      cause: options.cause,
      actionable: true,
    })
  }
}
