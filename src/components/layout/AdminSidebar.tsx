'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, BookOpen, CreditCard, MessageSquare, LogOut, GraduationCap, Briefcase, Star, FileText, UserCog, Tag, Bell, Calendar, ShieldAlert, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EmployeePermission } from '@/types'

interface NavLink {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  permissionKey?: keyof EmployeePermission
}

const links: NavLink[] = [
  { href: '/admin-place', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin-place/courses', label: 'Courses', icon: BookOpen, permissionKey: 'can_manage_courses' },
  { href: '/admin-place/programs', label: 'Programs', icon: Briefcase, permissionKey: 'can_manage_programs' },
  { href: '/admin-place/content', label: 'Content', icon: FileText, permissionKey: 'can_manage_content' },
  { href: '/admin-place/enrollments', label: 'Enrollments', icon: GraduationCap, permissionKey: 'can_manage_enrollments' },
  { href: '/admin-place/placements', label: 'Placements', icon: GraduationCap, permissionKey: 'can_manage_placements' },
  { href: '/admin-place/schedule', label: 'Schedule', icon: Calendar, permissionKey: 'can_manage_schedule' },
  { href: '/admin-place/students', label: 'Students', icon: Users, permissionKey: 'can_manage_students' },
  { href: '/admin-place/employees', label: 'Employees', icon: UserCog, permissionKey: 'can_manage_employees' },
  { href: '/admin-place/leads', label: 'Leads', icon: MessageSquare, permissionKey: 'can_manage_leads' },
  { href: '/admin-place/testimonials', label: 'Testimonials', icon: Star, permissionKey: 'can_manage_testimonials' },
  { href: '/admin-place/coupons', label: 'Coupons', icon: Tag, permissionKey: 'can_manage_coupons' },
  { href: '/admin-place/notifications', label: 'Notifications', icon: Bell, permissionKey: 'can_manage_notifications' },
  { href: '/admin-place/security/forensic', label: 'Video Security', icon: ShieldAlert, permissionKey: 'can_manage_video_security' },
  { href: '/admin-place/payments', label: 'Payments', icon: CreditCard, permissionKey: 'can_manage_payments' },
  { href: '/admin-place/certificates', label: 'Certificates', icon: FileText, permissionKey: 'can_manage_certificates' },
  { href: '/admin-place/faqs', label: 'FAQs', icon: HelpCircle, permissionKey: 'can_manage_faqs' },
]

interface AdminSidebarProps {
  isAdmin?: boolean
  permissions?: EmployeePermission | null
  isOpen?: boolean
  _onToggle?: () => void
}

export default function AdminSidebar({ isAdmin, permissions, isOpen }: AdminSidebarProps) {
  const pathname = usePathname()

  // Admin sees all links; employees only see permitted ones
  const visibleLinks = isAdmin || !permissions
    ? links
    : links.filter(link => {
        // Dashboard always visible if user has unknown permission
        if (link.href === '/admin-place') return true
        if (!link.permissionKey) return true
        return permissions[link.permissionKey] === true
      })

  return (
    <aside className={cn(
      "fixed top-14 left-0 md:sticky md:top-14 h-[calc(100vh-3.5rem)] w-64 bg-white border-r border-slate-200 z-50 flex flex-col shrink-0 transition-transform duration-300 overflow-y-auto",
      "md:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
      <nav className="flex-1 p-3 space-y-1">
        {visibleLinks.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-slate-200">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 w-full transition-all duration-200">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}

