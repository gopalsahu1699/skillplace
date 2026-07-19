import { BaseAppError } from './BaseAppError'
import { ApiError } from './ApiError'
import { AuthenticationError } from './AuthenticationError'
import { AuthorizationError } from './AuthorizationError'
import { ValidationError } from './ValidationError'
import { DatabaseError } from './DatabaseError'
import { StorageError } from './StorageError'
import { NetworkError } from './NetworkError'
import { PaymentError } from './PaymentError'
import { VideoError } from './VideoError'
import { UnknownError } from './UnknownError'
import { ErrorCodes } from './ErrorCodes'
import { getErrorMessage } from './ErrorMessages'
import { errorLogger } from './ErrorLogger'

export type SafeResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: BaseAppError }

export function classifyError(error: unknown, context?: { route?: string; userId?: string }): BaseAppError {
  if (error instanceof BaseAppError) return error

  const err = error as Record<string, unknown>

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new NetworkError('Failed to connect to server', { cause: error })
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    return new NetworkError('Request was cancelled', { cause: error, isTimeout: true })
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return new NetworkError('You are offline', { cause: error, isOffline: true })
  }

  if (err?.code === 'ECONNABORTED' || err?.code === 'ETIMEDOUT' || err?.code === 'UND_ERR_CONNECT_TIMEOUT') {
    return new NetworkError('Connection timed out', { cause: error, isTimeout: true })
  }

  if (err?.code === '23505') {
    return new DatabaseError('Duplicate entry', { cause: error, details: err })
  }

  if (err?.code?.toString()?.startsWith('22') || err?.code?.toString()?.startsWith('23')) {
    return new DatabaseError('Database constraint violation', { cause: error, details: err })
  }

  if (err?.name === 'PostgresError' || err?.name === 'DatabaseError') {
    return new DatabaseError('Database error', { cause: error, details: err })
  }

  if (err?.name === 'StorageError' || err?.name === 'StorageUnknownError') {
    return new StorageError('Storage operation failed', { cause: error, details: err })
  }

  if (err?.status === 401 || err?.statusCode === 401 || err?.code === 'PGRST301') {
    return new AuthenticationError('Authentication failed', { cause: error })
  }

  if (err?.status === 403 || err?.statusCode === 403) {
    return new AuthorizationError('Permission denied', { cause: error })
  }

  if (err?.status === 404 || err?.statusCode === 404) {
    return new ApiError('Resource not found', { statusCode: 404, cause: error })
  }

  if (err?.status === 429 || err?.statusCode === 429) {
    return new ApiError('Rate limit exceeded', { statusCode: 429, cause: error })
  }

  if (err?.status === 422 || err?.statusCode === 422) {
    return new ValidationError('Validation failed', { cause: error, details: err?.details as Record<string, string[]> })
  }

  if (err?.status && typeof err.status === 'number' && err.status >= 400) {
    return new ApiError(`Request failed with status ${err.status}`, {
      statusCode: err.status as number,
      cause: error,
    })
  }

  return new UnknownError('An unexpected error occurred', { cause: error })
}

export function handleError(
  error: unknown,
  context?: { route?: string; userId?: string },
): BaseAppError {
  const appError = classifyError(error, context)

  errorLogger.error(appError.userMessage, appError, {
    code: appError.code,
    referenceId: appError.referenceId,
    route: context?.route,
    userId: context?.userId,
    stack: appError.stack,
  })

  return appError
}

export function safeAsync<T>(
  fn: () => Promise<T>,
  context?: { route?: string; userId?: string },
): Promise<SafeResult<T>> {
  return (async () => {
    try {
      const data = await fn()
      return { success: true, data, error: null }
    } catch (error) {
      const appError = handleError(error, context)
      return { success: false, data: null, error: appError }
    }
  })()
}

export function safeSync<T>(fn: () => T, context?: { route?: string; userId?: string }): SafeResult<T> {
  try {
    const data = fn()
    return { success: true, data, error: null }
  } catch (error) {
    const appError = handleError(error, context)
    return { success: false, data: null, error: appError }
  }
}

export function getErrorAction(error: BaseAppError): { label: string; action: () => void } | null {
  if (!error.actionable) return null

  const msg = getErrorMessage(error.code)

  switch (error.code) {
    case ErrorCodes.UNAUTHORIZED:
    case ErrorCodes.SESSION_EXPIRED:
      return {
        label: msg.action ?? 'Sign In',
        action: () => {
          window.location.href = '/login'
        },
      }
    case ErrorCodes.NOT_FOUND:
      return {
        label: msg.action ?? 'Go Home',
        action: () => {
          window.location.href = '/'
        },
      }
    default:
      return null
  }
}
