import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js'
import { COUNTRY_CODES } from './phone'

/**
 * Server-side phone validation using libphonenumber-js
 * Used by API routes to validate incoming phone data
 * @param phone - Full phone number including country code (e.g., "+919876543210")
 * @param countryCode - Optional country code hint if phone doesn't include it
 */
export function validatePhoneServer(
  phone: string,
  countryCode?: string
): { valid: boolean; error?: string; formatted?: string } {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required' }
  }

  const cleaned = phone.replace(/[\s\-()]/g, '').trim()

  if (!cleaned) {
    return { valid: false, error: 'Phone number is required' }
  }

  let fullPhone = cleaned
  if (!cleaned.startsWith('+')) {
    if (countryCode) {
      fullPhone = countryCode + cleaned
    } else {
      return { valid: false, error: 'Phone number must include country code (e.g., +91)' }
    }
  }

  if (!isValidPhoneNumber(fullPhone)) {
    const match = cleaned.match(/^\+(\d{1,4})/)
    if (match) {
      const detectedCode = `+${match[1]}`
      const country = COUNTRY_CODES.find((c) => c.code === detectedCode)
      if (country) {
        return {
          valid: false,
          error: `Invalid ${country.country} phone number. Expected ${country.minDigits}-${country.maxDigits} digits.`,
        }
      }
    }
    return { valid: false, error: 'Invalid phone number format' }
  }

  try {
    const parsed = parsePhoneNumber(fullPhone)
    return { valid: true, formatted: parsed.number }
  } catch {
    return { valid: true, formatted: fullPhone }
  }
}

/**
 * Format phone number for storage (server-side)
 */
export function formatPhoneServer(phone: string, countryCode: string = '+91'): string {
  if (!phone) return ''
  const digits = phone.replace(/[\s\-()]/g, '').trim()
  if (!digits) return ''

  let fullPhone = digits
  if (!digits.startsWith('+')) {
    fullPhone = countryCode + digits
  }

  try {
    const parsed = parsePhoneNumber(fullPhone)
    return parsed.number
  } catch {
    return '+' + digits
  }
}
