'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import AdminDeleteDialog from '@/components/admin/AdminDeleteDialog'
import dynamic from 'next/dynamic'

const ScheduleFormDialog = dynamic(() => import('@/components/admin/ScheduleFormDialog'), { ssr: false })
import {
  Calendar,
  Plus,
  Trash2,
  Eye,
  Clock,
  Video,
  MapPin,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { getRecords, createRecord, updateRecord, deleteRecord } from '@/lib/admin-api'
import type { Course } from '@/types'

interface ClassSchedule {
  id: string
  course_id: string
  title: string
  description: string | null
  class_type: 'online' | 'offline' | 'hybrid'
  class_date: string
  start_time: string
  end_time: string
  meeting_link: string | null
  location: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface ClassScheduleWithCourse extends ClassSchedule {
  course?: Course | null
}

export default function AdminSchedulePage() {
  const [classes, setClasses] = useState<ClassScheduleWithCourse[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingClass, setEditingClass] = useState<ClassScheduleWithCourse | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingClass, setDeletingClass] = useState<ClassScheduleWithCourse | null>(null)
  const [saving, setSaving] = useState(false)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterMonth, setFilterMonth] = useState('')
  const [page, setPage] = useState(0)

  const PAGE_SIZE = 10
  const [formData, setFormData] = useState({
    course_id: '',
    title: '',
    description: '',
    class_type: 'online' as 'online' | 'offline' | 'hybrid',
    class_date: '',
    start_time: '',
    end_time: '',
    meeting_link: '',
    location: '',
    notes: '',
    is_active: true,
  })

  const [courseSearch, setCourseSearch] = useState('')
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [classesData, coursesData] = await Promise.all([
        getRecords('class_schedule'),
        getRecords('courses'),
      ])

      const courseList: Course[] = (coursesData || []).map((c: { id: string; title?: string; slug?: string; is_active?: boolean }) => ({
        id: c.id,
        title: c.title || '',
        slug: c.slug || '',
        is_active: c.is_active !== false,
      }))
      setCourses(courseList)

      const courseMap = new Map(courseList.map((c) => [c.id, c]))

      const enrichedClasses: ClassScheduleWithCourse[] = (classesData || []).map((cls: { id: string; course_id: string; class_date: string; start_time: string; end_time: string; instructor: string; room: string; type: string; created_at: string; updated_at: string }) => ({
        ...cls,
        course: courseMap.get(cls.course_id) || null,
      }))

      enrichedClasses.sort(
        (a, b) => new Date(b.class_date).getTime() - new Date(a.class_date).getTime()
      )
      setClasses(enrichedClasses)
    } catch {
      // handled silently
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(() => fetchData())
  }, [fetchData])

  function selectCourse(course: Course) {
    setSelectedCourse(course)
    setFormData({ ...formData, course_id: course.id })
    setCourseSearch('')
    setCourseDropdownOpen(false)
  }

  function clearCourseSelection() {
    setSelectedCourse(null)
    setFormData({ ...formData, course_id: '' })
    setCourseSearch('')
  }

  function openCreate() {
    setEditingClass(null)
    setFormData({
      course_id: '',
      title: '',
      description: '',
      class_type: 'online',
      class_date: '',
      start_time: '',
      end_time: '',
      meeting_link: '',
      location: '',
      notes: '',
      is_active: true,
    })
    setSelectedCourse(null)
    setCourseSearch('')
    setShowForm(true)
  }

  function openEdit(cls: ClassScheduleWithCourse) {
    setEditingClass(cls)
    setFormData({
      course_id: cls.course_id,
      title: cls.title,
      description: cls.description || '',
      class_type: cls.class_type,
      class_date: cls.class_date?.split('T')[0] || '',
      start_time: cls.start_time || '',
      end_time: cls.end_time || '',
      meeting_link: cls.meeting_link || '',
      location: cls.location || '',
      notes: cls.notes || '',
      is_active: cls.is_active !== false,
    })
    if (cls.course) {
      setSelectedCourse(cls.course)
    }
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.course_id || !formData.title || !formData.class_date || !formData.start_time || !formData.end_time) return
    setSaving(true)

    try {
      const payload = {
        course_id: formData.course_id,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        class_type: formData.class_type,
        class_date: formData.class_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        meeting_link: (formData.class_type === 'online' || formData.class_type === 'hybrid') ? formData.meeting_link.trim() || null : null,
        location: (formData.class_type === 'offline' || formData.class_type === 'hybrid') ? formData.location.trim() || null : null,
        notes: formData.notes.trim() || null,
        is_active: formData.is_active,
      }

      if (editingClass) {
        await updateRecord('class_schedule', editingClass.id, payload)
      } else {
        await createRecord('class_schedule', payload)
      }

      setShowForm(false)
      setEditingClass(null)
      fetchData()
    } catch {
      // handled silently
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deletingClass) return
    try {
      await deleteRecord('class_schedule', deletingClass.id)
      setShowDeleteConfirm(false)
      setDeletingClass(null)
      fetchData()
    } catch {
      // handled silently
    }
  }

  async function toggleActive(id: string, currentValue: boolean) {
    try {
      await updateRecord('class_schedule', id, { is_active: !currentValue })
      fetchData()
    } catch {
      // handled silently
    }
  }

  function isUpcoming(cls: ClassScheduleWithCourse) {
    const now = new Date()
    const classDateTime = new Date(`${cls.class_date}T${cls.start_time}`)
    return classDateTime > now
  }

  function isToday(cls: ClassScheduleWithCourse) {
    const today = new Date().toISOString().split('T')[0]
    return cls.class_date === today
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  const todayCount = classes.filter(isToday).length
  const upcomingCount = classes.filter(isUpcoming).length
  const onlineCount = classes.filter((c) => c.class_type === 'online').length
  const offlineCount = classes.filter((c) => c.class_type === 'offline').length
  const hybridCount = classes.filter((c) => c.class_type === 'hybrid').length

  const filteredClasses = classes.filter((cls) => {
    if (filterType !== 'all' && cls.class_type !== filterType) return false
    if (filterMonth) {
      const classMonth = cls.class_date?.substring(0, 7)
      if (classMonth !== filterMonth) return false
    }
    return true
  })

  const totalPages = Math.ceil(filteredClasses.length / PAGE_SIZE)
  const pagedClasses = filteredClasses.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Class Schedule</h1>
          <p className="text-sm text-slate-500 mt-1">Manage online, offline, and hybrid classes</p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Schedule Class
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{classes.length}</p>
            <p className="text-xs text-slate-500">Total Classes</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 bg-green-50 rounded-xl flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{upcomingCount}</p>
            <p className="text-xs text-slate-500">Upcoming</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{todayCount}</p>
            <p className="text-xs text-slate-500">Today</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center">
            <Video className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{onlineCount}</p>
            <p className="text-xs text-slate-500">Online</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 bg-green-50 rounded-xl flex items-center justify-center">
            <MapPin className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{offlineCount + hybridCount}</p>
            <p className="text-xs text-slate-500">Offline / Hybrid</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Type:</span>
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(0) }}
            className="border border-slate-300 rounded-xl px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Month:</span>
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => { setFilterMonth(e.target.value); setPage(0) }}
            className="border border-slate-300 rounded-xl px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Class List */}
      {filteredClasses.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
          <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">No scheduled classes found.</p>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Schedule Class
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {pagedClasses.map((cls) => {
            const upcoming = isUpcoming(cls)
            const today = isToday(cls)
            return (
              <div
                key={cls.id}
                className={`border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors ${
                  !cls.is_active ? 'opacity-50' : ''
                } ${upcoming && cls.is_active ? 'border-l-4 border-l-blue-500' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                    cls.class_type === 'online' ? 'bg-blue-100' :
                    cls.class_type === 'offline' ? 'bg-green-100' : 'bg-purple-100'
                  }`}>
                    {cls.class_type === 'online' ? (
                      <Video className="h-6 w-6 text-blue-600" />
                    ) : cls.class_type === 'offline' ? (
                      <MapPin className="h-6 w-6 text-green-600" />
                    ) : (
                      <Calendar className="h-6 w-6 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-900">{cls.title}</p>
                      <Badge className={`border-0 text-xs ${
                        cls.class_type === 'online' ? 'bg-blue-100 text-blue-700' :
                        cls.class_type === 'offline' ? 'bg-green-100 text-green-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {cls.class_type}
                      </Badge>
                      {today && (
                        <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                          Today
                        </Badge>
                      )}
                      {!cls.is_active && (
                        <Badge className="bg-slate-100 text-slate-600 border-0 text-xs">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">{cls.course?.title || 'Unknown Course'}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                        <Calendar className="h-3 w-3" /> {new Date(cls.class_date).toLocaleDateString()}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                        <Clock className="h-3 w-3" /> {cls.start_time} - {cls.end_time}
                      </span>
                      {cls.meeting_link && (
                        <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                          <Video className="h-3 w-3" /> Meeting Link
                        </span>
                      )}
                      {cls.location && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                          <MapPin className="h-3 w-3" /> {cls.location}
                        </span>
                      )}
                    </div>
                    {cls.description && (
                      <p className="text-xs text-slate-400 mt-1 truncate">{cls.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleActive(cls.id, cls.is_active)}
                      className={`p-1.5 rounded-lg text-xs ${
                        cls.is_active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'text-slate-400 hover:bg-slate-100'
                      }`}
                      title={cls.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {cls.is_active ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(cls)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                      title="Edit"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeletingClass(cls)
                        setShowDeleteConfirm(true)
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {filteredClasses.length > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-sm text-slate-500">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filteredClasses.length)} of{' '}
            {filteredClasses.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600 font-medium px-2">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ScheduleFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        formData={formData}
        onChange={(data) => setFormData(data as unknown as typeof formData)}
        submitting={saving}
        editingClass={editingClass as unknown as Record<string, string | boolean | null | undefined> | null}
        courses={courses}
        selectedCourse={selectedCourse}
        onSelectCourse={selectCourse}
        onClearCourse={clearCourseSelection}
        courseSearch={courseSearch}
        onCourseSearchChange={setCourseSearch}
        courseDropdownOpen={courseDropdownOpen}
        onCourseDropdownChange={setCourseDropdownOpen}
        onSubmit={handleSubmit}
      />

      {/* Delete Confirmation */}
      <AdminDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDelete}
        title="Class"
        itemName={deletingClass?.title || 'this item'}
      />
    </div>
  )
}
