import { load } from '@cashfreepayments/cashfree-js'

let cashfreeInstance: Awaited<ReturnType<typeof load>> | null = null

export async function getCashfreeClient(mode: 'sandbox' | 'production' = 'sandbox') {
  if (typeof window === 'undefined') return null
  if (!cashfreeInstance) {
    cashfreeInstance = await load({ mode })
  }
  return cashfreeInstance
}

export interface CashfreeCheckoutOptions {
  paymentSessionId: string
  returnUrl: string
}

export async function openCashfreeCheckout(
  mode: 'sandbox' | 'production',
  options: CashfreeCheckoutOptions
) {
  const cashfree = await getCashfreeClient(mode)
  if (!cashfree) {
    throw new Error('Cashfree SDK failed to initialize')
  }

  const checkoutOptions = {
    paymentSessionId: options.paymentSessionId,
    returnUrl: options.returnUrl,
  }

  const result = await cashfree.checkout(checkoutOptions)

  if (result.error) {
    throw new Error(result.error.message || 'Payment cancelled')
  }

  return result
}
