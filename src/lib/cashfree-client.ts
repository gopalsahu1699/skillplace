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

export async function redirectToCashfreeCheckout(paymentSessionId: string): Promise<void> {
  if (typeof window === 'undefined') return
  try {
    const { load } = await import('@cashfreepayments/cashfree-js')
    const mode = getClientEnv()
    const cashfree = await load({ mode })
    if (!cashfree) {
      throw new Error('Failed to load Cashfree SDK')
    }
    const result = await cashfree.checkout({
      paymentSessionId,
      redirectTarget: '_self',
    })
    if (result?.error) {
      throw new Error(result.error.message || 'Cashfree checkout failed')
    }
  } catch (err) {
    console.error('Cashfree SDK checkout failed, falling back to manual redirect:', err)
    const checkoutUrl = getRedirectCheckoutUrl(paymentSessionId)
    window.location.href = checkoutUrl
  }
}
