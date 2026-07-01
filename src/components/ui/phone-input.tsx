'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Check, XCircle } from 'lucide-react'
import {
  COUNTRY_CODES,
  validatePhoneNumber,
  getCountryMaxDigits,
} from '@/lib/validation/phone'

interface PhoneInputProps {
  phoneCode: string
  phoneNumber: string
  onPhoneCodeChange: (code: string) => void
  onPhoneNumberChange: (number: string) => void
  onValidationChange?: (isValid: boolean) => void
  placeholder?: string
  required?: boolean
  className?: string
  errorClassName?: string
}

export default function PhoneInput({
  phoneCode,
  phoneNumber,
  onPhoneCodeChange,
  onPhoneNumberChange,
  onValidationChange,
  placeholder,
  required = false,
  className = '',
  errorClassName = '',
}: PhoneInputProps) {
  const [phoneValid, setPhoneValid] = useState<boolean | null>(null)
  const [phoneError, setPhoneError] = useState<string>('')
  const phoneNumberRef = useRef(phoneNumber)

  useEffect(() => {
    phoneNumberRef.current = phoneNumber
  }, [phoneNumber])

  const maxLength = getCountryMaxDigits(phoneCode)

  // Validate phone on change
  function validatePhone(num: string): boolean {
    const result = validatePhoneNumber(num, phoneCode)
    if (!result.valid) {
      setPhoneError(result.error || '')
      return false
    }
    setPhoneError('')
    return true
  }

  function handlePhoneChange(value: string) {
    // Allow only digits, spaces, hyphens, parentheses for flexibility
    const cleaned = value.replace(/[^\d\s\-()]/g, '')
    const digitsOnly = cleaned.replace(/[\s\-()]/g, '')

    // Enforce max length
    if (digitsOnly.length > maxLength) {
      return
    }

    onPhoneNumberChange(cleaned)

    if (digitsOnly.length > 0) {
      const valid = validatePhone(digitsOnly)
      setPhoneValid(valid)
      onValidationChange?.(valid)
    } else {
      setPhoneValid(null)
      setPhoneError(required ? 'Phone number is required' : '')
      onValidationChange?.(true)
    }
  }

  // Get hint for placeholder based on country
  const getHint = () => {
    if (phoneCode === '+91') return '9876543210'
    if (phoneCode === '+1') return '(555) 123-4567'
    if (phoneCode === '+44') return '7911123456'
    if (phoneCode === '+65') return '81234567'
    if (phoneCode === '+971') return '501234567'
    return 'Phone number'
  }

  // Handle country change - re-validate phone number
  function handleCountryChange(newCode: string) {
    onPhoneCodeChange(newCode)
    const digits = phoneNumber.replace(/[\s\-()]/g, '')
    if (digits.length > 0) {
      const valid = validatePhone(digits)
      setPhoneValid(valid)
      onValidationChange?.(valid)
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <select
          value={phoneCode}
          onChange={(e) => handleCountryChange(e.target.value)}
          className="w-[130px] shrink-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
        <div className="relative flex-1">
          <Input
            type="tel"
            placeholder={placeholder || getHint()}
            value={phoneNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className={`pl-4 pr-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500 ${
              phoneValid === false ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''
            } ${className} ${errorClassName}`}
            required={required}
            maxLength={maxLength}
          />
          {phoneValid !== null && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {phoneValid ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-400" />
              )}
            </div>
          )}
        </div>
      </div>
      {phoneValid === false && phoneError && (
        <p className="text-xs text-red-500 mt-1">{phoneError}</p>
      )}
    </div>
  )
}

// Re-export utilities for backward compatibility
export { getFullPhone } from '@/lib/validation/phone'
export { COUNTRY_CODES } from '@/lib/validation/phone'