'use client'
import { useState, useEffect } from 'react'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/client'
import { SafeImg } from '@/components/ui/safe-image'

interface Project {
  id: string
  title: string
  image_url: string | null
  project_url: string | null
  profiles: { full_name: string | null } | null
  courses: { title: string } | null
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchProjects() {
    const { data, error } = await supabase
      .from('student_projects')
      .select('*, profiles(full_name), courses(title)')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })

    if (!error) {
      setProjects(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    Promise.resolve().then(() => fetchProjects())
  }, [])

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 py-10 md:py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Student Projects</h1>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Explore the amazing projects built by our students during and after their courses.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-slate-500 mt-4">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex h-16 w-16 bg-slate-100 rounded-2xl items-center justify-center mb-4">
              <ExternalLink className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">No projects to display yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center overflow-hidden">
                  {project.image_url ? (
                    <SafeImg src={project.image_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="text-center">
                      <ExternalLink className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                      <span className="text-xs text-slate-400">No image</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <Badge variant="secondary" className="mb-2 bg-blue-50 text-blue-700 border-0">{project.courses?.title || 'N/A'}</Badge>
                  <h3 className="font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{project.title}</h3>
                  <p className="text-sm text-slate-500 mb-4">by {project.profiles?.full_name || 'Anonymous'}</p>
                  {project.project_url && (
                    <a href={project.project_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="gap-1 border-slate-200 hover:bg-slate-50">
                        View Project <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
