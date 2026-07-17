# Payment Rules — Skillplace Academy

## Payment Provider: Cashfree

### Environment
- Test mode for development (SANDBOX)
- Live mode for production (PRODUCTION)
- Toggle via `NEXT_PUBLIC_CASHFREE_ENV` env var
- Webhook endpoint: `/api/payment/webhook`

### Flow: Individual Course Purchase
```
1. Client: POST /api/payments/create-order { courseId, couponCode? }
2. Server: Validate course exists, apply coupon, calculate final amount
3. Server: Create Cashfree order via cashfree-pg SDK
4. Server: Save payment record (status: pending)
5. Client: Open Cashfree checkout (paymentSessionId)
6. Cashfree: Sends webhook to /api/payment/webhook
7. Server: Verify signature (x-webhook-signature + x-webhook-timestamp), update payment status, create enrollment
8. Client: Redirect to /api/payments/verify?order_id=... (GET) as fallback
```

### Flow: Program Enrollment
```
1. Client: POST /api/programs/create-order { programId, studentName, email, phone, couponCode?, selectedMode }
2. Server: Validate fields, find/create profile by email, apply coupon
3. Server: Create Cashfree order, save payment (status: pending)
4. Cashfree: Sends webhook to /api/payment/webhook
5. Webhook: Handle profile creation if needed, create enrollment
6. Client: Redirect to /api/programs/verify-payment?order_id=... (GET) as fallback
```

## Pricing Rules
1. Amount stored in **rupees** (integer, not paise)
2. Server-side price calculation ONLY (never trust client)
3. Coupons can be amount-based or percentage-based
4. Minimum order amount configurable per coupon
5. Coupon usage limits enforced
6. Expired coupons rejected

### Coupon Validation Logic
```
1. Check coupon exists & is_active
2. Check valid_from <= now <= valid_until
3. Check used_count < max_uses
4. Check order total >= min_order_amount
5. Apply discount (amount or percent)
6. Return final amount
```

## Payment States
```
pending → completed
        → failed
        → refunded
```

## Webhook Events
- `PAYMENT_SUCCESS_WEBHOOK`: Successful payment → create enrollment
- `PAYMENT_FAILED_WEBHOOK`: Failed payment → log, notify user

## Security Rules
1. Always verify webhook signature server-side (x-webhook-signature + x-webhook-timestamp)
2. Never expose Cashfree Secret Key in client code
3. Log all webhook attempts
4. Idempotency: check if payment already processed (atomic .eq('status', 'pending'))
5. Amount verification: compare webhook amount with expected
6. Rate-limit all payment API routes

## Database Tables

### payments
- `user_id`: UUID (buyer, nullable for guest program purchases)
- `course_id`: UUID (nullable for program purchases)
- `program_id`: UUID (nullable for course purchases)
- `amount`: INTEGER (in rupees)
- `order_id`: TEXT (custom order ID)
- `cf_order_id`: TEXT (Cashfree order ID)
- `cf_payment_session_id`: TEXT (Cashfree payment session)
- `cf_payment_id`: TEXT (Cashfree payment ID)
- `payment_method`: TEXT (upi/card/netbanking/etc)
- `status`: TEXT (pending/completed/failed/refunded)
- `created_at`, `updated_at`: TIMESTAMPTZ

### course_enrollments
- `user_id`: UUID
- `course_id`: UUID
- `status`: TEXT (active/completed/pending/expired)
- `created_at`: TIMESTAMPTZ

### enrollments (program enrollments)
- `user_id`: UUID
- `program_id`: UUID
- `branch_id`: UUID (nullable)
- `status`: TEXT (active/completed/pending/cancelled/expired)
- `selected_mode`: TEXT (online/offline/hybrid)
- `enrolled_at`, `completed_at`: TIMESTAMPTZ

### coupons
- `code`: TEXT (unique, uppercase)
- `discount_type`: TEXT (amount/percent)
- `discount_rate`: INTEGER
- `max_discount_amount`: INTEGER (nullable)
- `min_order_amount`: INTEGER (nullable)
- `max_uses`, `used_count`: INTEGER
- `valid_from`, `valid_until`: TIMESTAMPTZ
- `is_active`: BOOLEAN
