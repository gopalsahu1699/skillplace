'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { Download, Award, ArrowLeft } from 'lucide-react'

export default function StudentCertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCertificates()
  }, [])

  async function fetchCertificates() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('certificates')
      .select('*, courses(title, duration_hours)')
      .eq('user_id', user.id)
      .order('issued_at', { ascending: false })

    setCertificates(data || [])
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/student/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">My Certificates</h1>
        </div>

        {certificates.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Award className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-2">No certificates yet.</p>
            <p className="text-sm text-slate-400 mb-6">Complete a course to earn your first certificate!</p>
            <Link href="/courses">
              <Button className="bg-blue-600 hover:bg-blue-700">Browse Courses</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map((cert) => (
              <div key={cert.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Award className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">
                    {cert.certificate_number}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{cert.courses?.title || 'Course'}</h3>
                <p className="text-sm text-slate-500 mb-1">
                  Issued: {new Date(cert.issued_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-xs text-slate-400 mb-4">
                  Duration: {cert.courses?.duration_hours || 'N/A'} hours
                </p>
                <a href={`/api/certificates/${cert.id}`} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Download className="h-4 w-4 mr-2" /> Download Certificate
                  </Button>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
