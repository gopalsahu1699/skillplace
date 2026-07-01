import { z } from 'zod'

export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required.')
  .regex(/^\d+$/, 'Phone number must contain only digits.')
  .length(10, 'Phone number must contain exactly 10 digits.')
  .refine((val) => /^[6-9]/.test(val), {
    message: 'Phone number must start with 6, 7, 8 or 9.',
  })

export type PhoneValidation = z.infer<typeof phoneSchema>

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

export function sanitizePhone(value: string): string {
  const digits = value.replace(/[^\d]/g, '')
  return digits.slice(-10)
}

export function displayPhone(phone: string | null | undefined): string {
  if (!phone) return ''
  const digits = phone.replace(/[^\d]/g, '')
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
  }
  return phone
}

export function validatePhone(value: string): {
  valid: boolean
  error?: string
} {
  if (!value || value.trim() === '') {
    return { valid: false, error: 'Phone number is required.' }
  }
  const sanitized = sanitizePhone(value)
  const result = phoneSchema.safeParse(sanitized)
  if (result.success) return { valid: true }
  return {
    valid: false,
    error: getFirstZodError(result.error),
  }
}

export function validatePhoneStrict(value: string): {
  valid: boolean
  error?: string
  formatted?: string
} {
  const result = phoneSchema.safeParse(value)
  if (result.success) return { valid: true, formatted: value }
  return {
    valid: false,
    error: getFirstZodError(result.error),
  }
}
