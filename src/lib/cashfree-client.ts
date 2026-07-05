function getClientEnv(): 'sandbox' | 'production' {
  if (typeof window === 'undefined') return 'sandbox'
  const env = process.env.NEXT_PUBLIC_CASHFREE_ENV || 'SANDBOX'
  return env.toUpperCase() === 'PRODUCTION' ? 'production' : 'sandbox'
}

function getCheckoutBaseUrl(): string {
  return getClientEnv() === 'production'
    ? 'https://payments.cashfree.com'
    : 'https://payments-test.cashfree.com'
}

function getCheckoutUrl(paymentSessionId: string): string {
  return `${getCheckoutBaseUrl()}/checkout/pay/${paymentSessionId}`
}

export function getRedirectCheckoutUrl(paymentSessionId: string): string {
  return getCheckoutUrl(paymentSessionId)
}

export function redirectToCashfreeCheckout(paymentSessionId: string): void {
  const checkoutUrl = getRedirectCheckoutUrl(paymentSessionId)
  window.location.href = checkoutUrl
}
