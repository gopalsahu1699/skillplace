'use client'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Edit, Trash2, X } from 'lucide-react'
import { getRecords, getRecord, createRecord, updateRecord, deleteRecord } from '@/lib/admin-api'

interface Course {
  id: string
  title: string
  slug: string
  price: number
  is_active: boolean
  category_id: string | null
  categories: { name: string } | null
}

interface Category {
  id: string
  name: string
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    short_description: '',
    price: 0,
    discount_price: 0,
    duration_hours: 0,
    level: 'beginner' as string,
    category_id: '',
    is_active: true,
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const [coursesData, categoriesData] = await Promise.all([
      getRecords('courses'),
      getRecords('categories'),
    ])
    setCourses((coursesData || []).sort((a: Course, b: Course) => (a as any).created_at?.localeCompare((b as any).created_at) || 0))
    setCategories((categoriesData || []).filter((c: Category) => (c as any).is_active !== false))
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editingCourse) {
      await updateRecord('courses', editingCourse.id, formData)
    } else {
      await createRecord('courses', formData)
    }
    setShowForm(false)
    setEditingCourse(null)
    resetForm()
    fetchData()
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this course?')) return
    await deleteRecord('courses', id)
    fetchData()
  }

  function handleEdit(course: Course) {
    setEditingCourse(course)
    setFormData({
      title: course.title,
      slug: course.slug,
      description: '',
      short_description: '',
      price: course.price,
      discount_price: 0,
      duration_hours: 0,
      level: 'beginner',
      category_id: course.category_id || '',
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
      price: 0,
      discount_price: 0,
      duration_hours: 0,
      level: 'beginner',
      category_id: '',
      is_active: true,
    })
  }

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Course Management</h1>
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

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              {editingCourse ? 'Edit Course' : 'Add New Course'}
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="border-slate-300"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Slug</label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="border-slate-300"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Price (₹)</label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="border-slate-300"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Discount Price (₹)</label>
              <Input
                type="number"
                value={formData.discount_price}
                onChange={(e) => setFormData({ ...formData, discount_price: Number(e.target.value) })}
                className="border-slate-300"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Duration (hours)</label>
              <Input
                type="number"
                value={formData.duration_hours}
                onChange={(e) => setFormData({ ...formData, duration_hours: Number(e.target.value) })}
                className="border-slate-300"
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
              <label className="text-sm font-medium text-slate-700">Category</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                {editingCourse ? 'Update Course' : 'Create Course'}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search courses..."
            className="pl-10 border-slate-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Title</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Category</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Price</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Status</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-slate-500">Loading...</td>
              </tr>
            ) : filteredCourses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-slate-500">No courses found.</td>
              </tr>
            ) : (
              filteredCourses.map((course) => (
                <tr key={course.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-900">{course.title}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{course.categories?.name || 'N/A'}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-900">₹{course.price}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={course.is_active ? 'default' : 'secondary'} className={course.is_active ? 'bg-green-100 text-green-700 border-0' : 'bg-slate-100 text-slate-600 border-0'}>
                      {course.is_active ? 'active' : 'inactive'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(course)} className="hover:bg-blue-50 hover:text-blue-600">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(course.id)} className="hover:bg-red-50 hover:text-red-600">
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
  )
}
