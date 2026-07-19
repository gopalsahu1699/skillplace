'use client'

import { useState, useEffect } from 'react'
import { networkDetection } from '@/lib/network-detection'

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    networkDetection.initialize()
    setIsOnline(networkDetection.isOnline)

    const unsubscribe = networkDetection.subscribe((online) => {
      setIsOnline(online)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return { isOnline }
}
