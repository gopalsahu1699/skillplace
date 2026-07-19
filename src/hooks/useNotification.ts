'use client'

import { useCallback } from 'react'
import { notify } from '@/lib/notification'
import type { BaseAppError } from '@/lib/errors/BaseAppError'

interface NotificationHook {
  success: (message: string, options?: { description?: string }) => void
  error: (error: string | BaseAppError, options?: { description?: string }) => void
  warning: (message: string, options?: { description?: string }) => void
  info: (message: string, options?: { description?: string }) => void
  loading: (message: string) => string | number
  dismiss: (toastId?: string | number) => void
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: unknown) => string)
    },
  ) => void
}

export function useNotification(): NotificationHook {
  const success = useCallback((message: string, options?: { description?: string }) => {
    notify.success(message, options)
  }, [])

  const error = useCallback((err: string | BaseAppError, options?: { description?: string }) => {
    notify.error(err, options)
  }, [])

  const warning = useCallback((message: string, options?: { description?: string }) => {
    notify.warning(message, options)
  }, [])

  const info = useCallback((message: string, options?: { description?: string }) => {
    notify.info(message, options)
  }, [])

  const loading = useCallback((message: string) => {
    return notify.loading(message) as unknown as string | number
  }, [])

  const dismiss = useCallback((toastId?: string | number) => {
    notify.dismiss(toastId)
  }, [])

  const promise = useCallback(<T>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: unknown) => string)
    },
  ) => {
    notify.promise(promise, messages)
  }, [])

  return { success, error, warning, info, loading, dismiss, promise }
}
