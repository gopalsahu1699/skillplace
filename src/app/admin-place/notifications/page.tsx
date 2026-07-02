'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Bell,
  Plus,
  Send,
  Users,
  User,
  BellRing,
  Gift,
  Search,
  X,
  CalendarClock,
  Info,
  CheckCircle,
  AlertTriangle,
  Clock,
  Globe,
} from 'lucide-react'
import { getRecords, createRecord, updateRecord, deleteRecord } from '@/lib/admin-api'
import NotificationCard from '@/components/admin/NotificationCard'
import ScheduledNotificationCard from '@/components/admin/ScheduledNotificationCard'
import AdminPagination from '@/components/admin/AdminPagination'

type SendMode = 'individual' | 'public'

interface Notification {
  id: string
  user_id: string
  target_user_id: string | null
  title: string
  message: string | null
  type: string
  is_read: boolean
  metadata: Record<string, unknown> | null
  created_at: string
  profiles?: { full_name: string; email: string } | null
}

interface ScheduledNotification {
  id: string
  user_id: string
  target_user_id: string | null
  title: string
  message: string | null
  type: string
  scheduled_at: string
  sent_at: string | null
  status: 'pending' | 'sent' | 'failed' | 'cancelled'
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
  profiles?: { full_name: string; email: string } | null
}

interface Student {
  id: string
  full_name: string
  email: string
  phone: string | null
}

const NOTIFICATION_TYPES = [
  { value: 'info', label: 'Info', icon: Info, color: 'bg-blue-100 text-blue-700' },
  { value: 'success', label: 'Success', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
  { value: 'warning', label: 'Warning', icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-700' },
  { value: 'promo', label: 'Promotion', icon: Gift, color: 'bg-purple-100 text-purple-700' },
]

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingNotification, setDeletingNotification] = useState<Notification | null>(null)
  const [saving, setSaving] = useState(false)
  const [sendMode, setSendMode] = useState<SendMode>('individual')
  const [formData, setFormData] = useState({
    target_user_id: '',
    title: '',
    message: '',
    type: 'info',
  })

  // Student search state
  const [studentSearch, setStudentSearch] = useState('')
  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const studentSearchRef = useRef<HTMLDivElement>(null)

  // Filter state
  const [filterType, setFilterType] = useState('all')
  const [filterRead, setFilterRead] = useState('all')
  const [page, setPage] = useState(0)

  const PAGE_SIZE = 10

  // Scheduling state
  const [deliveryMode, setDeliveryMode] = useState<'now' | 'scheduled'>('now')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [activeTab, setActiveTab] = useState<'sent' | 'scheduled'>('sent')
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([])
  const [deletingScheduled, setDeletingScheduled] = useState<ScheduledNotification | null>(null)
  const [showDeleteScheduledConfirm, setShowDeleteScheduledConfirm] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)

      const [notificationsData, studentsData, scheduledData] = await Promise.all([
        getRecords('notifications', undefined, undefined, '*,profiles(full_name,email)'),
        getRecords('students'),
        getRecords('scheduled_notifications', undefined, undefined, '*,profiles(full_name,email)'),
      ])

      const sorted = (notificationsData || [])
        .sort(
          (a: Notification, b: Notification) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      setNotifications(sorted)
      setStudents((studentsData || []).map((s: { id: string; full_name?: string; email?: string; phone?: string | null }) => ({
        id: s.id,
        full_name: s.full_name || '',
        email: s.email || '',
        phone: s.phone,
      })))
      setScheduledNotifications(
        (scheduledData || [])
          .map((s: { id: string; user_id: string; target_user_id: string | null; title: string; message: string; type: string; scheduled_at: string; created_at: string; target_type: string; sent_at: string | null; status: string; metadata: Record<string, unknown> | null; updated_at: string; profiles: { full_name: string; email: string } | null }) => ({
            id: s.id,
            user_id: s.user_id,
            target_user_id: s.target_user_id,
            title: s.title,
            message: s.message,
            type: s.type,
            scheduled_at: s.scheduled_at,
            sent_at: s.sent_at,
            status: s.status,
            metadata: s.metadata,
            created_at: s.created_at,
            updated_at: s.updated_at,
            profiles: s.profiles || null,
          }))
          .sort(
            (a: ScheduledNotification, b: ScheduledNotification) =>
              new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
          )
      )
    } catch {
      // handled silently
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(() => fetchData())
  }, [fetchData])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (studentSearchRef.current && !studentSearchRef.current.contains(event.target as Node)) {
        setStudentDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredStudents = students.filter((s) => {
    const search = studentSearch.toLowerCase().trim()
    if (!search) return true
    return (
      s.full_name.toLowerCase().includes(search) ||
      s.email.toLowerCase().includes(search) ||
      (s.phone && s.phone.includes(search))
    )
  })

  const filteredNotifications = notifications.filter((n) => {
    if (filterType !== 'all' && n.type !== filterType) return false
    if (filterRead === 'unread' && n.is_read) return false
    if (filterRead === 'read' && !n.is_read) return false
    return true
  })

  const totalPages = Math.ceil(filteredNotifications.length / PAGE_SIZE)
  const pagedNotifications = filteredNotifications.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function selectStudent(student: Student) {
    setSelectedStudent(student)
    setFormData({ ...formData, target_user_id: student.id })
    setStudentSearch('')
    setStudentDropdownOpen(false)
  }

  function clearStudentSelection() {
    setSelectedStudent(null)
    setFormData({ ...formData, target_user_id: '' })
    setStudentSearch('')
  }

  function openCreate() {
    setFormData({
      target_user_id: '',
      title: '',
      message: '',
      type: 'info',
    })
    setSelectedStudent(null)
    setStudentSearch('')
    setSendMode('individual')
    setDeliveryMode('now')
    setScheduledDate('')
    setScheduledTime('')
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.title.trim()) return
    if (sendMode === 'individual' && !formData.target_user_id) return
    if (deliveryMode === 'scheduled' && (!scheduledDate || !scheduledTime)) return
    setSaving(true)

    try {
      if (deliveryMode === 'scheduled') {
        const payload = {
          user_id: '00000000-0000-0000-0000-000000000000',
          target_user_id: sendMode === 'public' ? null : formData.target_user_id,
          title: formData.title.trim(),
          message: formData.message.trim() || null,
          type: formData.type,
          scheduled_at: new Date(`${scheduledDate}T${scheduledTime}`).toISOString(),
          status: 'pending',
          metadata: sendMode === 'public' ? { is_public: true, is_scheduled: true } : { is_scheduled: true },
        }
        await createRecord('scheduled_notifications', payload)
      } else {
        const payload = {
          user_id: '00000000-0000-0000-0000-000000000000',
          target_user_id: sendMode === 'public' ? null : formData.target_user_id,
          title: formData.title.trim(),
          message: formData.message.trim() || null,
          type: formData.type,
          is_read: false,
          metadata: sendMode === 'public' ? { is_public: true } : null,
        }
        await createRecord('notifications', payload)
      }

      setShowForm(false)
      fetchData()
    } catch {
      // handled silently
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deletingNotification) return
    try {
      await deleteRecord('notifications', deletingNotification.id)
      setShowDeleteConfirm(false)
      setDeletingNotification(null)
      fetchData()
    } catch {
      // handled silently
    }
  }

  async function handleDeleteScheduled() {
    if (!deletingScheduled) return
    try {
      await deleteRecord('scheduled_notifications', deletingScheduled.id)
      setShowDeleteScheduledConfirm(false)
      setDeletingScheduled(null)
      fetchData()
    } catch {
      // handled silently
    }
  }

  async function handleProcessNow() {
    try {
      const res = await fetch('/api/cron/process-scheduled-notifications', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || ''}`,
        },
      })
      const data = await res.json()
      if (data.processed !== undefined) {
        fetchData()
      }
    } catch {
      // handled silently
    }
  }

  async function markAsRead(id: string) {
    try {
      await updateRecord('notifications', id, { is_read: true })
      fetchData()
    } catch {
      // handled silently
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">Send and schedule notifications to students</p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Send Notification
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('sent')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'sent'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Sent Notifications
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('scheduled')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'scheduled'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            Scheduled Notifications
            {scheduledNotifications.filter((s) => s.status === 'pending').length > 0 && (
              <span className="bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full">
                {scheduledNotifications.filter((s) => s.status === 'pending').length}
              </span>
            )}
          </span>
        </button>
      </div>

      {/* Sent Notifications Tab */}
      {activeTab === 'sent' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{notifications.length}</p>
                <p className="text-xs text-slate-500">Total Sent</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <BellRing className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{unreadCount}</p>
                <p className="text-xs text-slate-500">Unread</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="h-10 w-10 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{notifications.length - unreadCount}</p>
                <p className="text-xs text-slate-500">Read</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{students.length}</p>
                <p className="text-xs text-slate-500">Students</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <Select value={filterType} onValueChange={(v) => { setPage(0); if (v !== null) setFilterType(v) }}>
              <SelectTrigger className="w-[150px] border-slate-300">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {NOTIFICATION_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterRead} onValueChange={(v) => { setPage(0); if (v !== null) setFilterRead(v) }}>
              <SelectTrigger className="w-[150px] border-slate-300">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notification List */}
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
              <Bell className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No notifications found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pagedNotifications.map((notif) => (
                <NotificationCard
                  key={notif.id}
                  id={notif.id}
                  type={notif.type}
                  title={notif.title}
                  message={notif.message}
                  is_read={notif.is_read}
                  created_at={notif.created_at}
                  profiles={notif.profiles}
                  onMarkRead={markAsRead}
                  onDelete={(id) => {
                    const n = notifications.find((x) => x.id === id)
                    if (n) { setDeletingNotification(n); setShowDeleteConfirm(true) }
                  }}
                />
              ))}
            </div>
          )}
          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalItems={filteredNotifications.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Scheduled Notifications Tab */}
      {activeTab === 'scheduled' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">
              {scheduledNotifications.filter((s) => s.status === 'pending').length} pending notification(s)
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleProcessNow}
              className="gap-2 border-slate-300"
            >
              <Clock className="h-4 w-4" />
              Process Now
            </Button>
          </div>

          {scheduledNotifications.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
              <CalendarClock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No scheduled notifications.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledNotifications.map((notif) => (
                <ScheduledNotificationCard
                  key={notif.id}
                  id={notif.id}
                  type={notif.type}
                  title={notif.title}
                  message={notif.message}
                  status={notif.status}
                  scheduled_at={notif.scheduled_at}
                  profiles={notif.profiles}
                  onDelete={(id) => {
                    const n = scheduledNotifications.find((x) => x.id === id)
                    if (n) { setDeletingScheduled(n); setShowDeleteScheduledConfirm(true) }
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Send Notification Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {deliveryMode === 'scheduled' ? 'Schedule Notification' : 'Send Notification'}
            </DialogTitle>
            <DialogDescription>
              {sendMode === 'public'
                ? 'Send a notification to all students'
                : 'Send a notification to a specific student'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Delivery Mode Toggle */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Delivery</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryMode('now')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    deliveryMode === 'now'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Send className="h-4 w-4" />
                  Send Now
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryMode('scheduled')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    deliveryMode === 'scheduled'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <CalendarClock className="h-4 w-4" />
                  Schedule for Later
                </button>
              </div>
            </div>

            {/* Scheduled Date/Time Pickers */}
            {deliveryMode === 'scheduled' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="border-slate-300 mt-1"
                    min={new Date().toISOString().split('T')[0]}
                    required={deliveryMode === 'scheduled'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Time <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="border-slate-300 mt-1"
                    required={deliveryMode === 'scheduled'}
                  />
                </div>
              </div>
            )}

            {/* Send Mode Toggle */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Send To</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSendMode('individual')
                    setSelectedStudent(null)
                    setFormData({ ...formData, target_user_id: '' })
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    sendMode === 'individual'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <User className="h-4 w-4" />
                  Individual Student
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSendMode('public')
                    setSelectedStudent(null)
                    setStudentSearch('')
                    setFormData({ ...formData, target_user_id: '' })
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    sendMode === 'public'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Globe className="h-4 w-4" />
                  All Students (Public)
                </button>
              </div>
            </div>

            {/* Student Selector - only show for individual mode */}
            {sendMode === 'individual' && (
              selectedStudent ? (
                <div className="mt-1 flex items-center gap-2 p-3 border border-blue-300 bg-blue-50 rounded-xl">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-blue-600">
                      {selectedStudent.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {selectedStudent.full_name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {selectedStudent.email}
                      {selectedStudent.phone && ` • ${selectedStudent.phone}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={clearStudentSelection}
                    className="p-1 rounded hover:bg-blue-100 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      value={studentSearch}
                      onChange={(e) => {
                        setStudentSearch(e.target.value)
                        setStudentDropdownOpen(true)
                      }}
                      onFocus={() => setStudentDropdownOpen(true)}
                      className="pl-10 border-slate-300"
                      placeholder="Search by name, email, or mobile..."
                    />
                  </div>
                  {studentDropdownOpen && filteredStudents.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg">
                      {filteredStudents.map((student) => (
                        <button
                          key={student.id}
                          type="button"
                          onClick={() => selectStudent(student)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors"
                        >
                          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-blue-600">
                              {student.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {student.full_name}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {student.email}
                              {student.phone && ` • ${student.phone}`}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {studentDropdownOpen && filteredStudents.length === 0 && studentSearch && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-center">
                      <p className="text-sm text-slate-500">No students found matching &quot;{studentSearch}&quot;</p>
                    </div>
                  )}
                </>
              )
            )}
            <div>
              <label className="text-sm font-medium text-slate-700">Type</label>
              <Select
                value={formData.type}
                onValueChange={(value) => value !== null && setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="border-slate-300 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTIFICATION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="border-slate-300 mt-1"
                placeholder="e.g. New course available!"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Notification message..."
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="border-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  saving ||
                  !formData.title.trim() ||
                  (sendMode === 'individual' && !formData.target_user_id) ||
                  (deliveryMode === 'scheduled' && (!scheduledDate || !scheduledTime))
                }
                className={deliveryMode === 'scheduled' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}
              >
                {deliveryMode === 'scheduled' ? (
                  <>
                    <CalendarClock className="h-4 w-4 mr-2" />
                    {saving ? 'Scheduling...' : 'Schedule Notification'}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {saving ? 'Sending...' : 'Send Notification'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Notification</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this notification? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              className="border-slate-300"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Scheduled Notification Confirmation */}
      <Dialog open={showDeleteScheduledConfirm} onOpenChange={setShowDeleteScheduledConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Scheduled Notification</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this scheduled notification? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteScheduledConfirm(false)}
              className="border-slate-300"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteScheduled}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
