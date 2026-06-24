'use client'
import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Search, UserCog, Save, Shield } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

interface Employee {
  id: string
  full_name: string | null
  email: string
  role: string
}

interface Permission {
  id: string
  employee_id: string
  can_upload_videos: boolean
  can_upload_pdfs: boolean
  can_create_quizzes: boolean
  can_edit_content: boolean
  can_delete_content: boolean
  can_manage_modules: boolean
  can_view_analytics: boolean
}

const permissionFields = [
  { key: 'can_upload_videos', label: 'Upload Videos', description: 'Can upload video content' },
  { key: 'can_upload_pdfs', label: 'Upload PDFs', description: 'Can upload PDF documents' },
  { key: 'can_create_quizzes', label: 'Create Quizzes', description: 'Can create tests and quizzes' },
  { key: 'can_edit_content', label: 'Edit Content', description: 'Can edit existing content' },
  { key: 'can_delete_content', label: 'Delete Content', description: 'Can delete content' },
  { key: 'can_manage_modules', label: 'Manage Modules', description: 'Can create and organize modules' },
  { key: 'can_view_analytics', label: 'View Analytics', description: 'Can view analytics dashboard' },
] as const

export default function EmployeePermissions() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [empResult, permResult] = await Promise.all([
      supabase.from('profiles').select('id, full_name, email, role').in('role', ['employee', 'admin']).order('full_name'),
      supabase.from('employee_permissions').select('*'),
    ])
    if (empResult.data) setEmployees(empResult.data)
    if (permResult.data) setPermissions(permResult.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function getPermission(employeeId: string): Permission {
    const existing = permissions.find((p) => p.employee_id === employeeId)
    return existing || {
      id: '',
      employee_id: employeeId,
      can_upload_videos: false,
      can_upload_pdfs: false,
      can_create_quizzes: false,
      can_edit_content: false,
      can_delete_content: false,
      can_manage_modules: false,
      can_view_analytics: true,
    }
  }

  async function togglePermission(employeeId: string, field: string) {
    const perm = getPermission(employeeId)
    const newValue = !perm[field as keyof Permission]

    setSaving(employeeId)

    if (perm.id) {
      await supabase.from('employee_permissions').update({ [field]: newValue }).eq('id', perm.id)
    } else {
      await supabase.from('employee_permissions').insert({
        employee_id: employeeId,
        [field]: newValue,
      })
    }

    await fetchData()
    setSaving(null)
  }

  const filteredEmployees = employees.filter(
    (e) =>
      e.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employee Permissions</h1>
          <p className="text-sm text-slate-500 mt-1">Manage what employees can do in the admin panel</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search employees..."
            className="pl-10 border-slate-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : filteredEmployees.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl">
          <UserCog className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No employees found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEmployees.map((employee) => {
            const perm = getPermission(employee.id)
            return (
              <Card key={employee.id} className="border-slate-200">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-blue-600">
                        {(employee.full_name || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{employee.full_name || 'N/A'}</p>
                      <p className="text-sm text-slate-500">{employee.email}</p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={employee.role === 'admin' ? 'bg-blue-100 text-blue-700 border-0' : 'bg-purple-100 text-purple-700 border-0'}
                    >
                      {employee.role}
                    </Badge>
                    {saving === employee.id && (
                      <span className="text-xs text-blue-600">Saving...</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {permissionFields.map((field) => (
                      <button
                        key={field.key}
                        onClick={() => togglePermission(employee.id, field.key)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                          perm[field.key]
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 ${
                          perm[field.key] ? 'bg-blue-600' : 'bg-slate-200'
                        }`}>
                          {perm[field.key] && (
                            <Shield className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{field.label}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
