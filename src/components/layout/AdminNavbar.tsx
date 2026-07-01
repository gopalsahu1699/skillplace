'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Shield, LogOut, ChevronDown, User } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function AdminNavbar() {
  const [user, setUser] = useState<any>(null)
  const [profileName, setProfileName] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    async function getUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        setUser(authUser)
        // Check profiles first
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', authUser.id)
          .single()
        if (profile?.full_name) {
          setProfileName(profile.full_name)
        } else {
          // Fallback to employees
          const { data: employee } = await supabase
            .from('employees')
            .select('name')
            .eq('email', authUser.email)
            .single()
          if (employee?.name) setProfileName(employee.name)
        }
      }
    }
    getUser()
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

  const getInitials = (name: string | null | undefined, email: string | undefined) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    if (email) return email[0].toUpperCase()
    return 'A'
  }

  const displayName = profileName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin'

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left: Logo */}
          <div className="flex items-center gap-4">
            <Link href="/admin-place" className="flex items-center gap-2.5 group">
              <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center group-hover:bg-slate-800 transition-colors">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold">
                <span className="text-slate-800">skillplace</span>
                <span className="text-slate-500 ml-1">ADMIN</span>
              </span>
            </Link>
          </div>

          {/* Right: User dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                className="flex items-center gap-2 hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="h-7 w-7 bg-slate-900 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {getInitials(profileName || user?.user_metadata?.full_name, user?.email)}
                </div>
                <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate hidden sm:inline">
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
                        href="/admin-place"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Shield className="h-4 w-4" />
                        Admin Dashboard
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
