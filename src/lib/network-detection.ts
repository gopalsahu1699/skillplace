import { notify } from './notification'

type NetworkListener = (isOnline: boolean) => void

class NetworkDetectionService {
  private listeners: Set<NetworkListener> = new Set()
  private _isOnline: boolean = true
  private notifiedOffline = false
  private notifiedOnline = false
  private initialized = false

  get isOnline(): boolean {
    return this._isOnline
  }

  initialize(): void {
    if (this.initialized || typeof window === 'undefined') return
    this.initialized = true

    this._isOnline = navigator.onLine

    window.addEventListener('online', () => this.handleOnline())
    window.addEventListener('offline', () => this.handleOffline())
  }

  destroy(): void {
    if (typeof window === 'undefined') return
    window.removeEventListener('online', () => this.handleOnline())
    window.removeEventListener('offline', () => this.handleOffline())
    this.listeners.clear()
  }

  subscribe(listener: NetworkListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private handleOnline(): void {
    this._isOnline = true
    this.notifiedOffline = false

    if (!this.notifiedOnline) {
      this.notifiedOnline = true
      notify.connectionRestored()
      setTimeout(() => { this.notifiedOnline = false }, 10000)
    }

    this.listeners.forEach((l) => l(true))
  }

  private handleOffline(): void {
    this._isOnline = false
    this.notifiedOnline = false

    if (!this.notifiedOffline) {
      this.notifiedOffline = true
      notify.offline()
    }

    this.listeners.forEach((l) => l(false))
  }

  checkNow(): boolean {
    if (typeof navigator === 'undefined') return true
    this._isOnline = navigator.onLine
    if (!this._isOnline) {
      this.handleOffline()
    }
    return this._isOnline
  }
}

export const networkDetection = new NetworkDetectionService()
