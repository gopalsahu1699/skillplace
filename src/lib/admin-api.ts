'use client'

const API_BASE = '/api/admin'

// Redirect to login when session expires
function handleSessionExpired() {
  if (typeof window !== 'undefined') {
    // Clear any cached auth state
    window.location.href = '/login?redirectedFrom=' + encodeURIComponent(window.location.pathname) + '&reason=session_expired'
  }
}

async function adminFetch(method: string, table: string, id?: string, body?: any) {
  const params = new URLSearchParams({ table })
  if (id) params.set('id', id)

  const url = `${API_BASE}?${params.toString()}`

  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  const res = await fetch(url, options)
  const json = await res.json()

  if (res.status === 401) {
    handleSessionExpired()
    return null
  }

  if (!res.ok) {
    throw new Error(json.error || 'Request failed')
  }

  return json.data
}

// Generic CRUD functions
export async function getRecords(table: string, filter?: string, value?: string, join?: string) {
  const params = new URLSearchParams({ table })
  if (filter && value) {
    params.set('filter', filter)
    params.set('value', value)
  }
  if (join) {
    params.set('join', join)
  }
  const url = `${API_BASE}?${params.toString()}`
  const res = await fetch(url)
  if (res.status === 401) {
    handleSessionExpired()
    return null
  }
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Request failed')
  return json.data
}

export async function getRecord(table: string, id: string, join?: string) {
  const params = new URLSearchParams({ table })
  if (id) params.set('id', id)
  if (join) params.set('join', join)
  const res = await fetch(`${API_BASE}?${params.toString()}`)
  if (res.status === 401) {
    handleSessionExpired()
    return null
  }
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Request failed')
  return json.data
}

export async function createRecord(table: string, data: any) {
  const res = await fetch(`${API_BASE}?table=${table}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (res.status === 401) {
    handleSessionExpired()
    return null
  }
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Request failed')
  return json.data
}

export async function updateRecord(table: string, id: string, data: any) {
  const res = await fetch(`${API_BASE}?table=${table}&id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (res.status === 401) {
    handleSessionExpired()
    return null
  }
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Request failed')
  return json.data
}

export async function deleteRecord(table: string, id: string) {
  const res = await fetch(`${API_BASE}?table=${table}&id=${id}`, {
    method: 'DELETE',
  })
  if (res.status === 401) {
    handleSessionExpired()
    return null
  }
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Request failed')
  return json.success
}
