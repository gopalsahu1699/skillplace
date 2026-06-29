'use client'

import { useState, useEffect, useCallback } from 'react'
import { getRecords } from '@/lib/admin-api'

interface UseAdminDataOptions {
  table: string
  filter?: string
  value?: string
  join?: string
}

interface UseAdminResult<T> {
  data: T[] | null
  loading: boolean
  error: string | null
  sessionExpired: boolean
  refetch: () => void
}

export function useAdminData<T = any>(options: UseAdminDataOptions): UseAdminResult<T> {
  const [data, setData] = useState<T[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionExpired, setSessionExpired] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    setSessionExpired(false)
    try {
      const result = await getRecords(options.table, options.filter, options.value, options.join)
      if (result === null) {
        setSessionExpired(true)
        setLoading(false)
        return
      }
      setData(result || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load data.')
    } finally {
      setLoading(false)
    }
  }, [options.table, options.filter, options.value, options.join])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, sessionExpired, refetch: fetchData }
}
