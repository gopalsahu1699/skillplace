import { handleError } from './errors/ErrorHandler'
import { BaseAppError } from './errors/BaseAppError'

export type ServerActionResponse<T = unknown> =
  | { success: true; message: string; data: T }
  | { success: false; message: string; data: null; error: BaseAppError }

export function wrapServerAction<T>(
  fn: () => Promise<T>,
  options?: {
    successMessage?: string
    errorMessage?: string
    route?: string
  },
): Promise<ServerActionResponse<T>> {
  return (async () => {
    try {
      const data = await fn()
      return {
        success: true,
        message: options?.successMessage ?? 'Operation completed successfully',
        data,
      }
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'digest' in error &&
        String((error as { digest: string }).digest).startsWith('NEXT_REDIRECT')
      ) {
        throw error
      }
      if (
        typeof error === 'object' &&
        error !== null &&
        'digest' in error
      ) {
        throw error
      }

      const appError = handleError(error, { route: options?.route })
      return {
        success: false,
        message: options?.errorMessage ?? appError.userMessage,
        data: null,
        error: appError,
      }
    }
  })()
}

export function createServerAction<TArgs extends unknown[], TData>(
  fn: (...args: TArgs) => Promise<TData>,
  options?: {
    successMessage?: string
    errorMessage?: string
    route?: string
  },
): (...args: TArgs) => Promise<ServerActionResponse<TData>> {
  return async (...args: TArgs) => {
    return wrapServerAction(() => fn(...args), options)
  }
}
