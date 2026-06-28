# Testing Guide — Skillplace Academy

## Test Framework: Vitest + React Testing Library

## File Structure
```
src/
├── tests/
│   ├── setup.ts              # Test configuration
│   ├── utils/
│   │   ├── test-utils.tsx    # Custom render with providers
│   │   └── supabase.ts       # Mock supabase client
├── __tests__/
│   ├── api/
│   │   ├── auth.test.ts
│   │   ├── payments.test.ts
│   │   ├── admin.test.ts
│   │   └── courses.test.ts
│   ├── components/
│   │   ├── CourseCard.test.tsx
│   │   └── Navbar.test.tsx
│   ├── hooks/
│   │   └── useAuth.test.ts
│   └── utils/
│       ├── formatPrice.test.ts
│       └── validation.test.ts
```

## Test Categories

### 1. Unit Tests — Utilities & Validation
```typescript
import { describe, it, expect } from 'vitest'
import { formatPrice, validateEmail, slugify } from '@/lib/utils'

describe('formatPrice', () => {
  it('formats INR correctly', () => {
    expect(formatPrice(4999)).toBe('₹4,999')
    expect(formatPrice(0)).toBe('₹0')
    expect(formatPrice(29999)).toBe('₹29,999')
  })
})

describe('validateEmail', () => {
  it('validates correct emails', () => {
    expect(validateEmail('test@example.com')).toBe(true)
  })
  it('rejects invalid emails', () => {
    expect(validateEmail('invalid')).toBe(false)
    expect(validateEmail('test@')).toBe(false)
  })
})
```

### 2. Component Tests — UI Components
```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import CourseCard from '@/components/courses/CourseCard'

describe('CourseCard', () => {
  it('renders course title', () => {
    render(<CourseCard course={{ title: 'AutoCAD 2D', price: 4999 }} />)
    expect(screen.getByText('AutoCAD 2D')).toBeInTheDocument()
  })

  it('displays formatted price', () => {
    render(<CourseCard course={{ title: 'Test', price: 4999 }} />)
    expect(screen.getByText('₹4,999')).toBeInTheDocument()
  })
})
```

### 3. Hook Tests
```typescript
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useAuth } from '@/hooks/useAuth'

describe('useAuth', () => {
  it('starts unauthenticated', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.user).toBeNull()
    expect(result.current.loading).toBe(false)
  })
})
```

### 4. API Route Tests
```typescript
import { describe, it, expect, vi } from 'vitest'

describe('POST /api/payments/create-order', () => {
  it('creates order for valid course', async () => {
    // Mock supabase
    // Mock razorpay
    // Test response
  })

  it('rejects unauthenticated requests', async () => {
    // Test 401 response
  })

  it('validates input', async () => {
    // Test 400 for invalid input
  })
})
```

### 5. E2E Tests (Playwright)
```typescript
import { test, expect } from '@playwright/test'

test('user can browse and enroll in course', async ({ page }) => {
  await page.goto('/courses')
  await expect(page.locator('h1')).toContainText('Courses')

  await page.click('text=AutoCAD 2D')
  await expect(page.locator('h1')).toContainText('AutoCAD 2D')

  await page.click('text=Enroll Now')
  // Should redirect to login or enrollment
})
```

## Critical Test Cases

### Auth
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Register new user
- [ ] Password reset flow
- [ ] Session expiry
- [ ] Logout

### Payments
- [ ] Create order for course
- [ ] Create order for program
- [ ] Coupon validation (valid/expired/exceeded)
- [ ] Webhook signature verification
- [ ] Payment success → enrollment created
- [ ] Payment failure handling

### Courses
- [ ] List courses (filtering, pagination)
- [ ] View course detail
- [ ] Enroll → access granted
- [ ] Progress tracking
- [ ] Test submission
- [ ] Certificate generation

### Admin
- [ ] Admin can access panel
- [ ] Non-admin blocked
- [ ] CRUD operations on courses
- [ ] CRUD operations on programs
- [ ] Student management
- [ ] Certificate issuance
- [ ] Lead management

## Test Database
- Use separate test Supabase project
- Seed minimal test data before each test
- Clean up after tests
- Never run tests against production

## Coverage Targets
- Utilities: 90%+
- API routes: 80%+
- Components: 70%+
- Overall: 75%+
