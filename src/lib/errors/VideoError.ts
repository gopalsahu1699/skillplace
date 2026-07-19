import { BaseAppError } from './BaseAppError'
import { ErrorCodes } from './ErrorCodes'

export class VideoError extends BaseAppError {
  constructor(
    message = 'Video error',
    options: {
      details?: unknown
      cause?: unknown
      notFound?: boolean
    } = {},
  ) {
    super(message, {
      code: options.notFound ? ErrorCodes.VIDEO_NOT_FOUND : ErrorCodes.VIDEO_UNAVAILABLE,
      statusCode: 404,
      details: options.details,
      cause: options.cause,
      actionable: !options.notFound,
    })
  }
}
