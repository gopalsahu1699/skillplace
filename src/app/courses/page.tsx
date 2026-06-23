'use client'
import { useState } from 'react'
import CourseCard from '@/components/courses/CourseCard'
import CourseFilter from '@/components/courses/CourseFilter'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import type { Course } from '@/types'

const placeholderCourses: Course[] = [
  { id: '1', category_id: '1', title: 'AutoCAD 2D & 3D', slug: 'autocad-2d-3d', description: 'Master AutoCAD from basics to advanced 3D modeling.', short_description: 'Complete AutoCAD training for engineers.', thumbnail_url: null, preview_video_url: null, price: 4999, discount_price: 3999, duration_hours: 40, level: 'beginner', is_featured: true, is_active: true, created_at: '', updated_at: '' },
  { id: '2', category_id: '1', title: 'Revit Architecture', slug: 'revit-architecture', description: 'Learn BIM with Revit Architecture for building design.', short_description: 'BIM design with Revit.', thumbnail_url: null, preview_video_url: null, price: 5999, discount_price: null, duration_hours: 35, level: 'intermediate', is_featured: false, is_active: true, created_at: '', updated_at: '' },
  { id: '3', category_id: '2', title: 'SolidWorks', slug: 'solidworks', description: '3D CAD modeling with SolidWorks for mechanical design.', short_description: 'Professional 3D CAD training.', thumbnail_url: null, preview_video_url: null, price: 5499, discount_price: 4499, duration_hours: 30, level: 'intermediate', is_featured: true, is_active: true, created_at: '', updated_at: '' },
  { id: '4', category_id: '3', title: 'PLC Basics', slug: 'plc-basics', description: 'Introduction to PLC programming for electrical engineers.', short_description: 'Foundation of industrial automation.', thumbnail_url: null, preview_video_url: null, price: 3999, discount_price: null, duration_hours: 25, level: 'beginner', is_featured: false, is_active: true, created_at: '', updated_at: '' },
  { id: '5', category_id: '4', title: 'PLC Programming', slug: 'plc-programming', description: 'Advanced PLC programming with ladder logic and structured text.', short_description: 'Master industrial PLC programming.', thumbnail_url: null, preview_video_url: null, price: 6999, discount_price: 5999, duration_hours: 45, level: 'advanced', is_featured: true, is_active: true, created_at: '', updated_at: '' },
  { id: '6', category_id: '5', title: 'Resume Building', slug: 'resume-building', description: 'Create a professional resume that gets you interviews.', short_description: 'Craft your perfect resume.', thumbnail_url: null, preview_video_url: null, price: 999, discount_price: null, duration_hours: 8, level: 'beginner', is_featured: false, is_active: true, created_at: '', updated_at: '' },
]

export default function CoursesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = placeholderCourses.filter((c) => {
    const matchCategory = selectedCategory === 'all' || c.slug.includes(selectedCategory.replace('-', ''))
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase())
    return matchCategory && matchSearch
  })

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground">Our Courses</h1>
          <p className="mt-2 text-muted-foreground">Explore our wide range of engineering courses.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="sticky top-16 z-30 bg-gray-50 py-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <CourseFilter selected={selectedCategory} onSelect={setSelectedCategory} />
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No courses found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
