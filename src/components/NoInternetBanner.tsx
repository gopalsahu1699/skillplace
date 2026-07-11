'use client'

import { useOnlineStatus } from '@/context/OnlineStatusContext'
import { WifiOff, Wifi, RefreshCw } from 'lucide-react'

export default function NoInternetBanner() {
  const { isOnline, wasEverOffline } = useOnlineStatus()

  if (isOnline && !wasEverOffline) return null

  if (isOnline) {
    return (
      <div className="bg-emerald-600 text-white text-center py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium">
        <Wifi className="w-4 h-4" />
        <span>Connection restored. You&apos;re back online.</span>
      </div>
    )
  }

  return (
    <div className="bg-amber-500 text-white text-center py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>No internet connection. Some features may be unavailable.</span>
      <button
        onClick={() => window.location.reload()}
        className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/20 hover:bg-white/30 transition-colors text-xs font-bold"
      >
        <RefreshCw className="w-3 h-3" />
        Retry
      </button>
    </div>
  )
}
