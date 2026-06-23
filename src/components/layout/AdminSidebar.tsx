'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, BookOpen, CreditCard, MessageSquare, Award, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/admin-place', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin-place/students', label: 'Students', icon: Users },
  { href: '/admin-place/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin-place/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin-place/leads', label: 'Leads', icon: MessageSquare },
  { href: '/admin-place/certificates', label: 'Certificates', icon: Award },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-border z-40 flex flex-col">
      <div className="p-6 border-b border-border">
        <Link href="/" className="text-lg font-bold text-foreground">Skillplace Academy</Link>
        <p className="text-xs text-muted-foreground mt-1">Admin Dashboard</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-border">
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground w-full transition-colors">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
