export function isNetworkError(error: unknown): boolean {
  if (!error) return false

  const msg = (error as { message?: string })?.message?.toLowerCase() || ''
  const code = (error as { code?: string })?.code || ''

  return (
    msg.includes('network') ||
    msg.includes('fetch') ||
    msg.includes('failed to fetch') ||
    msg.includes('load') ||
    msg.includes('abort') ||
    msg.includes('timeout') ||
    msg.includes('internet') ||
    msg.includes('econnrefused') ||
    msg.includes('enotfound') ||
    msg.includes('etimedout') ||
    code === 'NETWORK_ERROR' ||
    code === 'ERR_NETWORK' ||
    code === 'ECONNABORTED' ||
    code === '23505'
  )
}

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

export async function withRetry<T>(
  fn: () => Promise<T> | (PromiseLike<T> & { then: unknown }),
  options: { maxRetries?: number; baseDelay?: number; onRetry?: (attempt: number, error: unknown) => void } = {}
): Promise<{ data: T | null; error: unknown }> {
  const { maxRetries = 3, baseDelay = 1000, onRetry } = options

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await Promise.resolve(fn())
      return { data: result, error: null }
    } catch (error) {
      if (attempt < maxRetries && isNetworkError(error)) {
        onRetry?.(attempt + 1, error)
        await new Promise((r) => setTimeout(r, baseDelay * Math.pow(2, attempt)))
        continue
      }
      return { data: null, error }
    }
  }

  return { data: null, error: new Error('Max retries exceeded') }
}
