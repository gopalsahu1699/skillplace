'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { LayoutDashboard, BookOpen, Award, ClipboardList, User, LogOut, Bell, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'

const links = [
  { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/student/my-courses', label: 'My Courses', icon: BookOpen },
  { href: '/student/my-programs', label: 'My Purchased Programs', icon: ShoppingBag },
  { href: '/student/certificates', label: 'Certificates', icon: Award },
  { href: '/student/tests', label: 'Tests', icon: ClipboardList },
  { href: '/student/notifications', label: 'Notifications', icon: Bell },
  { href: '/student/profile', label: 'Profile', icon: User },
]

export default function StudentSidebar({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    async function fetchUnread() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [individualRes, publicRes] = await Promise.all([
        supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false),
        supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .is('target_user_id', null)
          .eq('is_read', false),
      ])

      const total = (individualRes.count || 0) + (publicRes.count || 0)
      setUnreadCount(total)
    }
    fetchUnread()
  }, [])

  async function handleLogout() {
    await fetch('/api/session/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'all' }),
    }).catch(() => {})
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <aside className={cn(
      "sticky top-14 h-[calc(100vh-3.5rem)] w-64 bg-white border-r border-slate-200 z-40 flex flex-col shrink-0 transition-transform duration-300 overflow-y-auto",
      "md:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
    )}>
      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          const showBadge = link.href === '/student/notifications' && unreadCount > 0
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
              {showBadge && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-slate-200">
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 w-full transition-all duration-200">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
