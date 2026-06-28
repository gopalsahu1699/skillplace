import { adminSupabase } from './supabase/admin'

const memoryStore = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetIn: number } {
  const key = `${identifier}:${Math.floor(Date.now() / windowMs)}`
  const now = Date.now()
  const resetTime = Math.ceil((Math.floor(now / windowMs) + 1) * windowMs)

  const existing = memoryStore.get(key)
  if (existing) {
    if (existing.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetIn: resetTime - now }
    }
    existing.count++
    return { allowed: true, remaining: maxRequests - existing.count, resetIn: resetTime - now }
  }

  memoryStore.set(key, { count: 1, resetTime })

  if (memoryStore.size > 10000) {
    const cutoff = now - windowMs * 2
    for (const [k, v] of memoryStore) {
      if (v.resetTime < cutoff) {
        memoryStore.delete(k)
      }
    }
  }

  return { allowed: true, remaining: maxRequests - 1, resetIn: resetTime - now }
}

export async function checkRateLimitDB(
  identifier: string,
  maxRequests: number,
  windowMs: number = 60000
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const now = Date.now()
  const resetTime = Math.ceil((Math.floor(now / windowMs) + 1) * windowMs)

  const memRecord = memoryStore.get(identifier)
  if (memRecord && now <= memRecord.resetTime) {
    if (memRecord.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetIn: memRecord.resetTime - now }
    }
  }

  const { data: attempts } = await adminSupabase
    .from('login_attempts')
    .select('id')
    .eq('ip_address', identifier)
    .eq('success', false)
    .gte('attempted_at', new Date(now - windowMs).toISOString())

  const attemptCount = attempts?.length || 0

  memoryStore.set(identifier, {
    count: Math.max(memRecord?.count || 0, attemptCount),
    resetTime: now + windowMs,
  })

  return {
    allowed: attemptCount < maxRequests,
    remaining: Math.max(0, maxRequests - attemptCount),
    resetIn: resetTime - now,
  }
}

export function getRateLimitHeaders(
  result: { allowed: boolean; remaining: number; resetIn: number }
): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetIn / 1000).toString(),
  }
  if (!result.allowed) {
    headers['Retry-After'] = Math.ceil(result.resetIn / 1000).toString()
  }
  return headers
}

export async function logLoginAttempt(
  email: string,
  ip: string,
  success: boolean,
  reason?: string
): Promise<void> {
  await adminSupabase.from('login_attempts').insert({
    email,
    ip_address: ip,
    success,
    failure_reason: reason,
  }).then(() => {}, () => {})

  if (Math.random() < 0.01) {
    adminSupabase.rpc('cleanup_expired_tokens').then(() => {}, () => {})
  }
}

setInterval(() => {
  const now = Date.now()
  for (const [key, record] of memoryStore.entries()) {
    if (now > record.resetTime) {
      memoryStore.delete(key)
    }
  }
}, 5 * 60 * 1000)
