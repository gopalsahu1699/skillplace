import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js'

export const COUNTRY_CODES = [
  { code: '+91', country: 'IN', label: 'India (+91)', minDigits: 10, maxDigits: 10 },
  { code: '+1', country: 'US', label: 'US (+1)', minDigits: 10, maxDigits: 10 },
  { code: '+44', country: 'GB', label: 'UK (+44)', minDigits: 10, maxDigits: 11 },
  { code: '+61', country: 'AU', label: 'AU (+61)', minDigits: 9, maxDigits: 9 },
  { code: '+971', country: 'AE', label: 'UAE (+971)', minDigits: 9, maxDigits: 9 },
  { code: '+65', country: 'SG', label: 'SG (+65)', minDigits: 8, maxDigits: 8 },
  { code: '+86', country: 'CN', label: 'CN (+86)', minDigits: 11, maxDigits: 11 },
  { code: '+81', country: 'JP', label: 'JP (+81)', minDigits: 10, maxDigits: 10 },
  { code: '+82', country: 'KR', label: 'KR (+82)', minDigits: 9, maxDigits: 10 },
  { code: '+49', country: 'DE', label: 'DE (+49)', minDigits: 10, maxDigits: 11 },
  { code: '+33', country: 'FR', label: 'FR (+33)', minDigits: 9, maxDigits: 9 },
  { code: '+966', country: 'SA', label: 'SA (+966)', minDigits: 9, maxDigits: 9 },
  { code: '+974', country: 'QA', label: 'QA (+974)', minDigits: 8, maxDigits: 8 },
  { code: '+973', country: 'BH', label: 'BH (+973)', minDigits: 8, maxDigits: 8 },
  { code: '+968', country: 'OM', label: 'OM (+968)', minDigits: 8, maxDigits: 8 },
  { code: '+965', country: 'KW', label: 'KW (+965)', minDigits: 8, maxDigits: 8 },
] as const

export type CountryCode = typeof COUNTRY_CODES[number]['code']

/**
 * Get the maximum number of local digits allowed for a country code
 */
export function getCountryMaxDigits(countryCode: string): number {
  const country = COUNTRY_CODES.find(c => c.code === countryCode)
  return country ? country.maxDigits : 15
}

/**
 * Get minimum and maximum digit length for a country code
 */
export function getCountryDigitLimits(countryCode: string): { min: number; max: number } {
  const country = COUNTRY_CODES.find(c => c.code === countryCode)
  return country ? { min: country.minDigits, max: country.maxDigits } : { min: 7, max: 15 }
}

/**
 * Combine country code + local number into full E.164 phone string
 */
export function getFullPhone(countryCode: string, phoneNumber: string): string {
  const digits = phoneNumber.replace(/[^\d]/g, '')
  return digits ? `${countryCode}${digits}` : ''
}

/**
 * Validate phone number for a specific country.
 * Returns validation result with error message.
 */
export function validatePhoneNumber(
  phoneNumber: string,
  countryCode: string = '+91'
): { valid: boolean; error?: string; formatted?: string } {
  if (!phoneNumber || phoneNumber.trim() === '') {
    return { valid: false, error: 'Phone number is required' }
  }

  const digitsOnly = phoneNumber.replace(/[^\d]/g, '')

  if (digitsOnly.length === 0) {
    return { valid: false, error: 'Phone number must contain only digits' }
  }

  const limits = getCountryDigitLimits(countryCode)

  if (digitsOnly.length < limits.min) {
    return {
      valid: false,
      error: `Phone number must have at least ${limits.min} digits`
    }
  }

  if (digitsOnly.length > limits.max) {
    return {
      valid: false,
      error: `Phone number must have at most ${limits.max} digits`
    }
  }

  // India-specific: first digit must be 6-9
  if (countryCode === '+91') {
    if (!/^[6-9]\d{9}$/.test(digitsOnly)) {
      return {
        valid: false,
        error: 'Indian phone numbers must start with 6-9 and be exactly 10 digits'
      }
    }
  }

  const fullPhone = `${countryCode}${digitsOnly}`

  try {
    const parsed = parsePhoneNumber(fullPhone)
    if (!parsed || !isValidPhoneNumber(fullPhone)) {
      return { valid: false, error: 'Invalid phone number for selected country' }
    }
    return {
      valid: true,
      formatted: parsed.number
    }
  } catch {
    // Fallback: basic validation per country if libphonenumber-js fails
    if (countryCode === '+91' && /^[6-9]\d{9}$/.test(digitsOnly)) {
      return { valid: true, formatted: fullPhone }
    }
    if (countryCode === '+1' && /^\d{10}$/.test(digitsOnly)) {
      return { valid: true, formatted: fullPhone }
    }
    if (countryCode === '+44' && /^\d{10,11}$/.test(digitsOnly)) {
      return { valid: true, formatted: fullPhone }
    }
    return { valid: false, error: 'Invalid phone number for selected country' }
  }
}

/**
 * Format phone number with country code for storage
 */
export function formatPhoneWithCountry(
  phoneNumber: string,
  countryCode: string = '+91'
): string {
  const digitsOnly = phoneNumber.replace(/[^\d]/g, '')
  return digitsOnly ? `${countryCode}${digitsOnly}` : ''
}

/**
 * Strip formatting from phone input (keep only digits)
 */
export function sanitizePhoneInput(value: string): string {
  const cleaned = value.replace(/[^\d\s\-()]/g, '')
  return cleaned.replace(/[\s\-()]/g, '')
}

/**
 * Get placeholder text based on country
 */
export function getPhonePlaceholder(countryCode: string): string {
  switch (countryCode) {
    case '+91': return '9876543210'
    case '+1': return '(555) 123-4567'
    case '+44': return '7911123456'
    case '+61': return '412345678'
    case '+971': return '501234567'
    case '+65': return '81234567'
    case '+86': return '13812345678'
    case '+81': return '9012345678'
    default: return 'Phone number'
  }
}
