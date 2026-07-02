import Razorpay from 'razorpay'
import crypto from 'crypto'

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || ''
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || ''
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || ''

export const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
})

export async function createOrder(
  amount: number,
  currency: string = 'INR',
  receipt?: string,
  notes?: Record<string, string>
) {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET || RAZORPAY_KEY_SECRET.length < 20) {
    throw new Error('Razorpay credentials not configured properly. Please check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local')
  }

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency,
      receipt: receipt || `order_${Date.now()}`,
      ...(notes && { notes }),
    })
    return order
  } catch (error) {
    if ((error as any)?.error?.description) {
      throw new Error(`Razorpay error: ${(error as any).error.description}`)
    }
    throw error
  }
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = orderId + '|' + paymentId
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex')
  return expectedSignature === signature
}

export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex')
  return expectedSignature === signature
}

export async function fetchPayment(paymentId: string) {
  const payment = await razorpay.payments.fetch(paymentId)
  return payment
}

export { RAZORPAY_KEY_ID }
