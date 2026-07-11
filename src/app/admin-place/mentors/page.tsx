'use client'
import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { getRecords, createRecord, updateRecord, deleteRecord } from '@/lib/admin-api'
import { notify } from '@/lib/notifications'
import type { Mentor } from '@/types'
import AdminDeleteDialog from '@/components/admin/AdminDeleteDialog'
import ImageUpload from '@/components/ui/image-upload'

interface MentorFormData {
  name: string
  position: string
  company: string
  expertise: string
  experience: string
  bio: string
  initials: string
  gradient: string
  image: string
  linkedin_url: string
  display_order: number
  is_active: boolean
}

const INITIAL_FORM_DATA: MentorFormData = {
  name: '',
  position: '',
  company: '',
  expertise: '',
  experience: '',
  bio: '',
  initials: '',
  gradient: 'from-blue-500 to-purple-600',
  image: '',
  linkedin_url: '',
  display_order: 0,
  is_active: true,
}

export default function AdminMentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingMentor, setEditingMentor] = useState<Mentor | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingMentor, setDeletingMentor] = useState<Mentor | null>(null)
  const [formData, setFormData] = useState<MentorFormData>(INITIAL_FORM_DATA)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getRecords('mentors')
      if (!data) throw new Error('Session expired')
      const sorted = (data as Mentor[]).sort(
        (a: Mentor, b: Mentor) => (a.display_order || 0) - (b.display_order || 0)
      )
      setMentors(sorted)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mentors')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(() => fetchData())
  }, [fetchData])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const body = {
        name: formData.name,
        position: formData.position,
        company: formData.company,
        expertise: formData.expertise,
        experience: formData.experience,
        bio: formData.bio,
        initials: formData.initials,
        gradient: formData.gradient,
        image: formData.image || null,
        linkedin_url: formData.linkedin_url || null,
        display_order: formData.display_order,
        is_active: formData.is_active,
      }

      if (editingMentor) {
        await updateRecord('mentors', editingMentor.id, body)
        notify.courseUpdated()
      } else {
        await createRecord('mentors', body)
        notify.courseCreated()
      }

      setShowForm(false)
      setEditingMentor(null)
      setFormData(INITIAL_FORM_DATA)
      fetchData()
    } catch (err) {
      notify.genericError(err instanceof Error ? err.message : 'Failed to save mentor')
    } finally {
      setSubmitting(false)
    }
  }

  function handleEdit(mentor: Mentor) {
    setEditingMentor(mentor)
    setFormData({
      name: mentor.name || '',
      position: mentor.position || '',
      company: mentor.company || '',
      expertise: mentor.expertise || '',
      experience: mentor.experience || '',
      bio: mentor.bio || '',
      initials: mentor.initials || '',
      gradient: mentor.gradient || 'from-blue-500 to-purple-600',
      image: mentor.image || '',
      linkedin_url: mentor.linkedin_url || '',
      display_order: mentor.display_order || 0,
      is_active: mentor.is_active ?? true,
    })
    setShowForm(true)
  }

  function handleDeleteClick(mentor: Mentor) {
    setDeletingMentor(mentor)
    setShowDeleteConfirm(true)
  }

  async function confirmDelete() {
    if (!deletingMentor) return
    try {
      setMentors((prev) => prev.filter((m) => m.id !== deletingMentor.id))
      setShowDeleteConfirm(false)
      setDeletingMentor(null)
      await deleteRecord('mentors', deletingMentor.id)
      notify.courseDeleted()
    } catch (err) {
      fetchData()
      notify.genericError(err instanceof Error ? err.message : 'Failed to delete mentor')
    }
  }

  const filteredMentors = mentors.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.position.toLowerCase().includes(search.toLowerCase()) ||
    m.company.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Mentors</h1>
        <Button
          className="gap-2 bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            setEditingMentor(null)
            setFormData(INITIAL_FORM_DATA)
            setShowForm(true)
          }}
        >
          <Plus className="h-4 w-4" /> Add Mentor
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchData} className="border-red-300 text-red-700 hover:bg-red-50">
            Retry
          </Button>
        </div>
      )}

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {editingMentor ? 'Edit Mentor' : 'Add New Mentor'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="border-slate-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Initials *</label>
                <Input
                  required
                  value={formData.initials}
                  onChange={(e) => setFormData({ ...formData, initials: e.target.value })}
                  placeholder="JD"
                  className="border-slate-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Position *</label>
                <Input
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Senior Civil Engineer"
                  className="border-slate-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company *</label>
                <Input
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Larsen & Toubro"
                  className="border-slate-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Expertise *</label>
                <Input
                  required
                  value={formData.expertise}
                  onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                  placeholder="Structural Engineering, BIM"
                  className="border-slate-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Experience *</label>
                <Input
                  required
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="12+ years"
                  className="border-slate-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Display Order</label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  className="border-slate-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gradient</label>
                <Input
                  value={formData.gradient}
                  onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
                  placeholder="from-blue-500 to-purple-600"
                  className="border-slate-300"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Photo</label>
                <ImageUpload
                  folder="mentors"
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn URL</label>
                <Input
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  className="border-slate-300"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Bio *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Tell us about this mentor..."
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-slate-300"
                />
                Active
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                {submitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</>
                ) : (
                  editingMentor ? 'Update Mentor' : 'Create Mentor'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setShowForm(false); setEditingMentor(null); setFormData(INITIAL_FORM_DATA) }}
                className="border-slate-300"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search mentors..."
            className="pl-10 border-slate-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Order</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Name</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Position</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Company</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Expertise</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Status</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading mentors...
                  </td>
                </tr>
              ) : filteredMentors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    {search ? 'No mentors match your search.' : 'No mentors found. Add your first mentor!'}
                  </td>
                </tr>
              ) : (
                filteredMentors.map((mentor) => (
                  <tr
                    key={mentor.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-sm text-slate-500">
                      {mentor.display_order || 0}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {mentor.image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={mentor.image}
                            alt={mentor.name}
                            className="w-9 h-9 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div
                            className={`w-9 h-9 rounded-full bg-gradient-to-br ${mentor.gradient || 'from-blue-500 to-purple-600'} flex items-center justify-center text-white text-sm font-bold shrink-0`}
                          >
                            {mentor.initials}
                          </div>
                        )}
                        <span className="text-sm font-medium text-slate-900">{mentor.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{mentor.position}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{mentor.company}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 max-w-[200px] truncate">{mentor.expertise}</td>
                    <td className="px-5 py-3.5">
                      <Badge
                        className={
                          mentor.is_active
                            ? 'bg-green-100 text-green-700 border-0'
                            : 'bg-slate-100 text-slate-600 border-0'
                        }
                      >
                        {mentor.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleEdit(mentor)}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDeleteClick(mentor)}
                          className="hover:bg-red-50 hover:text-red-600"
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
        onConfirm={confirmDelete}
        title="Mentor"
        itemName={deletingMentor?.name || 'this item'}
      />
    </div>
  )
}
