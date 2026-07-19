'use client'

import { apiClient } from './api-client'
import { AuthenticationError } from './errors/AuthenticationError'

const API_BASE = '/api/admin'

function handleSessionExpired() {
  if (typeof window !== 'undefined') {
    window.location.href = '/login?redirectedFrom=' + encodeURIComponent(window.location.pathname) + '&reason=session_expired'
  }
}

async function adminFetch<T = any>(method: string, table: string, id?: string, body?: unknown): Promise<T | null> {
  const params = new URLSearchParams({ table })
  if (id) params.set('id', id)
  const url = `${API_BASE}?${params.toString()}`

  const { data, error, status } = await apiClient.fetch<T>(url, {
    method,
    body,
  })

  if (status === 401) {
    handleSessionExpired()
    return null
  }

  if (error) {
    if (error instanceof AuthenticationError) {
      handleSessionExpired()
      return null
    }
    throw error
  }

  return data ?? null
}

export async function getRecords<T = any>(table: string, filter?: string, value?: string, join?: string): Promise<T | null> {
  const params = new URLSearchParams({ table })
  if (filter && value) { params.set('filter', filter); params.set('value', value) }
  if (join) params.set('join', join)
  const url = `${API_BASE}?${params.toString()}`

  const { data, status, error } = await apiClient.get<{ data: T }>(url)
  if (status === 401 || (error && error instanceof AuthenticationError)) {
    handleSessionExpired()
    return null
  }
  if (error) throw error
  return (data as any)?.data ?? null
}

export async function getRecord<T = any>(table: string, id: string, join?: string): Promise<T | null> {
  const params = new URLSearchParams({ table, id })
  if (join) params.set('join', join)
  const { data, status, error } = await apiClient.get<{ data: T }>(`${API_BASE}?${params.toString()}`)
  if (status === 401 || (error && error instanceof AuthenticationError)) {
    handleSessionExpired()
    return null
  }
  if (error) throw error
  return (data as any)?.data ?? null
}

export async function createRecord<T = any>(table: string, data: unknown): Promise<T | null> {
  const { data: result, status, error } = await apiClient.post<{ data: T }>(`${API_BASE}?table=${table}`, data)
  if (status === 401 || (error && error instanceof AuthenticationError)) {
    handleSessionExpired()
    return null
  }
  if (error) throw error
  const records = (result as any)?.data ?? result
  return (Array.isArray(records) ? records[0] : records) as T
}

export async function updateRecord<T = any>(table: string, id: string, data: unknown): Promise<T | null> {
  const { data: result, status, error } = await apiClient.put<{ data: T }>(`${API_BASE}?table=${table}&id=${id}`, data)
  if (status === 401 || (error && error instanceof AuthenticationError)) {
    handleSessionExpired()
    return null
  }
  if (error) throw error
  const records = (result as any)?.data ?? result
  return (Array.isArray(records) ? records[0] : records) as T
}

export async function getCombinedProgramsData() {
  const { data, status } = await apiClient.get(`${API_BASE}/programs-data`)
  if (status === 401) {
    handleSessionExpired()
    return null
  }
  if (!data) return null
  return (data as any).data ?? data
}

export async function batchUpdateProgramCourses(programId: string, courseIds: string[]) {
  const { data, status, error } = await apiClient.put(`${API_BASE}/program-courses`, {
    program_id: programId,
    course_ids: courseIds,
  })
  if (status === 401 || (error && error instanceof AuthenticationError)) {
    handleSessionExpired()
    return null
  }
  if (error) throw error
  return data
}

export async function deleteRecord(table: string, id: string) {
  const { data, status, error } = await apiClient.delete(`${API_BASE}?table=${table}&id=${id}`)
  if (status === 401 || (error && error instanceof AuthenticationError)) {
    handleSessionExpired()
    return null
  }
  if (error) throw error
  return (data as any)?.success ?? true
}
