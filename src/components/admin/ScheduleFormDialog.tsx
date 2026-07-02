'use client'
import { useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Search, X } from 'lucide-react'
import type { Course } from '@/types'

interface ScheduleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formData: Record<string, string | boolean | null | undefined>
  onChange: (data: Record<string, string | boolean | null | undefined>) => void
  submitting: boolean
  editingClass: Record<string, string | boolean | null | undefined> | null
  courses: Course[]
  selectedCourse: Course | null
  onSelectCourse: (course: Course) => void
  onClearCourse: () => void
  courseSearch: string
  onCourseSearchChange: (search: string) => void
  courseDropdownOpen: boolean
  onCourseDropdownChange: (open: boolean) => void
  onSubmit: (e: React.FormEvent) => void
}

export default function ScheduleFormDialog({
  open,
  onOpenChange,
  formData,
  onChange,
  submitting,
  editingClass,
  courses,
  selectedCourse,
  onSelectCourse,
  onClearCourse,
  courseSearch,
  onCourseSearchChange,
  courseDropdownOpen,
  onCourseDropdownChange,
  onSubmit,
}: ScheduleFormDialogProps) {
  const courseSearchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (courseSearchRef.current && !courseSearchRef.current.contains(event.target as Node)) {
        onCourseDropdownChange(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onCourseDropdownChange])

  if (!open) return null

  const filteredCourses = courses.filter((c) => {
    const search = courseSearch.toLowerCase().trim()
    if (!search) return true
    return c.title.toLowerCase().includes(search)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingClass ? 'Edit Class' : 'Schedule New Class'}
          </DialogTitle>
          <DialogDescription>
            {editingClass
              ? 'Update class schedule details'
              : 'Set date, time, and type for the new class'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div ref={courseSearchRef} className="relative">
            <label className="text-sm font-medium text-slate-700">
              Course <span className="text-red-500">*</span>
            </label>
            {selectedCourse ? (
              <div className="mt-1 flex items-center gap-2 p-3 border border-blue-300 bg-blue-50 rounded-xl">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-blue-600">
                    {selectedCourse.title.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {selectedCourse.title}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClearCourse}
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
                    value={courseSearch}
                    onChange={(e) => {
                      onCourseSearchChange(e.target.value)
                      onCourseDropdownChange(true)
                    }}
                    onFocus={() => onCourseDropdownChange(true)}
                    className="pl-10 border-slate-300"
                    placeholder="Search courses by title..."
                  />
                </div>
                {courseDropdownOpen && filteredCourses.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg">
                    {filteredCourses.map((course) => (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => onSelectCourse(course)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors"
                      >
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-blue-600">
                            {course.title.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {course.title}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {courseDropdownOpen && filteredCourses.length === 0 && courseSearch && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-center">
                    <p className="text-sm text-slate-500">No courses found matching &quot;{courseSearch}&quot;</p>
                  </div>
                )}
              </>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.title as string}
              onChange={(e) => onChange({ ...formData, title: e.target.value })}
              className="border-slate-300 mt-1"
              placeholder="e.g. Chapter 1 - Introduction"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Description</label>
            <Input
              value={(formData.description as string) ?? ''}
              onChange={(e) => onChange({ ...formData, description: e.target.value })}
              className="border-slate-300 mt-1"
              placeholder="Optional class description"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Class Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.class_type as string}
              onChange={(e) => onChange({ ...formData, class_type: e.target.value as 'online' | 'offline' | 'hybrid' })}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-1"
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={formData.class_date as string}
                onChange={(e) => onChange({ ...formData, class_date: e.target.value })}
                className="border-slate-300 mt-1"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Start Time <span className="text-red-500">*</span>
              </label>
              <Input
                type="time"
                value={formData.start_time as string}
                onChange={(e) => onChange({ ...formData, start_time: e.target.value })}
                className="border-slate-300 mt-1"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                End Time <span className="text-red-500">*</span>
              </label>
              <Input
                type="time"
                value={formData.end_time as string}
                onChange={(e) => onChange({ ...formData, end_time: e.target.value })}
                className="border-slate-300 mt-1"
                required
              />
            </div>
          </div>
          {(formData.class_type === 'online' || formData.class_type === 'hybrid') && (
            <div>
              <label className="text-sm font-medium text-slate-700">Meeting Link</label>
              <Input
                value={(formData.meeting_link as string) ?? ''}
                onChange={(e) => onChange({ ...formData, meeting_link: e.target.value })}
                className="border-slate-300 mt-1"
                placeholder="https://meet.google.com/..."
              />
            </div>
          )}
          {(formData.class_type === 'offline' || formData.class_type === 'hybrid') && (
            <div>
              <label className="text-sm font-medium text-slate-700">Location</label>
              <Input
                value={(formData.location as string) ?? ''}
                onChange={(e) => onChange({ ...formData, location: e.target.value })}
                className="border-slate-300 mt-1"
                placeholder="e.g. Room 101, Main Campus"
              />
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-slate-700">Notes</label>
              <Input
                value={(formData.notes as string) ?? ''}
                onChange={(e) => onChange({ ...formData, notes: e.target.value })}
              className="border-slate-300 mt-1"
              placeholder="Optional notes for this class"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_active as boolean}
              onChange={(e) => onChange({ ...formData, is_active: e.target.checked })}
              className="rounded"
              id="schedule-active"
            />
            <label htmlFor="schedule-active" className="text-sm text-slate-600">
              Active (visible to students)
            </label>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !formData.course_id || !formData.title || !formData.class_date || !formData.start_time || !formData.end_time}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitting
                ? 'Saving...'
                : editingClass
                  ? 'Update'
                  : 'Schedule Class'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
