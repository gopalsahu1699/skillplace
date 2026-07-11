'use client'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { Search, Plus, Edit, Trash2, RotateCw } from 'lucide-react'
import { slugify } from '@/lib/utils'
import { getRecords, createRecord, updateRecord, deleteRecord } from '@/lib/admin-api'
import { SafeImg } from '@/components/ui/safe-image'
import ImageUpload from '@/components/ui/image-upload'
import { notify } from '@/lib/notifications'
import AdminDeleteDialog from '@/components/admin/AdminDeleteDialog'

interface Course {
  id: string
  title: string
  slug: string
  description: string
  short_description: string
  thumbnail_url: string | null
  price: number
  discount_price: number | null
  duration_hours: number | null
  level: string
  branch_id: string | null
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  branches?: { name: string } | null
}

interface Branch {
  id: string
  name: string
  slug: string
  is_active: boolean
}

function autoResize(el: HTMLTextAreaElement) {
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [search, setSearch] = useState('')
  const [branchFilter, setBranchFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    short_description: '',
    thumbnail_url: '',
    price: 0,
    discount_price: '',
    duration_hours: '',
    level: 'beginner',
    branch_id: '',
    is_featured: false,
    is_active: true,
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      const [coursesData, branchesData] = await Promise.all([
        getRecords('courses', undefined, undefined, '*, branches(name)'),
        getRecords('branches'),
      ])
      const sortedCourses = (coursesData || []).sort(
        (a: Course, b: Course) =>
          new Date(b.created_at || '').getTime() -
          new Date(a.created_at || '').getTime()
      )
      setCourses(sortedCourses)
      setBranches(
        (branchesData || []).filter(
          (b: Branch) => b.is_active !== false
        )
      )
    } catch {
      setError('Failed to load courses. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description || null,
        short_description: formData.short_description || null,
        thumbnail_url: formData.thumbnail_url || null,
        price: Number(formData.price) || 0,
        discount_price: formData.discount_price ? Number(formData.discount_price) : null,
        duration_hours: formData.duration_hours ? Number(formData.duration_hours) : null,
        level: formData.level || 'beginner',
        branch_id: formData.branch_id || null,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
      }
      if (editingCourse) {
        await updateRecord('courses', editingCourse.id, payload)
        notify.courseUpdated()
      } else {
        await createRecord('courses', payload)
        notify.courseCreated()
      }
      setShowForm(false)
      setEditingCourse(null)
      resetForm()
      fetchData()
    } catch {
      notify.genericError(editingCourse ? 'Failed to update course.' : 'Failed to create course.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deletingCourse) return
    try {
      await deleteRecord('courses', deletingCourse.id)
      notify.courseDeleted()
    } catch {
      notify.genericError('Failed to delete course.')
    }
    setShowDeleteConfirm(false)
    setDeletingCourse(null)
    fetchData()
  }

  function handleEdit(course: Course) {
    setEditingCourse(course)
    setFormData({
      title: course.title || '',
      slug: course.slug || '',
      description: course.description || '',
      short_description: course.short_description || '',
      thumbnail_url: course.thumbnail_url || '',
      price: course.price || 0,
      discount_price: course.discount_price != null ? String(course.discount_price) : '',
      duration_hours: course.duration_hours != null ? String(course.duration_hours) : '',
      level: course.level || 'beginner',
      branch_id: course.branch_id || '',
      is_featured: course.is_featured || false,
      is_active: course.is_active,
    })
    setShowForm(true)
  }

  function resetForm() {
    setFormData({
      title: '',
      slug: '',
      description: '',
      short_description: '',
      thumbnail_url: '',
      price: 0,
      discount_price: '',
      duration_hours: '',
      level: 'beginner',
      branch_id: '',
      is_featured: false,
      is_active: true,
    })
  }

  const filteredCourses = courses.filter(
    (c) =>
      ((c.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.slug || '').toLowerCase().includes(search.toLowerCase())) &&
      (branchFilter === '' || c.branch_id === branchFilter)
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Course Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            {courses.length} course{courses.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button
          className="gap-2 bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            resetForm()
            setEditingCourse(null)
            setShowForm(true)
          }}
        >
          <Plus className="h-4 w-4" /> Add Course
        </Button>
      </div>

      <Dialog
        open={showForm}
        onOpenChange={(open) => {
          if (!open) {
            setShowForm(false)
            setEditingCourse(null)
            resetForm()
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? 'Edit Course' : 'Add New Course'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">Title *</label>
              <textarea
                value={formData.title}
                onChange={(e) => {
                  const title = e.target.value
                  setFormData(prev => ({
                    ...prev,
                    title,
                    slug: slugify(title),
                  }))
                }}
                onInput={(e) => autoResize(e.currentTarget)}
                rows={1}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none overflow-hidden"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">Slug *</label>
              <div className="flex gap-2">
                <textarea
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  onInput={(e) => autoResize(e.currentTarget)}
                  rows={1}
                  className="flex-1 w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none overflow-hidden"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setFormData(prev => ({ ...prev, slug: slugify(prev.title) }))}
                  className="shrink-0 border-slate-300 self-start mt-0.5"
                  title="Regenerate slug from title"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                onInput={(e) => autoResize(e.currentTarget)}
                rows={3}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none overflow-hidden"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">Short Description</label>
              <textarea
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                onInput={(e) => autoResize(e.currentTarget)}
                rows={1}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none overflow-hidden"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">Thumbnail</label>
              <ImageUpload
                folder="courses"
                value={formData.thumbnail_url}
                onChange={(url) => setFormData({ ...formData, thumbnail_url: url })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Price *</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="border-slate-300"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Discount Price</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.discount_price}
                onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                className="border-slate-300"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Duration (hours)</label>
              <Input
                type="number"
                min="0"
                value={formData.duration_hours}
                onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                className="border-slate-300"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Branch</label>
              <select
                value={formData.branch_id}
                onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-6">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-700">Active</label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.is_active ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.is_active ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-700">Featured</label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_featured: !formData.is_featured })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.is_featured ? 'bg-amber-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.is_featured ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full" disabled={submitting}>
                {submitting
                  ? 'Saving...'
                  : editingCourse
                    ? 'Update Course'
                    : 'Create Course'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by title or slug..."
            className="pl-10 border-slate-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Branches</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">
                  Course
                </th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">
                  Branch
                </th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">
                  Price
                </th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">
                  Duration
                </th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">
                  Status
                </th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                      <span>Loading courses...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-sm text-red-600">{error}</p>
                      <Button variant="outline" size="sm" onClick={fetchData} className="border-slate-300">
                        Retry
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-sm font-medium text-slate-700">No courses found</p>
                      <p className="text-xs text-slate-400">
                        {search ? 'Try a different search term' : 'Click "Add Course" to get started'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr
                    key={course.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {course.thumbnail_url ? (
                          <SafeImg
                            src={course.thumbnail_url}
                            alt={course.title}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <span className="text-slate-400 text-xs">No img</span>
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-slate-900">{course.title || 'Untitled'}</p>
                            {course.is_featured && (
                              <span className="inline-flex items-center justify-center h-4 px-1.5 text-[10px] font-semibold rounded-full bg-amber-100 text-amber-700">
                                Featured
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 capitalize">{course.level || 'beginner'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {course.branches?.name || 'N/A'}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-900">
                      ₹{course.price || 0}
                      {course.discount_price != null && course.discount_price > 0 && (
                        <span className="text-xs text-green-600 ml-1">
                          (₹{course.discount_price})
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {course.duration_hours != null && course.duration_hours > 0
                        ? `${course.duration_hours}h`
                        : 'N/A'}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        variant={course.is_active ? 'default' : 'secondary'}
                        className={
                          course.is_active
                            ? 'bg-green-100 text-green-700 border-0'
                            : 'bg-slate-100 text-slate-600 border-0'
                        }
                      >
                        {course.is_active ? 'active' : 'inactive'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleEdit(course)}
                          className="hover:bg-blue-50 hover:text-blue-600"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            setDeletingCourse(course)
                            setShowDeleteConfirm(true)
                          }}
                          className="hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDelete}
        title="Course"
        itemName={deletingCourse?.title || 'this course'}
      />
    </div>
  )
}
