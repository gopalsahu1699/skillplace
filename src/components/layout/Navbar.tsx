'use client'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, GraduationCap, Shield, User, LogOut, ShoppingBag, ChevronDown, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { notify } from '@/lib/notifications'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/programs', label: 'Training Programs' },
  // { href: '/courses', label: 'Courses' },
  // { href: '/placements', label: 'Placements' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: Record<string, unknown> } | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const isDashboard = pathname.startsWith('/admin-place') || pathname.startsWith('/student') || pathname.includes('/learn')

  useEffect(() => {
    if (isDashboard) return
    async function getUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        setUser(authUser)
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name, avatar_url')
          .eq('id', authUser.id)
          .single()
        if (profile?.role === 'admin') {
          setIsAdmin(true)
        } else {
          // Fallback: check employees table
          const { data: employee } = await supabase
            .from('employees')
            .select('role')
            .eq('email', authUser.email)
            .maybeSingle()
          if (employee?.role === 'admin') setIsAdmin(true)
        }

        const [individualRes, publicRes] = await Promise.all([
          supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', authUser.id)
            .eq('is_read', false),
          supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .is('target_user_id', null)
            .eq('is_read', false),
        ])
        setUnreadCount((individualRes.count || 0) + (publicRes.count || 0))
      }
    }
    getUser()

    function handleScroll() {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isDashboard])

  async function handleLogout() {
    // Revoke all sessions for this user in DB
    await fetch('/api/session/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'all' }),
    }).catch(() => {})
    await supabase.auth.signOut()
    notify.logoutSuccess()
    router.push('/')
  }

  const getInitials = (name: string | null | undefined, email: string | undefined) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    if (email) {
      return email[0].toUpperCase()
    }
    return 'U'
  }

  if (isDashboard) return null

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <nav aria-label="Main navigation" className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/60' : 'bg-white border-b border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <img
                src="https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/skillplace_logo.jpg"
                alt="SkillPlace Academy"
                width={36}
                height={36}
                className="h-9 w-auto object-contain"
              />
               <span className="text-lg font-bold">
          <span className="text-slate-800">skillplace</span>
          <span className="text-blue-600 ml-1">ACADEMY</span>
        </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-blue-600 rounded-full group-hover:w-4/5 transition-all duration-300" />
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/admin-place"
                  className="relative px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors group inline-flex items-center gap-1"
                >
                  <Shield className="h-3.5 w-3.5" />
                  Admin
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-blue-600 rounded-full group-hover:w-4/5 transition-all duration-300" />
                </Link>
              )}
            </div>

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <Link
                    href="/student/notifications"
                    className="relative p-2 rounded-lg hover:bg-slate-50 transition-colors"
                    aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                  >
                    <Bell className="h-5 w-5 text-slate-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  <div className="relative">
                    <button
                      className="flex items-center gap-2 hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                      <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {getInitials(user.user_metadata?.full_name as string | undefined, user.email)}
                      </div>
                      <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate">
                        {(user.user_metadata?.full_name as string) || user.email?.split('@')[0]}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {dropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-50" onClick={() => setDropdownOpen(false)} />
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-lg z-[60] overflow-hidden">
                          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                            <p className="text-sm font-medium text-slate-900 truncate">{(user.user_metadata?.full_name as string) || 'User'}</p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                          </div>
                          <div className="py-1">
                            <Link
                              href="/student/profile"
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              onClick={() => setDropdownOpen(false)}
                            >
                              <User className="h-4 w-4" />
                              My Account
                            </Link>
                            <Link
                              href="/student/my-courses"
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              onClick={() => setDropdownOpen(false)}
                            >
                              <ShoppingBag className="h-4 w-4" />
                              My Purchases
                            </Link>
                          </div>
                          <div className="border-t border-slate-100 py-1">
                            <button
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                              onClick={() => { setDropdownOpen(false); handleLogout() }}
                            >
                              <LogOut className="h-4 w-4" />
                              Logout
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-600 hover:bg-blue-50">Login</Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-sm">Register</Button>
                  </Link>
                </>
              )}
            </div>

            <button
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileOpen ? <X className="h-5 w-5 text-slate-600" /> : <Menu className="h-5 w-5 text-slate-600" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden border-t border-slate-200 bg-white transition-all duration-300 absolute top-16 left-0 right-0 shadow-lg border-b z-50 ${mobileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
          <div className="px-4 py-4 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto bg-white">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin-place"
                className="block px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Admin Dashboard
              </Link>
            )}
            {user && (
              <Link
                href="/student/notifications"
                className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                <span className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            )}
            {user ? (
              <div className="pt-3 border-t border-slate-100 mt-3">
                <div className="flex items-center gap-3 px-4 py-2 mb-2">
                  <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {getInitials(user.user_metadata?.full_name as string | undefined, user.email)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{(user.user_metadata?.full_name as string) || 'User'}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <Link href="/student/profile" className="block px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-blue-50 rounded-lg" onClick={() => setMobileOpen(false)}>
                  My Account
                </Link>
                <Link href="/student/my-courses" className="block px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-blue-50 rounded-lg" onClick={() => setMobileOpen(false)}>
                  My Purchases
                </Link>
                <button onClick={() => { setMobileOpen(false); handleLogout() }} className="block w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg">
                  Logout
                </button>
              </div>
            ) : (
              <div className="pt-3 flex flex-col gap-2 border-t border-slate-100 mt-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="w-full" onClick={() => setMobileOpen(false)}>Login</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setMobileOpen(false)}>Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}
