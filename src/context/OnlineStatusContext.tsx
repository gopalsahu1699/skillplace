'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'

interface OnlineStatusContextType {
  isOnline: boolean
  wasEverOffline: boolean
  checkConnection: () => boolean
}

const OnlineStatusContext = createContext<OnlineStatusContextType>({
  isOnline: true,
  wasEverOffline: false,
  checkConnection: () => true,
})

export function OnlineStatusProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true)
  const [wasEverOffline, setWasEverOffline] = useState(false)

  const handleOnline = useCallback(() => {
    setIsOnline(true)
  }, [])

  const handleOffline = useCallback(() => {
    setIsOnline(false)
    setWasEverOffline(true)
  }, [])

  const checkConnection = useCallback(() => {
    const online = navigator.onLine
    if (!online) {
      setIsOnline(false)
      setWasEverOffline(true)
    }
    return online
  }, [])

  useEffect(() => {
    setIsOnline(navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [handleOnline, handleOffline])

  return (
    <OnlineStatusContext.Provider value={{ isOnline, wasEverOffline, checkConnection }}>
      {children}
    </OnlineStatusContext.Provider>
  )
}

export function useOnlineStatus() {
  const ctx = useContext(OnlineStatusContext)
  if (!ctx) throw new Error('useOnlineStatus must be used within OnlineStatusProvider')
  return ctx
}
