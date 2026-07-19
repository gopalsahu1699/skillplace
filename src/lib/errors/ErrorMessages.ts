import { ErrorCodes, type ErrorCode } from './ErrorCodes'

export const ErrorMessages: Record<ErrorCode, { title: string; description: string; action?: string }> = {
  [ErrorCodes.UNKNOWN]: {
    title: 'Something went wrong',
    description: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
    action: 'Try Again',
  },
  [ErrorCodes.NETWORK_ERROR]: {
    title: 'Unable to connect',
    description: 'Unable to connect to our server. Please check your internet connection and try again.',
    action: 'Check Connection',
  },
  [ErrorCodes.TIMEOUT]: {
    title: 'Request timed out',
    description: 'The server took too long to respond. Please check your connection and try again.',
    action: 'Try Again',
  },
  [ErrorCodes.ABORTED]: {
    title: 'Request cancelled',
    description: 'The request was cancelled. Please try again.',
    action: 'Try Again',
  },
  [ErrorCodes.OFFLINE]: {
    title: 'No Internet Connection',
    description: 'You are currently offline. Some features may not work.',
    action: 'Try Again',
  },
  [ErrorCodes.BAD_REQUEST]: {
    title: 'Invalid request',
    description: 'The request could not be processed. Please check your input and try again.',
  },
  [ErrorCodes.UNAUTHORIZED]: {
    title: 'Please sign in',
    description: 'You need to sign in to access this feature.',
    action: 'Sign In',
  },
  [ErrorCodes.FORBIDDEN]: {
    title: 'Access denied',
    description: "You don't have permission to perform this action.",
  },
  [ErrorCodes.NOT_FOUND]: {
    title: 'Not found',
    description: 'The requested resource could not be found.',
  },
  [ErrorCodes.CONFLICT]: {
    title: 'Conflict',
    description: 'This action conflicts with the current state. Please refresh and try again.',
  },
  [ErrorCodes.VALIDATION_ERROR]: {
    title: 'Invalid input',
    description: 'Please check your input and try again.',
  },
  [ErrorCodes.RATE_LIMITED]: {
    title: 'Too many requests',
    description: 'Please wait a moment before trying again.',
    action: 'Try Again',
  },
  [ErrorCodes.INTERNAL_ERROR]: {
    title: 'Server error',
    description: 'Something went wrong on our side. Please try again in a few moments.',
    action: 'Try Again',
  },
  [ErrorCodes.SERVICE_UNAVAILABLE]: {
    title: 'Service unavailable',
    description: 'This service is temporarily unavailable. Please try again later.',
    action: 'Try Again',
  },
  [ErrorCodes.DATABASE_ERROR]: {
    title: 'Data error',
    description: "We couldn't load your data. Please refresh the page.",
    action: 'Refresh',
  },
  [ErrorCodes.STORAGE_ERROR]: {
    title: 'Storage error',
    description: 'Your file couldn\'t be uploaded. Please try again.',
    action: 'Try Again',
  },
  [ErrorCodes.PAYMENT_ERROR]: {
    title: 'Payment failed',
    description: 'Your payment could not be processed. Please try again or use a different payment method.',
    action: 'Try Again',
  },
  [ErrorCodes.PAYMENT_CANCELLED]: {
    title: 'Payment cancelled',
    description: 'Your payment was cancelled. No charges were made.',
  },
  [ErrorCodes.PAYMENT_TIMEOUT]: {
    title: 'Payment timeout',
    description: 'The payment session timed out. Please try again.',
    action: 'Try Again',
  },
  [ErrorCodes.PAYMENT_DUPLICATE]: {
    title: 'Duplicate payment',
    description: 'It looks like this payment was already processed.',
  },
  [ErrorCodes.PAYMENT_VERIFICATION_FAILED]: {
    title: 'Verification failed',
    description: 'We could not verify your payment. Please contact support.',
  },
  [ErrorCodes.PAYMENT_GATEWAY_DOWN]: {
    title: 'Payment gateway unavailable',
    description: 'The payment service is temporarily unavailable. Please try again later.',
    action: 'Try Again',
  },
  [ErrorCodes.PAYMENT_WEBHOOK_PENDING]: {
    title: 'Payment processing',
    description: 'Your payment is being processed. This may take a few moments.',
  },
  [ErrorCodes.VIDEO_NOT_FOUND]: {
    title: 'Video unavailable',
    description: 'This lecture is currently unavailable.',
  },
  [ErrorCodes.VIDEO_UNAVAILABLE]: {
    title: 'Video temporarily unavailable',
    description: 'This lecture is temporarily unavailable. Please try again later.',
    action: 'Try Again',
  },
  [ErrorCodes.VIDEO_UPLOAD_FAILED]: {
    title: 'Upload failed',
    description: 'Your file couldn\'t be uploaded. Please try again.',
    action: 'Try Again',
  },
  [ErrorCodes.SESSION_EXPIRED]: {
    title: 'Session expired',
    description: 'Your session has expired. Please sign in again.',
    action: 'Sign In',
  },
  [ErrorCodes.SERVER_ERROR]: {
    title: 'Server error',
    description: 'Something went wrong on our side. Please try again in a few moments.',
    action: 'Try Again',
  },
  [ErrorCodes.INVALID_API_KEY]: {
    title: 'Configuration error',
    description: 'There is a configuration issue. Please contact support.',
  },
}

export function getErrorMessage(code: ErrorCode): { title: string; description: string; action?: string } {
  return ErrorMessages[code] ?? ErrorMessages[ErrorCodes.UNKNOWN]
}
