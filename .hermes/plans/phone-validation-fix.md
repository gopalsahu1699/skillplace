# Phone Validation Audit & Fix Plan

## AUDIT RESULTS - Phone Input Locations Found

| # | File | Current State | Validation Status |
|---|------|---------------|-------------------|
| 1 | `src/components/ui/phone-input.tsx` | Has PhoneInput component | Basic validation exists but incomplete |
| 2 | `src/app/register/page.tsx` | Uses PhoneInput component | Relies on getFullPhone check only |
| 3 | `src/app/programs/[slug]/enroll/page.tsx` | Inline select + input | **NO validation** - phoneNumber can be any value |
| 4 | `src/app/student/profile/page.tsx` | Inline select + input | **NO validation** |
| 5 | `src/app/admin-place/employees/page.tsx` | Inline select + input | **NO validation** |
| 6 | `src/components/home/CareerPathQuiz.tsx` | Inline select + input | HTML pattern only - **WEAK validation** |
| 7 | `src/components/home/ConsultationBooking.tsx` | Inline select + input | HTML pattern only - **WEAK validation** |
| 8 | `src/app/contact/page.tsx` | Inline select + input | **NO validation** |
| 9 | API routes - see below | Various | Inconsistent coverage |

## API ROUTES - Backend Validation Status

| Route | Phone Validation |
|-------|-----------------|
| `api/programs/create-order/route.ts` | Basic regex validation (India + others) |
| `api/programs/enroll/route.ts` | Basic regex validation (India + others) |
| `api/programs/verify-payment/route.ts` | **NO phone validation** |
| `api/payments/create-order/route.ts` | No phone input |
| `api/payments/verify/route.ts` | No phone input |

## ISSUES IDENTIFIED

1. **No centralized validation** - Each form has its own inline logic
2. **PhoneInput component imperfect** - Allows spaces/hyphens but validation incomplete
3. **No maxlength on manual inputs** - Users can type unlimited digits
4. **Backend validation incomplete** - Only covers some routes, not verify-payment
5. **Contact/Leads pages have no validation** - Data can be corrupted
6. **Duplicate country code lists** - Defined in multiple files instead of shared constant

## IMPLEMENTATION PLAN

### PHASE 1: Install Library & Create Utility
1. Install `libphonenumber-js` package
2. Create `src/lib/validation/phone.ts` with:
   - `validatePhoneNumber(phone: string, countryCode?: string): { valid: boolean, error?: string }`
   - `formatPhoneNumber(phone: string, countryCode?: string): string`
   - `getCountryMaxDigits(countryCode: string): number`
   - Shared `COUNTRY_CODES` constant with min/max lengths
   - Backend validation function that can be reused

### PHASE 2: Refactor PhoneInput Component
Update `src/components/ui/phone-input.tsx`:
- Use libphonenumber-js for validation
- Add proper maxlength enforcement
- Accept only digits (strip spaces/symbols on input)
- Real-time validation with clear error messages
- Export validation utilities for reuse

### PHASE 3: Fix Frontend Forms
Update all forms to use PhoneInput:
1. `src/app/register/page.tsx` - Already uses component, ensure validation works
2. `src/app/programs/[slug]/enroll/page.tsx` - Add PhoneInput component
3. `src/app/student/profile/page.tsx` - Replace inline with PhoneInput
4. `src/app/admin-place/employees/page.tsx` - Replace inline with PhoneInput
5. `src/components/home/CareerPathQuiz.tsx` - Replace inline with PhoneInput
6. `src/components/home/ConsultationBooking.tsx` - Replace inline with PhoneInput
7. `src/app/contact/page.tsx` - Replace inline with PhoneInput

### PHASE 4: Backend Validation
Create `src/lib/validation/phone-server.ts`:
- `validatePhoneServer(phone: string): { valid: boolean, error?: string }`
- Add validation to all API routes that accept phone input
- Update `api/programs/verify-payment/route.ts`
- Update `api/programs/create-order/route.ts` - improve existing
- Update `api/programs/enroll/route.ts` - improve existing

## VALIDATION RULES BY COUNTRY

Based on libphonenumber-js standards:
- India (+91): 10 digits, first digit 6-9
- US (+1): 10 digits (NANP format)
- UK (+44): 10-11 digits
- Australia (+61): 9 digits
- UAE (+971): 9 digits
- Singapore (+65): 8 digits
- China (+86): 11 digits
- Japan (+81): 10 digits
- South Korea (+82): 9-10 digits
- Germany (+49): 10-11 digits
- France (+33): 9 digits
- Saudi Arabia (+966): 9 digits
- Qatar (+974): 8 digits
- Bahrain (+973): 8 digits
- Oman (+968): 8 digits
- Kuwait (+965): 8 digits

## DELIVERABLES FOR OPENCODE

1. Install libphonenumber-js
2. Create `src/lib/validation/phone.ts` (client) and `phone-server.ts` (server)
3. Refactor PhoneInput component
4. Update all 7 frontend forms
5. Update backend API validation
6. Fix the `getFullPhone` export issue (currently used but needs to validate too)