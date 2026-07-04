export function getRazorpay() {
  if (typeof window === 'undefined') return null
  return (window as unknown as { Razorpay?: new (options: Record<string, unknown>) => { open: () => void } }).Razorpay ?? null
}

export function isRazorpayLoaded(): boolean {
  return getRazorpay() !== null
}

export function waitForRazorpay(timeout = 15000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isRazorpayLoaded()) {
      resolve()
      return
    }
    const start = Date.now()
    const check = () => {
      if (isRazorpayLoaded()) {
        resolve()
        return
      }
      if (Date.now() - start > timeout) {
        reject(new Error('Razorpay checkout script failed to load. Please refresh and try again.'))
        return
      }
      setTimeout(check, 100)
    }
    check()
  })
}
