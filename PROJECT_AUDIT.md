# Project Audit — Skillplace Academy

**Date:** 2026-06-28  
**Status:** 157 files | 47 pages | 19 API routes | 0 tests

---

## Critical Issues (Fix Immediately)

### 1. Database Drift — App Crashes on Payments
- **Webhook** inserts into `purchases` table → doesn't exist (should be `payments`)
- **Webhook** inserts into `enrollments` with `course_id` → schema uses `program_id`
- **Login** inserts into `user_activity` → table doesn't exist
- **Fix:** Update webhook to use correct table/column names

### 2. 12/19 API Routes Without Auth
Unprotected endpoints:
- `api/batches/route.ts`
- `api/batches/[batchId]/students/route.ts`
- `api/certificates/bulk/route.ts`
- `api/certificates/[id]/route.ts`
- `api/coupons/validate/route.ts`
- `api/payments/create-order/route.ts`
- `api/payments/verify/route.ts`
- `api/programs/create-order/route.ts`
- `api/students/route.ts`
- `api/video/upload/route.ts`
- `api/video/[videoId]/route.ts`

### 3. No CSRF Protection
### 4. No Input Validation (zod installed, never used in APIs)
### 5. Hardcoded Supabase URL + key fallback in client.ts
### 6. middleware.ts is empty — no session refresh
### 7. Admin API route is a 212-line catch-all proxy

---

## High Priority

### 8. Duplicate Components
- `SecureVideoPlayer` in both `components/course/` and `components/video/`
- `EnrollButton` + `EnrollmentButton` — same purpose

### 9. Dialog Bug
- 20 files import `@/components/ui/dialog` — Turbopack strips `key` prop
- **Fix:** Replace all with div-based modals

### 10. No Error Boundaries
### 11. Only 1/47 pages have loading.tsx
### 12. Admin Supabase client can be `null as any`

---

## SEO / AEO / Accessibility

### 13. 0/47 pages have metadata (no title, description, OG)
### 14. No sitemap, no robots.txt
### 15. No structured data
### 16. 0 a11y attributes (aria, role, alt)
### 17. Next config empty — no CSP, no security headers

---

## Missing

### 18. 0 test files
### 19. No .env.example
### 20. `pg` package unused
### 21. No lazy loading for heavy modules (hls.js, jspdf, html2canvas)

---

## What Works

- TypeScript: 0 errors
- No console.log
- No TODO/FIXME
- Login has rate limiting + session tracking
- Video player has watermark + right-click prevention
- Razorpay webhook verifies signature
- Admin API uses service role correctly
