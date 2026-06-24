'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import CourseCard from '@/components/courses/CourseCard'
import PurchasedCourses from '@/components/courses/PurchasedCourses'
import type { Course, Category } from '@/types'

interface CoursesClientProps {
  courses: Course[]
  categories: Category[]
}

export default function CoursesClient({ courses, categories }: CoursesClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      searchTerm === '' ||
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (course.short_description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

    const matchesCategory =
      selectedCategory === null || (course as any).categories?.id === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 py-12 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Job-Oriented Courses
          </h1>
          <p className="mt-3 text-blue-100">
            Explore {courses.length}+ industry-focused courses across Civil, Mechanical, Electrical,
            and Electronics engineering
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">My Enrolled Courses</h2>
            <PurchasedCourses />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="relative mb-5">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === null
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
          {filteredCourses.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex h-16 w-16 bg-slate-100 rounded-2xl items-center justify-center mb-4">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">No courses found matching your criteria.</p>
              <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
