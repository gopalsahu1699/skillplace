'use client'

import { usePathname } from 'next/navigation'

interface PermissionMap {
  [path: string]: string
}

const PERMISSION_MAP: PermissionMap = {
  '/admin-place/courses': 'can_manage_courses',
  '/admin-place/programs': 'can_manage_programs',
  '/admin-place/content': 'can_manage_content',
  '/admin-place/enrollments': 'can_manage_enrollments',
  '/admin-place/placements': 'can_manage_enrollments',
  '/admin-place/schedule': 'can_manage_programs',
  '/admin-place/students': 'can_manage_students',
  '/admin-place/employees': 'can_manage_employees',
  '/admin-place/leads': 'can_manage_leads',
  '/admin-place/testimonials': 'can_manage_courses',
  '/admin-place/coupons': 'can_manage_courses',
  '/admin-place/notifications': 'can_manage_content',
  '/admin-place/payments': 'can_manage_payments',
}

import type { EmployeePermission } from '@/types'

export function useAdminPermissions(permissions: EmployeePermission | null | undefined) {
  const pathname = usePathname()
  const isAdmin = !permissions

  // Admins (no permissions object) can access everything
  if (isAdmin) {
    return { allowed: true, isAdmin: true, isLoading: false }
  }

  // Find the most specific matching path
  let matchedPermission: string | null = null
  for (const [path, perm] of Object.entries(PERMISSION_MAP)) {
    if (pathname === path || pathname.startsWith(path + '/')) {
      matchedPermission = perm
      break
    }
  }

  // Dashboard or no specific permission required — allow
  if (!matchedPermission) {
    return { allowed: true, isAdmin: false, isLoading: false }
  }

  const hasPermission = permissions?.[matchedPermission as keyof EmployeePermission] === true

  return { allowed: hasPermission, isAdmin: false, isLoading: false }
}
