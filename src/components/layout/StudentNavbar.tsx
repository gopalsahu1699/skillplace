'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { GraduationCap, LogOut, Bell, ChevronDown, User, BookOpen, Award } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function StudentNavbar() {
    const router = useRouter()
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: Record<string, unknown> } | null>(null)
  const [profileName, setProfileName] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    async function getUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        setUser(authUser)
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', authUser.id)
          .single()
        if (profile?.full_name) setProfileName(profile.full_name)
      }
    }
    getUser()

    async function fetchUnread() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return
      const [individualRes, publicRes] = await Promise.all([
        supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', authUser.id).eq('is_read', false),
        supabase.from('notifications').select('*', { count: 'exact', head: true }).is('target_user_id', null).eq('is_read', false),
      ])
      setUnreadCount((individualRes.count || 0) + (publicRes.count || 0))
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
    router.push('/')
  }

  const getInitials = (name: string | null | undefined, email: string | undefined) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    if (email) return email[0].toUpperCase()
    return 'U'
  }

  const displayName: string = profileName || (user?.user_metadata?.full_name as string) || user?.email?.split('@')[0] || 'Student'

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left: Logo + Back to site */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold">
                <span className="text-slate-800">skillplace</span>
                <span className="text-blue-600 ml-1">STUDENT</span>
              </span>
            </Link>
          </div>

          {/* Right: Notifications + User dropdown */}
          <div className="flex items-center gap-2">
            <Link
              href="/student/notifications"
              className="relative p-2 rounded-lg hover:bg-slate-50 transition-colors"
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
                <div className="h-7 w-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {getInitials(profileName || (user?.user_metadata?.full_name as string | undefined), user?.email)}
                </div>
                <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate hidden sm:inline">
                  {displayName}
                </span>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-50" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-slate-200 shadow-lg z-[60] overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                      <p className="text-sm font-medium text-slate-900 truncate">{displayName}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/student/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        My Profile
                      </Link>
                      <Link
                        href="/student/my-courses"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <BookOpen className="h-4 w-4" />
                        My Courses
                      </Link>
                      <Link
                        href="/student/certificates"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Award className="h-4 w-4" />
                        Certificates
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
          </div>
        </div>
      </div>
    </nav>
  )
}
