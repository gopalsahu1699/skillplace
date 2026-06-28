# Payment Rules — Skillplace Academy

## Payment Provider: Razorpay

### Environment
- Test mode for development
- Live mode for production
- Webhook endpoint: `/api/payments/webhook`

### Flow: Individual Course Purchase
```
1. Client: POST /api/payments/create-order { courseId, couponCode? }
2. Server: Validate course exists, apply coupon, calculate final amount
3. Server: Create Razorpay order (amount in paise)
4. Client: Open Razorpay checkout (razorpay.razorpay.razorpay.razorpay.open())
5. Razorpay: Sends webhook to /api/payments/webhook
6. Server: Verify signature, update payment status
7. Server: Create enrollment record
8. Client: Redirect to learn page
```

### Flow: Program Enrollment
```
1. Client: POST /api/programs/create-order { programId, couponCode? }
2. Server: Validate program, apply coupon, create Razorpay order
3. Client: Complete payment
4. Webhook: Verify, update status
5. Server: Create enrollment (program_id, not course_id)
6. Client: Redirect to program learn page
```

## Pricing Rules
1. Amount stored in **paise** (₹100 = 10000 paise)
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
- `payment.captured`: Successful payment → create enrollment
- `payment.failed`: Failed payment → log, notify user
- `refund.created`: Refund initiated → update status, revoke access

## Security Rules
1. Always verify webhook signature server-side
2. Never expose Razorpay Key Secret in client code
3. Log all webhook attempts
4. Idempotency: check if payment already processed
5. Amount verification: compare webhook amount with expected

## Database Tables

### payments
- `user_id`: UUID (buyer)
- `course_id`: UUID (nullable for program purchases)
- `amount`: INTEGER (in paise)
- `razorpay_order_id`: TEXT
- `razorpay_payment_id`: TEXT
- `razorpay_signature`: TEXT
- `status`: TEXT (pending/completed/failed/refunded)
- `created_at`, `updated_at`: TIMESTAMPTZ

### enrollments
- `user_id`: UUID
- `program_id`: UUID (for program enrollment)
- `branch_id`: UUID
- `status`: TEXT (active/completed/pending/expired)
- `enrolled_at`, `completed_at`: TIMESTAMPTZ
- `program_type`: TEXT (online/offline/hybrid)

### coupons
- `code`: TEXT (unique)
- `discount_type`: TEXT (amount/percent)
- `discount_rate`: INTEGER
- `min_order_amount`: INTEGER
- `max_uses`, `used_count`: INTEGER
- `valid_from`, `valid_until`: TIMESTAMPTZ
- `is_active`: BOOLEAN
