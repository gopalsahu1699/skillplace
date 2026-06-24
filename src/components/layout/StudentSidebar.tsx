'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, Award, ClipboardList, User, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/student/my-courses', label: 'My Courses', icon: BookOpen },
  { href: '/student/certificates', label: 'Certificates', icon: Award },
  { href: '/student/tests', label: 'Tests', icon: ClipboardList },
  { href: '/student/profile', label: 'Profile', icon: User },
]

export default function StudentSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-40 flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">S</span>
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900 block leading-tight">skillplace</span>
            <span className="text-xs text-blue-600 font-semibold">STUDENT</span>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => {
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
