'use client'
import { useState, useEffect, useCallback } from 'react'
import { Bell, BellRing, Check, Info, AlertTriangle, Gift, CheckCircle, ChevronDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'

interface Notification {
  id: string
  title: string
  message: string | null
  type: 'info' | 'success' | 'warning' | 'promo'
  is_read: boolean
  created_at: string
  user_id: string | null
  target_user_id: string | null
}

function getRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin} min ago`
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`
  if (diffDay === 1) return 'Yesterday'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getTypeBadge(type: string) {
  switch (type) {
    case 'success':
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle className="h-3 w-3" />Success</span>
    case 'warning':
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"><AlertTriangle className="h-3 w-3" />Warning</span>
    case 'promo':
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700"><Gift className="h-3 w-3" />Promo</span>
    default:
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700"><Info className="h-3 w-3" />Info</span>
  }
}

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }
    setUserId(user.id)

    const [individualRes, publicRes] = await Promise.all([
      supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('notifications')
        .select('*')
        .is('target_user_id', null)
        .order('created_at', { ascending: false }),
    ])

    const allMap = new Map<string, Notification>()
    for (const n of [...(individualRes.data || []), ...(publicRes.data || [])]) {
      allMap.set(n.id, n as Notification)
    }
    const merged = Array.from(allMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    setNotifications(merged)
    setLoading(false)
  }, [])

  useEffect(() => {
    Promise.resolve().then(() => fetchNotifications())
  }, [fetchNotifications])

  async function markAsRead(id: string) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )
  }

  async function markAllRead() {
    if (!userId) return
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.is_read) : notifications
  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <BellRing className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-slate-500">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllRead}
            className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 self-start"
          >
            <Check className="h-4 w-4 mr-1.5" />
            Mark All Read
          </Button>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'unread'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-lg font-medium text-slate-900">No notifications yet</p>
            <p className="text-sm text-slate-500 mt-1">
              {filter === 'unread' ? 'All caught up!' : 'You\'ll see notifications here when you receive them.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((notif) => {
            const isExpanded = expandedId === notif.id
            return (
              <div
                key={notif.id}
                className={`bg-white rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-sm ${
                  notif.is_read
                    ? 'border-slate-200 opacity-70'
                    : 'border-blue-200 border-l-4 border-l-blue-600'
                }`}
                onClick={() => {
                  setExpandedId(isExpanded ? null : notif.id)
                  if (!notif.is_read) markAsRead(notif.id)
                }}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {!notif.is_read && (
                      <div className="h-2.5 w-2.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {getTypeBadge(notif.type)}
                        <span className="text-xs text-slate-400">{getRelativeTime(notif.created_at)}</span>
                      </div>
                      <p className={`text-sm ${notif.is_read ? 'font-medium text-slate-700' : 'font-bold text-slate-900'}`}>
                        {notif.title}
                      </p>
                      {notif.message && (
                        <p className={`text-sm text-slate-500 mt-1 ${isExpanded ? '' : 'line-clamp-2'}`}>
                          {notif.message}
                        </p>
                      )}
                    </div>
                    <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
