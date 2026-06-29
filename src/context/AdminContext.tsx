'use client'

import { createContext, useContext } from 'react'
import type { EmployeePermission } from '@/types'

interface AdminContextType {
  isAdmin: boolean
  permissions: EmployeePermission | null
}

export const AdminContext = createContext<AdminContextType>({
  isAdmin: true,
  permissions: null,
})

export function useAdmin() {
  return useContext(AdminContext)
}
