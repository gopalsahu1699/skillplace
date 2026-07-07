'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Course } from '@/types'
import { supabase } from '@/lib/supabase/client'
import { getSupabaseImageUrl } from '@/lib/utils'
import { SafeImg } from '@/components/ui/safe-image'

interface Branch {
  id: string
  name: string
  slug: string
}

interface CoursesClientProps {
  courses: Course[]
  categories: Branch[]
}

const getBranchIcon = (slug: string) => {
  switch (slug) {
    case 'civil': return 'architecture'
    case 'mechanical': return 'precision_manufacturing'
    case 'electrical': return 'electrical_services'
    case 'electronics': return 'developer_board'
    default: return 'school'
  }
}

const getBranchDesc = (slug: string) => {
  switch (slug) {
    case 'civil': return 'Master structural design and project management with industry-standard tools.'
    case 'mechanical': return 'Design future products with advanced CAD/CAM/CAE specialized modules.'
    case 'electrical': return 'Powering the world through smart grid and automation technologies.'
    case 'electronics': return 'Developing the core of modern smart devices and communication nets.'
    default: return 'Specialized courses designed for modern engineering placements.'
  }
}

export default function CoursesClient({ courses, categories }: CoursesClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null)
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([])
  const [user, setUser] = useState<{ id: string } | null>(null)

  async function checkUser() {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    setUser(currentUser)
    if (currentUser) {
      const { data } = await supabase
        .from('course_enrollments')
        .select('course_id')
        .eq('user_id', currentUser.id)
        .eq('status', 'active')
      setEnrolledCourseIds(data?.map(e => e.course_id) || [])
    }
  }

  useEffect(() => {
    Promise.resolve().then(() => checkUser())
  }, [])

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      searchTerm === '' ||
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (course.short_description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

    const matchesBranch =
      selectedBranch === null || (course as { branches: { id: string } | null }).branches?.id === selectedBranch

    return matchesSearch && matchesBranch
  })

  const categoryCourseMap: Record<string, Course[]> = {}
  for (const c of courses) {
    const bId = c.branches?.id
    if (bId) {
      if (!categoryCourseMap[bId]) categoryCourseMap[bId] = []
      categoryCourseMap[bId].push(c)
    }
  }

  return (
    <div className="bg-background text-on-surface font-body-md overflow-x-hidden">

      {/* Hero Section */}
      <section className="relative py-20 md:py-28 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto overflow-hidden">
        {/* Background blur blob */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <span className="inline-block py-1 px-3 mb-6 rounded-full bg-secondary-container text-on-secondary font-label-md text-[12px] uppercase tracking-wider">
            Expert-Designed Curriculum
          </span>
          <h1 className="font-display-lg text-display-lg text-on-surface mb-6 leading-tight">
            Industry-Focused Courses
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 leading-relaxed">
            Bridge the gap between academic knowledge and industrial excellence. Our curriculum is crafted by domain experts to ensure immediate employment and long-term career growth in engineering.
          </p>
          <div className="flex flex-wrap gap-4">
  
            <Link
              href="/contact"
              className="px-8 py-4 border border-secondary text-secondary font-label-md text-label-md rounded-lg hover:bg-secondary/5 transition-all"
            >
              Contact an Expert
            </Link>
          </div>
        </div>
      </section>

      {/* My Enrolled Courses Section */}
      {user && enrolledCourseIds.length > 0 && (
        <section className="py-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="mb-10">
            <span className="text-secondary font-label-md tracking-widest uppercase mb-3 block">Continue Learning</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">My Enrolled Courses</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {courses.filter(c => enrolledCourseIds.includes(c.id)).map((course) => {
              const branch = course.branches
              return (
                <div key={course.id} className="tonal-card rounded-xl overflow-hidden flex flex-col group border-2 border-secondary/20">
                  <div className="h-48 bg-surface-container overflow-hidden relative">
                    {course.thumbnail_url ? (
                      <SafeImg src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-5xl text-on-surface-variant/30" style={{ fontVariationSettings: '"FILL" 1' }}>
                          {getBranchIcon(branch?.slug || '')}
                        </span>
                      </div>
                    )}
                    {branch && (
                      <span className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface font-label-md text-[10px] uppercase px-2 py-1 rounded">
                        {branch.name}
                      </span>
                    )}
                    <span className="absolute top-3 right-3 bg-success-green/90 text-white font-label-md text-[10px] uppercase px-2 py-1 rounded flex items-center gap-1">
                      <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>check_circle</span>
                      Enrolled
                    </span>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 mb-3">
                      {course.level && (
                        <span className={`font-label-md text-[10px] uppercase px-2 py-0.5 rounded ${
                          course.level === 'beginner' ? 'bg-success-green/10 text-success-green' :
                          course.level === 'intermediate' ? 'bg-tertiary-fixed/20 text-on-tertiary-fixed' :
                          'bg-error-container text-on-error-container'
                        }`}>
                          {course.level}
                        </span>
                      )}
                      {course.duration_hours && (
                        <span className="flex items-center gap-1 text-on-surface-variant text-xs">
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schedule</span>
                          {course.duration_hours}h
                        </span>
                      )}
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-2 line-clamp-2 group-hover:text-secondary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-on-surface-variant text-body-md text-sm mb-6 line-clamp-3 flex-grow">
                      {course.short_description || course.description}
                    </p>
                    <Link
                      href={`/courses/${course.slug}/learn`}
                      className="w-full py-3 bg-secondary text-on-primary font-label-md text-label-md rounded-lg text-center hover:bg-secondary/90 transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>play_circle</span>
                      Continue Learning
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

   

      {/* All Courses Grid with Search & Filter */}
      <section id="courses-grid" className="bg-surface-container-low/40 py-section-gap px-margin-mobile md:px-margin-desktop">
        <div className="max-w-container-max mx-auto">

          {/* Section Header */}
          <div className="mb-10">
            <span className="text-secondary font-label-md tracking-widest uppercase mb-3 block">Browse All</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">All Available Courses</h2>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-surface-container-lowest border border-border-subtle rounded-2xl p-6 shadow-sm mb-10">
            <div className="relative mb-5">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: '20px' }}>search</span>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-outline-variant rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all font-body-md"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedBranch(null)}
                className={`px-5 py-2 rounded-full font-label-md text-[13px] whitespace-nowrap transition-all duration-200 ${
                  selectedBranch === null
                    ? 'bg-secondary text-white shadow-sm'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                All
              </button>
              {categories.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => setSelectedBranch(branch.id)}
                  className={`px-5 py-2 rounded-full font-label-md text-[13px] whitespace-nowrap transition-all duration-200 ${
                    selectedBranch === branch.id
                      ? 'bg-secondary text-white shadow-sm'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {branch.name}
                </button>
              ))}
            </div>
          </div>

          {/* Course Cards Grid */}
          {filteredCourses.length === 0 ? (
            <div className="text-center py-20 text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl mb-4 block opacity-40">search_off</span>
              <p className="font-headline-md text-headline-md mb-1">No courses found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {filteredCourses.map((course) => {
                const branch = course.branches
                return (
                  <div key={course.id} className="tonal-card rounded-xl overflow-hidden flex flex-col group">
                    {/* Thumbnail */}
                    <div className="h-48 bg-surface-container overflow-hidden relative">
                      {course.thumbnail_url ? (
                        <SafeImg
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-5xl text-on-surface-variant/30" style={{ fontVariationSettings: '"FILL" 1' }}>
                            {getBranchIcon(branch?.slug || '')}
                          </span>
                        </div>
                      )}
                      {branch && (
                        <span className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface font-label-md text-[10px] uppercase px-2 py-1 rounded">
                          {branch.name}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center gap-2 mb-3">
                        {course.level && (
                          <span className={`font-label-md text-[10px] uppercase px-2 py-0.5 rounded ${
                            course.level === 'beginner' ? 'bg-success-green/10 text-success-green' :
                            course.level === 'intermediate' ? 'bg-tertiary-fixed/20 text-on-tertiary-fixed' :
                            'bg-error-container text-on-error-container'
                          }`}>
                            {course.level}
                          </span>
                        )}
                        {course.duration_hours && (
                          <span className="flex items-center gap-1 text-on-surface-variant text-xs">
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schedule</span>
                            {course.duration_hours}h
                          </span>
                        )}
                      </div>

                      <h3 className="font-headline-md text-headline-md text-on-surface mb-2 line-clamp-2 group-hover:text-secondary transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-on-surface-variant text-body-md text-sm mb-6 line-clamp-3 flex-grow">
                        {course.short_description || course.description}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-border-subtle mt-auto">
                        <div>
                          {course.discount_price ? (
                            <div className="flex items-center gap-2">
                              <span className="font-headline-md text-secondary text-lg">₹{course.discount_price.toLocaleString()}</span>
                              <span className="text-sm text-on-surface-variant line-through">₹{course.price.toLocaleString()}</span>
                            </div>
                          ) : (
                            <span className="font-headline-md text-secondary text-lg">
                              {course.price === 0 ? 'Free' : `₹${course.price.toLocaleString()}`}
                            </span>
                          )}
                        </div>
                        <Link
                          href={`/courses/${course.slug}`}
                          className="py-2.5 px-5 border-2 border-secondary text-secondary font-label-md text-[13px] rounded-lg hover:bg-secondary hover:text-on-primary transition-all"
                        >
                          View Course
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-container py-section-gap px-margin-mobile md:px-margin-desktop">
        <div className="max-w-container-max mx-auto text-center">
          <h2 className="font-display-lg text-headline-lg text-on-primary mb-6">Ready to Start Your Career?</h2>
          <p className="font-body-lg text-body-lg text-on-primary-container max-w-2xl mx-auto mb-10 opacity-80">
            Join thousands of successful alumni who have transformed their professional journey through Skillplace Academy.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link
              href="/programs"
              className="px-10 py-4 bg-secondary text-on-primary font-label-md text-label-md rounded-lg hover:bg-secondary/90 transition-all active:scale-95"
            >
              Enroll in a Program
            </Link>
            <Link
              href="/contact"
              className="px-10 py-4 border border-on-primary-container text-on-primary font-label-md text-label-md rounded-lg hover:bg-white/5 transition-all"
            >
              Speak to an Expert
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
