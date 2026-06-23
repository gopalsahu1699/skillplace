import Razorpay from 'razorpay'

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function createOrder(amount: number, currency: string = 'INR') {
  const order = await razorpay.orders.create({
    amount: amount * 100,
    currency,
    receipt: `order_${Date.now()}`,
  })
  return order
}

export function verifyPayment(orderId: string, paymentId: string, signature: string) {
  const crypto = require('crypto')
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')
  return expectedSignature === signature
}
