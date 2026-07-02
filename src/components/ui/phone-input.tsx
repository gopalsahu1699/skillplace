'use client'

import { useState, useRef, useEffect, useId, forwardRef } from 'react'
import { sanitizePhone, validatePhone } from '@/lib/validation/phone'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  id?: string
  label?: string
  className?: string
  onValidationChange?: (isValid: boolean) => void
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(function PhoneInput(
  {
    value,
    onChange,
    error: externalError,
    required = false,
    disabled = false,
    placeholder = 'xxxxxxxx',
    id: externalId,
    label = 'Phone Number',
    className,
    onValidationChange,
  },
  ref
) {
  const generatedId = useId()
  const inputId = externalId || generatedId
  const errorId = `${inputId}-error`
  const [touched, setTouched] = useState(false)
  const [internalError, setInternalError] = useState('')
  const internalRef = useRef<HTMLInputElement>(null)

  const displayError = externalError || (touched ? internalError : '')
  const hasValue = value.length > 0
  const isValid =
    hasValue && value.length === 10 && !internalError && !externalError

  useEffect(() => {
    if (value.length > 0) {
      const result = validatePhone(value)
      const err = result.valid ? '' : result.error || ''
      setInternalError(err)
      onValidationChange?.(result.valid && !externalError)
    } else {
      setInternalError('')
      onValidationChange?.(!required)
    }
  }, [value, externalError, required, onValidationChange])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    const digits = raw.replace(/[^\d]/g, '')
    if (digits.length <= 10) {
      onChange(digits)
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text')
    const sanitized = sanitizePhone(pasted)
    if (sanitized) {
      onChange(sanitized)
      setTouched(true)
    }
  }

  function handleBlur() {
    setTouched(true)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
      e.preventDefault()
    }
  }

  function handleWheel(e: React.WheelEvent) {
    if (
      internalRef.current &&
      document.activeElement === internalRef.current
    ) {
      e.preventDefault()
    }
  }

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={(node) => {
            internalRef.current = node
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
          }}
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="tel"
          value={value}
          onChange={handleChange}
          onPaste={handlePaste}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onWheel={handleWheel}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          maxLength={10}
          aria-invalid={!!displayError}
          aria-describedby={displayError ? errorId : undefined}
          className={cn(
            'h-8 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            displayError
              ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20'
              : isValid
                ? 'border-green-400 focus-visible:border-green-500 focus-visible:ring-green-500/50'
                : 'border-input focus-visible:border-ring focus-visible:ring-ring/50'
          )}
        />
        {touched && hasValue && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValid ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-destructive" />
            )}
          </div>
        )}
      </div>
      {displayError && (
        <p id={errorId} className="mt-1 text-xs text-destructive" role="alert">
          {displayError}
        </p>
      )}
    </div>
  )
})

export default PhoneInput
