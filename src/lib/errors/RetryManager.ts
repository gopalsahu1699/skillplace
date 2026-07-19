import { NetworkError } from './NetworkError'
import { ErrorCodes, type ErrorCode } from './ErrorCodes'
import { errorLogger } from './ErrorLogger'

const RETRYABLE_CODES: Set<ErrorCode> = new Set([
  ErrorCodes.NETWORK_ERROR,
  ErrorCodes.TIMEOUT,
  ErrorCodes.ABORTED,
  ErrorCodes.OFFLINE,
  ErrorCodes.INTERNAL_ERROR,
  ErrorCodes.SERVICE_UNAVAILABLE,
  ErrorCodes.RATE_LIMITED,
])

const NEVER_RETRY_CODES: Set<ErrorCode> = new Set([
  ErrorCodes.UNAUTHORIZED,
  ErrorCodes.FORBIDDEN,
  ErrorCodes.NOT_FOUND,
  ErrorCodes.VALIDATION_ERROR,
  ErrorCodes.BAD_REQUEST,
])

export interface RetryOptions {
  maxRetries?: number
  baseDelayMs?: number
  maxDelayMs?: number
  onRetry?: (attempt: number, error: unknown) => void
  retryableCodes?: Set<ErrorCode>
}

export class RetryManager {
  private static instance: RetryManager

  static getInstance(): RetryManager {
    if (!RetryManager.instance) {
      RetryManager.instance = new RetryManager()
    }
    return RetryManager.instance
  }

  private getDelay(attempt: number, baseDelayMs: number, maxDelayMs: number): number {
    const delay = baseDelayMs * Math.pow(2, attempt)
    const jitter = Math.random() * 1000
    return Math.min(delay + jitter, maxDelayMs)
  }

  isRetryable(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false

    const code = (error as { code?: string }).code as ErrorCode | undefined

    if (code && NEVER_RETRY_CODES.has(code)) return false
    if (code && RETRYABLE_CODES.has(code)) return true

    if (error instanceof NetworkError) return true
    if (error instanceof TypeError) return true

    const msg = String(error).toLowerCase()
    if (
      msg.includes('network') ||
      msg.includes('timeout') ||
      msg.includes('fetch') ||
      msg.includes('econnrefused') ||
      msg.includes('enotfound') ||
      msg.includes('etimedout') ||
      msg.includes('429') ||
      msg.includes('502') ||
      msg.includes('503') ||
      msg.includes('504')
    ) {
      return true
    }

    return false
  }

  async retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {},
  ): Promise<{ data: T; error: null } | { data: null; error: unknown }> {
    const {
      maxRetries = 3,
      baseDelayMs = 1000,
      maxDelayMs = 30000,
      onRetry,
      retryableCodes = RETRYABLE_CODES,
    } = options

    let lastError: unknown

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          throw new NetworkError('Device is offline', { isOffline: true })
        }

        const result = await fn()
        return { data: result, error: null }
      } catch (error) {
        lastError = error

        if (attempt < maxRetries && this.isRetryable(error)) {
          const delay = this.getDelay(attempt, baseDelayMs, maxDelayMs)
          errorLogger.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`, error)

          onRetry?.(attempt + 1, error)
          await new Promise((resolve) => setTimeout(resolve, delay))
          continue
        }

        break
      }
    }

    return { data: null, error: lastError }
  }
}

export const retryManager = RetryManager.getInstance()
