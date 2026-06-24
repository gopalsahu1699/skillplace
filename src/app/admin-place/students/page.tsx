'use client'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import { getRecords, getRecord, createRecord, updateRecord, deleteRecord } from '@/lib/admin-api'

interface Student {
  id: string
  full_name: string | null
  email: string
  is_active: boolean
  created_at: string
  enrollments: { id: string }[]
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudents()
  }, [])

  async function fetchStudents() {
    setLoading(true)
    const data = await getRecords('profiles')
    if (data) {
      setStudents(data.filter((s: any) => s.role === 'student').sort((a: Student, b: Student) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
    }
    setLoading(false)
  }

  const filteredStudents = students.filter((s) =>
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Student Management</h1>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search students..."
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
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Name</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Email</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Enrollments</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Status</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-slate-500">Loading...</td>
              </tr>
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-slate-500">No students found.</td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-blue-600">{(student.full_name || 'U').charAt(0)}</span>
                      </div>
                      <span className="text-sm font-medium text-slate-900">{student.full_name || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{student.email}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{student.enrollments?.length || 0}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={student.is_active ? 'default' : 'destructive'} className={student.is_active ? 'bg-green-100 text-green-700 border-0' : 'bg-red-100 text-red-700 border-0'}>
                      {student.is_active ? 'active' : 'inactive'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">
                    {new Date(student.created_at).toLocaleDateString()}
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
