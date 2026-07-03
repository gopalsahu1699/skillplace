'use client'

import { usePathname } from 'next/navigation'
import { useAdmin } from '@/context/AdminContext'
import Unauthorized from '@/components/Unauthorized'

const PERMISSION_MAP: Record<string, string> = {
  '/admin-place/courses': 'can_manage_courses',
  '/admin-place/programs': 'can_manage_programs',
  '/admin-place/content': 'can_manage_content',
  '/admin-place/enrollments': 'can_manage_enrollments',
  '/admin-place/placements': 'can_manage_placements',
  '/admin-place/schedule': 'can_manage_schedule',
  '/admin-place/students': 'can_manage_students',
  '/admin-place/employees': 'can_manage_employees',
  '/admin-place/leads': 'can_manage_leads',
  '/admin-place/testimonials': 'can_manage_testimonials',
  '/admin-place/coupons': 'can_manage_coupons',
  '/admin-place/notifications': 'can_manage_notifications',
  '/admin-place/payments': 'can_manage_payments',
  '/admin-place/certificates': 'can_manage_certificates',
}

interface PermissionGuardProps {
  children: React.ReactNode
}

export default function PermissionGuard({ children }: PermissionGuardProps) {
  const pathname = usePathname()
  const { isAdmin, permissions } = useAdmin()

  // Admins can access everything
  if (isAdmin) {
    return <>{children}</>
  }

  // Find the most specific matching path for permission check
  let matchedPermission: string | null = null
  const sortedPaths = Object.keys(PERMISSION_MAP).sort((a, b) => b.length - a.length)
  for (const path of sortedPaths) {
    if (pathname === path || pathname.startsWith(path + '/')) {
      matchedPermission = PERMISSION_MAP[path]
      break
    }
  }

  // No specific permission required (e.g. dashboard)
  if (!matchedPermission) {
    return <>{children}</>
  }

  // Check if user has the required permission
  const hasPermission = permissions?.[matchedPermission as keyof typeof permissions] === true

  if (!hasPermission) {
    return <Unauthorized type="permission" />
  }

  return <>{children}</>
}
