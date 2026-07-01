import { phoneSchema } from './phone'

function getFirstZodError(error: unknown): string {
  if (error && typeof error === 'object') {
    const zodError = error as Record<string, unknown>
    const issues = (zodError.issues || zodError.errors || []) as Array<{
      message: string
    }>
    if (issues.length > 0) {
      return issues[0].message
    }
  }
  return 'Invalid phone number.'
}

export function sanitizePhoneServer(value: string): string {
  if (!value || typeof value !== 'string') return ''
  const digits = value.replace(/[^\d]/g, '')
  return digits.slice(-10)
}

export function validatePhoneServer(
  phone: string
): { valid: boolean; error?: string; formatted?: string } {
  if (!phone || typeof phone !== 'string' || phone.trim() === '') {
    return { valid: false, error: 'Phone number is required.' }
  }

  const cleaned = sanitizePhoneServer(phone)

  if (!cleaned) {
    return { valid: false, error: 'Phone number must contain digits.' }
  }

  const result = phoneSchema.safeParse(cleaned)
  if (result.success) {
    return { valid: true, formatted: cleaned }
  }
  return {
    valid: false,
    error: getFirstZodError(result.error),
  }
}
