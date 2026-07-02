'use client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { X, Loader2 } from 'lucide-react'
import type { TrainingProgram, Branch, Course } from '@/types'

interface ProgramFormData {
  name: string
  slug: string
  description: string
  short_description: string
  program_type: string
  branch_id: string
  price: number
  discount_price: number
  duration_weeks: number
  is_featured: boolean
  skill_level: string
  career_outcome: string
  student_count: number
  rating: number
  display_order: number
  is_active: boolean
}

interface ProgramFormDialogProps {
  open: boolean
  onClose: () => void
  formData: ProgramFormData
  onChange: (data: ProgramFormData) => void
  featuresText: string
  onFeaturesChange: (text: string) => void
  selectedCourses: string[]
  onToggleCourse: (courseId: string) => void
  submitting: boolean
  editingProgram: TrainingProgram | null
  branches: Branch[]
  courses: Course[]
  onSubmit: (e: React.FormEvent) => void
}

export default function ProgramFormDialog({
  open,
  onClose,
  formData,
  onChange,
  featuresText,
  onFeaturesChange,
  selectedCourses,
  onToggleCourse,
  submitting,
  editingProgram,
  branches,
  courses,
  onSubmit,
}: ProgramFormDialogProps) {
  if (!open) return null

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900">
          {editingProgram ? 'Edit Program' : 'Add New Program'}
        </h2>
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Name *</label>
          <Input
            value={formData.name}
            onChange={(e) => onChange({ ...formData, name: e.target.value })}
            className="border-slate-300"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Slug *</label>
          <Input
            value={formData.slug}
            onChange={(e) => onChange({ ...formData, slug: e.target.value })}
            className="border-slate-300"
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-slate-700 mb-1 block">Description</label>
          <Textarea
            value={formData.description}
            onChange={(e) => onChange({ ...formData, description: e.target.value })}
            rows={3}
            className="border-slate-300"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-slate-700 mb-1 block">Short Description</label>
          <Input
            value={formData.short_description}
            onChange={(e) => onChange({ ...formData, short_description: e.target.value })}
            className="border-slate-300"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Program Type *</label>
          <select
            value={formData.program_type}
            onChange={(e) => onChange({ ...formData, program_type: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Branch</label>
          <select
            value={formData.branch_id}
            onChange={(e) => onChange({ ...formData, branch_id: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Branch</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Price *</label>
          <Input
            type="number"
            value={formData.price}
            onChange={(e) => onChange({ ...formData, price: Number(e.target.value) })}
            className="border-slate-300"
            required
            min={0}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Discount Price</label>
          <Input
            type="number"
            value={formData.discount_price}
            onChange={(e) => onChange({ ...formData, discount_price: Number(e.target.value) })}
            className="border-slate-300"
            min={0}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Duration (weeks)</label>
          <Input
            type="number"
            value={formData.duration_weeks}
            onChange={(e) => onChange({ ...formData, duration_weeks: Number(e.target.value) })}
            className="border-slate-300"
            min={0}
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => onChange({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-slate-700">Active</span>
          </label>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={(e) => onChange({ ...formData, is_featured: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
            />
            <span className="text-sm font-medium text-slate-700">Featured on Homepage</span>
          </label>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Skill Level</label>
          <select
            value={formData.skill_level}
            onChange={(e) => onChange({ ...formData, skill_level: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">None</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Career Outcome</label>
          <Input
            value={formData.career_outcome}
            onChange={(e) => onChange({ ...formData, career_outcome: e.target.value })}
            placeholder="e.g. Become an AutoCAD Designer"
            className="border-slate-300"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Student Count</label>
          <Input
            type="number"
            value={formData.student_count}
            onChange={(e) => onChange({ ...formData, student_count: Number(e.target.value) })}
            className="border-slate-300"
            min={0}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Rating (0-5)</label>
          <Input
            type="number"
            value={formData.rating}
            onChange={(e) => onChange({ ...formData, rating: Number(e.target.value) })}
            className="border-slate-300"
            min={0}
            max={5}
            step={0.1}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Display Order</label>
          <Input
            type="number"
            value={formData.display_order}
            onChange={(e) => onChange({ ...formData, display_order: Number(e.target.value) })}
            className="border-slate-300"
            min={0}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-slate-700 mb-1 block">Features (comma-separated)</label>
          <Input
            value={featuresText}
            onChange={(e) => onFeaturesChange(e.target.value)}
            placeholder="100% Job Assistance, Resume Building, Mock Interviews"
            className="border-slate-300"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-slate-700 mb-2 block">Link Courses to Program</label>
          <div className="border border-slate-200 rounded-lg p-3 max-h-48 overflow-y-auto">
            {courses.length === 0 ? (
              <p className="text-sm text-slate-400">No courses available</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {courses.map((course) => (
                  <label
                    key={course.id}
                    className="flex items-center gap-2 text-sm text-slate-700 hover:bg-slate-50 p-1.5 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(course.id)}
                      onChange={() => onToggleCourse(course.id)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="truncate">{course.title}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="sm:col-span-2 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-slate-300"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {editingProgram ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              editingProgram ? 'Update Program' : 'Create Program'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
