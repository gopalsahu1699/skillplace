'use client'

import { type ReactNode } from 'react'
import { OnlineStatusProvider } from '@/context/OnlineStatusContext'
import NoInternetBanner from '@/components/NoInternetBanner'

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <OnlineStatusProvider>
      <NoInternetBanner />
      {children}
    </OnlineStatusProvider>
  )
}
