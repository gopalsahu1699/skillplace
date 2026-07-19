import { BaseAppError } from './BaseAppError'
import { ErrorCodes, type ErrorCode } from './ErrorCodes'

export class PaymentError extends BaseAppError {
  constructor(
    message = 'Payment failed',
    options: {
      code?: ErrorCode
      details?: unknown
      cause?: unknown
    } = {},
  ) {
    const errorCode = options.code ?? ErrorCodes.PAYMENT_ERROR
    super(message, {
      code: errorCode,
      statusCode: 402,
      details: options.details,
      cause: options.cause,
      actionable: errorCode !== ErrorCodes.PAYMENT_CANCELLED,
    })
  }
}
