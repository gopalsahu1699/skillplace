import { classifyError } from './errors/ErrorHandler'
import { errorLogger } from './errors/ErrorLogger'
import { retryManager } from './errors/RetryManager'
import type { SafeResult } from './errors/ErrorHandler'

interface ApiClientOptions extends Omit<RequestInit, 'body'> {
  timeout?: number
  retry?: boolean
  maxRetries?: number
  retryOn?: number[]
  headers?: Record<string, string>
  body?: unknown
  signal?: AbortSignal
}

interface ApiClientResponse<T> {
  data: T | null
  error: unknown
  status: number
  ok: boolean
}

const DEFAULT_TIMEOUT = 30000
const DEFAULT_RETRY_STATUSES = [429, 500, 502, 503, 504]

function getBaseUrl(): string {
  if (typeof window !== 'undefined') return ''
  const { headers } = require('next/headers') as { headers: () => Promise<{ get: (name: string) => string | null }> }
  return 'http://localhost:3000'
}

async function apiFetch<T>(
  url: string,
  options: ApiClientOptions = {},
): Promise<ApiClientResponse<T>> {
  const {
    timeout = DEFAULT_TIMEOUT,
    retry = true,
    maxRetries = 2,
    retryOn = DEFAULT_RETRY_STATUSES,
    headers: customHeaders = {},
    body,
    signal: externalSignal,
    ...fetchOptions
  } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  const combinedSignal = externalSignal
    ? combineAbortSignals(externalSignal, controller.signal)
    : controller.signal

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  const fetchFn = async (): Promise<T> => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (retry) {
        const { data, error } = await retryManager.retry(async () => {
          if (typeof navigator !== 'undefined' && !navigator.onLine) {
            throw new Error('offline')
          }
          return internalFetch()
        }, { maxRetries, baseDelayMs: 1000 })
        if (error) throw error
        return data as T
      }
      throw new Error('offline')
    }

    return internalFetch()
  }

  const internalFetch = async (): Promise<T> => {
    const res = await fetch(url, {
      ...fetchOptions,
      method: options.method ?? (body ? 'POST' : 'GET'),
      headers: { ...defaultHeaders, ...customHeaders },
      body: body ? JSON.stringify(body) : undefined,
      signal: combinedSignal,
    })

    clearTimeout(timeoutId)

    let responseData: T
    const contentType = res.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      responseData = await res.json() as T
    } else {
      responseData = (await res.text()) as unknown as T
    }

    if (!res.ok) {
      const errorData = responseData as Record<string, unknown> | null
      const errorMessage =
        (errorData?.error as string) ||
        (errorData?.message as string) ||
        `Request failed with status ${res.status}`

      if (retry && retryOn.includes(res.status)) {
        const { data, error } = await retryManager.retry(async () => {
          const retryRes = await fetch(url, {
            ...fetchOptions,
            method: options.method ?? (body ? 'POST' : 'GET'),
            headers: { ...defaultHeaders, ...customHeaders },
            body: body ? JSON.stringify(body) : undefined,
            signal: combinedSignal,
          })
          if (!retryRes.ok) {
            const retryContentType = retryRes.headers.get('content-type') || ''
            const retryData = retryContentType.includes('application/json')
              ? await retryRes.json()
              : await retryRes.text()
            throw Object.assign(new Error(`Request failed with status ${retryRes.status}`), {
              status: retryRes.status,
              data: retryData,
            })
          }
          const retryContentType = retryRes.headers.get('content-type') || ''
          return retryContentType.includes('application/json')
            ? await retryRes.json()
            : (await retryRes.text()) as unknown as T
        }, { maxRetries, baseDelayMs: 1000 })
        if (error) throw error
        return data as T
      }

      throw Object.assign(new Error(errorMessage), {
        status: res.status,
        data: responseData,
      })
    }

    return responseData
  }

  try {
    const data = await fetchFn()
    return { data, error: null, status: 200, ok: true }
  } catch (error) {
    const appError = classifyError(error)
    errorLogger.error(`API client error: ${url}`, appError)
    const status = (error as { status?: number }).status ?? 0
    return { data: null, error: appError, status, ok: false }
  }
}

function combineAbortSignals(...signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController()
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason)
      return controller.signal
    }
    signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true })
  }
  return controller.signal
}

export const apiClient = {
  fetch: <T>(url: string, options?: ApiClientOptions) =>
    apiFetch<T>(url, options),

  get: <T>(url: string, options?: ApiClientOptions) =>
    apiFetch<T>(url, { ...options, method: 'GET' }),

  post: <T>(url: string, body?: unknown, options?: ApiClientOptions) =>
    apiFetch<T>(url, { ...options, method: 'POST', body }),

  put: <T>(url: string, body?: unknown, options?: ApiClientOptions) =>
    apiFetch<T>(url, { ...options, method: 'PUT', body }),

  patch: <T>(url: string, body?: unknown, options?: ApiClientOptions) =>
    apiFetch<T>(url, { ...options, method: 'PATCH', body }),

  delete: <T>(url: string, options?: ApiClientOptions) =>
    apiFetch<T>(url, { ...options, method: 'DELETE' }),
}

export { apiFetch }
