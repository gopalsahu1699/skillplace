declare module '@cashfreepayments/cashfree-js' {
  interface CashfreeCheckoutArgs {
    paymentSessionId: string
    returnUrl?: string
    redirectTarget?: string
  }

  interface CashfreeCheckoutResult {
    error?: {
      message: string
    }
    redirect?: boolean
    paymentDetails?: Record<string, unknown>
  }

  interface CashfreeInstance {
    checkout(options: CashfreeCheckoutArgs): Promise<CashfreeCheckoutResult>
  }

  interface CashfreeLoadOptions {
    mode: 'sandbox' | 'production'
  }

  export function load(options: CashfreeLoadOptions): Promise<CashfreeInstance>
}
