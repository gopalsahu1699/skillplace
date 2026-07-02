'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Download, Layers, Users, UserCheck } from 'lucide-react'
import Link from 'next/link'
import { getRecords } from '@/lib/admin-api'
import dynamic from 'next/dynamic'

const CertificateGenerator = dynamic(() => import('@/components/admin/CertificateGenerator'), { ssr: false })
const QuickIssueBatch = dynamic(() => import('@/components/admin/QuickIssueBatch'), { ssr: false })
const QuickIssueStudent = dynamic(() => import('@/components/admin/QuickIssueStudent'), { ssr: false })
import { CERTIFICATE_TYPES, type CertificateRecord } from '@/lib/certificate-types'

type Certificate = CertificateRecord

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showQuickBatch, setShowQuickBatch] = useState(false)
  const [showQuickStudent, setShowQuickStudent] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const certsData = await getRecords(
      'certificates',
      undefined,
      undefined,
      '*,profiles(full_name,email),courses(title,duration_hours)'
    )
    setCertificates(
      (certsData || []).sort(
        (a: Certificate, b: Certificate) =>
          new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime()
      )
    )
    setLoading(false)
  }

  function getTypeInfo(typeId: string | null) {
    if (!typeId) return null
    return CERTIFICATE_TYPES.find((t) => t.id === typeId) || null
  }

  const filteredCertificates = certificates.filter(
    (c) =>
      c.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.certificate_number.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Certificate Management</h1>
        <div className="flex flex-wrap gap-2">
          <Button
            className="gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="h-4 w-4" /> Issue Certificate
          </Button>
          <Button
            variant="outline"
            className="gap-2 border-slate-300"
            onClick={() => setShowQuickBatch(true)}
          >
            <Users className="h-4 w-4" /> Issue by Batch
          </Button>
          <Button
            variant="outline"
            className="gap-2 border-slate-300"
            onClick={() => setShowQuickStudent(true)}
          >
            <UserCheck className="h-4 w-4" /> Issue Student(s)
          </Button>
          <Link href="/admin-place/certificates/bulk">
            <Button variant="ghost" size="sm" className="gap-1 text-slate-500">
              <Layers className="h-3.5 w-3.5" /> Bulk
            </Button>
          </Link>
        </div>
      </div>

      {showForm && (
        <CertificateGenerator certificates={certificates} onComplete={() => { setShowForm(false); fetchData() }} />
      )}

      <QuickIssueBatch
        open={showQuickBatch}
        onClose={() => setShowQuickBatch(false)}
        onComplete={fetchData}
      />

      <QuickIssueStudent
        open={showQuickStudent}
        onClose={() => setShowQuickStudent(false)}
        onComplete={fetchData}
      />

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search certificates..."
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
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Student</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Type</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Course</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Certificate #</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Issued</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">Loading...</td>
                </tr>
              ) : filteredCertificates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">No certificates found.</td>
                </tr>
              ) : (
                filteredCertificates.map((cert) => {
                  const typeInfo = getTypeInfo(cert.certificate_type)
                  return (
                    <tr key={cert.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-blue-600">{(cert.profiles?.full_name || 'U').charAt(0)}</span>
                          </div>
                          <span className="text-sm font-medium text-slate-900">{cert.profiles?.full_name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {typeInfo ? (
                          <Badge variant="secondary" className="gap-1 text-xs">
                            {typeInfo.icon} {typeInfo.label}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Course</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">{cert.courses?.title || '-'}</td>
                      <td className="px-5 py-3.5 text-sm font-mono font-medium text-slate-900">{cert.certificate_number}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">
                        {new Date(cert.issued_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <a href={`/api/certificates/${cert.id}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" className="gap-1 hover:bg-blue-50 hover:text-blue-600">
                            <Download className="h-4 w-4" /> PDF
                          </Button>
                        </a>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
