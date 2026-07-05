# Fix Payment System Issues

## Problem Analysis
The payment system is not working correctly. After analyzing the code, I've identified the following issues:

1. **Missing `fetchCashfreePayments` function**: The `/src/app/api/payments/verify/route.ts` file imports and uses `fetchCashfreePayments` from '@/lib/cashfree', but this function is missing from the `/src/lib/cashfree.ts` file.

2. **Potential webhook verification issues**: Need to verify the webhook signature verification is working correctly.

## Tasks to Fix

### 1. Add missing `fetchCashfreePayments` function to cashfree.ts
- Add the `fetchCashfreePayments` function to `/src/lib/cashfree.ts`
- The function should use the Cashfree SDK to fetch payment details by order ID
- Handle errors appropriately

### 2. Verify webhook signature verification
- Check that the webhook verification in `/src/app/api/payment/webhook/route.ts` is working correctly
- Ensure the `verifyWebhookSignature` function is properly implemented

### 3. Ensure environment variables are properly configured
- Verify that Cashfree environment variables are set correctly in `.env.local`
- Ensure the environment is set to sandbox/testing mode for development

## Implementation Details

### For task 1: Add fetchCashfreePayments function
Add this function to `/src/lib/cashfree.ts`:

```typescript
export async function fetchCashfreePayments(orderId: string): Promise<CashfreePayment[]> {
  try {
    const client = getCashfreeClient()
    const response = await client.PGFetchPayments({ orderId })
    return response.data
  } catch (err) {
    console.error('Error fetching payments from Cashfree:', err)
    throw err
  }
}
```

Make sure to define the `CashfreePayment` type if it doesn't exist, or import it if it's defined elsewhere.

### For task 2: Verify webhook verification
Check the webhook route in `/src/app/api/payment/webhook/route.ts`:
- Ensure the signature verification is working correctly
- Verify that the webhook is properly handling different payment events

### For task 3: Environment verification
- Check that `.env.local` contains the required Cashfree variables:
  - `CASHFREE_APP_ID`
  - `CASHFREE_SECRET_KEY`
  - `CASHFREE_WEBHOOK_SECRET`
  - `CASHFREE_ENV` (should be "SANDBOX" for development)

## Best Practices
- Write production-ready code that compiles and runs without errors
- Run `npx tsc --noEmit` after changes and fix ALL type/runtime errors
- No shortcuts, no TODOs, no partial fixes, no console.log
- Do NOT git push

## Verification Steps
After implementing the fixes:
1. Run `npx tsc --noEmit` to ensure no TypeScript errors
2. Verify the payment flow works correctly:
   - Create order endpoint returns proper Cashfree session details
   - Verify endpoint correctly checks payment status
   - Webhook endpoint properly verifies signatures and updates payment status
3. Ensure enrollments are created when payments are successful