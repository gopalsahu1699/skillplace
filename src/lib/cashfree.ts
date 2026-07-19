import { Cashfree as CashfreeSDK, CFEnvironment } from 'cashfree-pg'
import * as crypto from 'crypto'
import { logger } from './logger'
import { PaymentError } from './errors/PaymentError'
import { ErrorCodes } from './errors/ErrorCodes'

const ENV = (process.env.NEXT_PUBLIC_CASHFREE_ENV || process.env.CASHFREE_ENV || 'SANDBOX').toUpperCase() === 'PRODUCTION' ? 'PRODUCTION' : 'SANDBOX'

const CASHFREE_APP_ID = ENV === 'PRODUCTION'
  ? (process.env.CASHFREE_PRODUCTION_APP_ID || process.env.CASHFREE_APP_ID || '')
  : (process.env.CASHFREE_SANDBOX_APP_ID || process.env.CASHFREE_APP_ID || '')

const CASHFREE_SECRET_KEY = ENV === 'PRODUCTION'
  ? (process.env.CASHFREE_PRODUCTION_SECRET_KEY || process.env.CASHFREE_SECRET_KEY || '')
  : (process.env.CASHFREE_SANDBOX_SECRET_KEY || process.env.CASHFREE_SECRET_KEY || '')

const CASHFREE_WEBHOOK_SECRET = ENV === 'PRODUCTION'
  ? (process.env.CASHFREE_PRODUCTION_WEBHOOK_SECRET || process.env.CASHFREE_WEBHOOK_SECRET || '')
  : (process.env.CASHFREE_SANDBOX_WEBHOOK_SECRET || process.env.CASHFREE_WEBHOOK_SECRET || '')

let cashfreeClient: CashfreeSDK | null = null

function getCashfreeClient(): CashfreeSDK {
  if (!cashfreeClient) {
    const env = ENV === 'PRODUCTION' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX
    cashfreeClient = new CashfreeSDK(env, CASHFREE_APP_ID, CASHFREE_SECRET_KEY)
  }
  return cashfreeClient
}

export interface CashfreeOrderRequest {
  orderId: string
  orderAmount: number
  orderCurrency?: string
  customerId: string
  customerName?: string
  customerEmail: string
  customerPhone: string
  returnUrl: string
  notifyUrl?: string
}

export interface CashfreeOrderResponse {
  cfOrderId: string
  orderId: string
  paymentSessionId: string
  orderStatus: string
  orderAmount: number
  orderCurrency: string
}

export async function createCashfreeOrder(req: CashfreeOrderRequest): Promise<CashfreeOrderResponse> {
  if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
    logger.error('Cashfree credentials not configured')
    throw new PaymentError('Payment service is not configured. Please try again later.', {
      code: ErrorCodes.PAYMENT_GATEWAY_DOWN,
    })
  }

  const client = getCashfreeClient()

  const request = {
    order_id: req.orderId,
    order_amount: req.orderAmount,
    order_currency: req.orderCurrency || 'INR',
    customer_details: {
      customer_id: req.customerId,
      customer_name: req.customerName || '',
      customer_email: req.customerEmail,
      customer_phone: req.customerPhone,
    },
    order_meta: {
      return_url: req.returnUrl,
    } as Record<string, string>,
  }

  if (req.notifyUrl) {
    request.order_meta.notify_url = req.notifyUrl
  }

  let response
  try {
    response = await client.PGCreateOrder(request)
  } catch (err) {
    logger.error('Cashfree order creation failed', err)
    throw new PaymentError('Payment could not be initiated. Please try again.', {
      cause: err,
    })
  }

  return {
    cfOrderId: response.data.cf_order_id || '',
    orderId: response.data.order_id || '',
    paymentSessionId: response.data.payment_session_id || '',
    orderStatus: response.data.order_status || '',
    orderAmount: response.data.order_amount || 0,
    orderCurrency: response.data.order_currency || '',
  }
}

export interface CashfreePayment {
  paymentId: string
  cfPaymentId: string
  orderId: string
  paymentAmount: number
  paymentStatus: string
  paymentMethod: string | null
  paymentTime: string | null
}

export async function fetchCashfreePayments(orderId: string): Promise<CashfreePayment[]> {
  const client = getCashfreeClient()
  let response
  try {
    response = await client.PGOrderFetchPayments(orderId)
  } catch (err) {
    logger.error('Cashfree payment fetch failed', err)
    throw new PaymentError('Could not verify payment status. Please contact support.', {
      cause: err,
    })
  }

  return (response.data || []).map((p) => ({
    paymentId: p.cf_payment_id || '',
    cfPaymentId: p.cf_payment_id || '',
    orderId: p.order_id || '',
    paymentAmount: p.payment_amount || 0,
    paymentStatus: p.payment_status || '',
    paymentMethod: p.payment_method ? String(p.payment_method) : null,
    paymentTime: p.payment_time || null,
  }))
}

export async function fetchCashfreeOrder(orderId: string) {
  const client = getCashfreeClient()
  let response
  try {
    response = await client.PGFetchOrder(orderId)
  } catch (err) {
    logger.error('Cashfree order fetch failed', err)
    throw new PaymentError('Could not retrieve payment details. Please contact support.', {
      cause: err,
    })
  }
  return response.data
}

export function verifyWebhookSignature(rawBody: string, signature: string, timestamp?: string): boolean {
  if (!signature || !rawBody) return false

  if (timestamp) {
    const client = getCashfreeClient()
    try {
      client.PGVerifyWebhookSignature(signature, rawBody, timestamp)
      return true
    } catch {
      return false
    }
  }

  if (!CASHFREE_WEBHOOK_SECRET) {
    logger.warn('CASHFREE_WEBHOOK_SECRET not configured, webhook verification may fail')
    return false
  }
  const expectedSignature = crypto
    .createHmac('sha256', CASHFREE_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('base64')
  return expectedSignature === signature
}

export function getPublicCashfreeEnv(): 'sandbox' | 'production' {
  return ENV === 'PRODUCTION' ? 'production' : 'sandbox'
}

export function getCashfreeEnv(): 'sandbox' | 'production' {
  return ENV === 'PRODUCTION' ? 'production' : 'sandbox'
}

export { CASHFREE_APP_ID }
