function getClientEnv(): 'sandbox' | 'production' {
  const env = (typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_CASHFREE_ENV
    : (process.env.NEXT_PUBLIC_CASHFREE_ENV || process.env.CASHFREE_ENV)) || 'SANDBOX'
  return env.toUpperCase() === 'PRODUCTION' ? 'production' : 'sandbox'
}

function getCheckoutBaseUrl(): string {
  return getClientEnv() === 'production'
    ? 'https://payments.cashfree.com'
    : 'https://payments-test.cashfree.com'
}

function getCheckoutUrl(paymentSessionId: string): string {
  return `${getCheckoutBaseUrl()}/checkout/pay/session/${paymentSessionId}`
}

export function getRedirectCheckoutUrl(paymentSessionId: string): string {
  return getCheckoutUrl(paymentSessionId)
}

export function redirectToCashfreeCheckout(paymentSessionId: string): void {
  const checkoutUrl = getRedirectCheckoutUrl(paymentSessionId)
  window.location.href = checkoutUrl
}
