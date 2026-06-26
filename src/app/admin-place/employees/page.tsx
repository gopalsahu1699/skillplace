'use client'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Search, Plus, Edit, Trash2 } from 'lucide-react'
import { getRecords, getRecord, createRecord, updateRecord, deleteRecord } from '@/lib/admin-api'
import { notify } from '@/lib/notifications'
import type { Employee, EmployeePermission } from '@/types'

interface EmployeeWithPermissions extends Employee {
  employee_permissions?: EmployeePermission
}

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeWithPermissions[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<EmployeeWithPermissions | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingEmployee, setDeletingEmployee] = useState<EmployeeWithPermissions | null>(null)
  const [showPermissions, setShowPermissions] = useState(false)
  const [permissionsEmployee, setPermissionsEmployee] = useState<EmployeeWithPermissions | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'instructor' as string,
    department: '',
    bio: '',
    photo_url: '',
    is_active: true,
  })
  const [permData, setPermData] = useState({
    can_manage_courses: false,
    can_manage_programs: false,
    can_manage_enrollments: false,
    can_manage_students: false,
    can_manage_content: false,
    can_manage_payments: false,
    can_manage_leads: false,
    can_manage_employees: false,
  })

  useEffect(() => {
    fetchEmployees()
  }, [])

  async function fetchEmployees() {
    setLoading(true)
    const [employeesData, permissionsData] = await Promise.all([
      getRecords('employees'),
      getRecords('employee_permissions'),
    ])
    
    if (employeesData) {
      const permMap = new Map()
      if (permissionsData) {
        permissionsData.forEach((p: any) => permMap.set(p.employee_id, p))
      }
      
      const enriched = employeesData.map((emp: any) => ({
        ...emp,
        employee_permissions: permMap.get(emp.id) || null,
      }))
      
      const sorted = enriched.sort((a: any, b: any) => 
        (a.name || '').localeCompare(b.name || '')
      )
      setEmployees(sorted)
    }
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editingEmployee) {
      try {
        await updateRecord('employees', editingEmployee.id, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          role: formData.role,
          department: formData.department || null,
          bio: formData.bio || null,
          photo_url: formData.photo_url || null,
          is_active: formData.is_active,
        })
        notify.employeeUpdated()
      } catch {
        notify.genericError('Failed to update employee.')
        return
      }
    } else {
      try {
        const newEmployee = await createRecord('employees', {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          role: formData.role,
          department: formData.department || null,
          bio: formData.bio || null,
          photo_url: formData.photo_url || null,
          is_active: formData.is_active,
        })
        if (newEmployee?.id) {
          await createRecord('employee_permissions', {
            employee_id: newEmployee.id,
            ...permData,
          })
        }
        notify.employeeAdded()
      } catch {
        notify.genericError('Failed to create employee.')
        return
      }
    }
    setShowForm(false)
    setEditingEmployee(null)
    resetForm()
    fetchEmployees()
  }

  async function handleDelete() {
    if (!deletingEmployee) return
    try {
      await deleteRecord('employees', deletingEmployee.id)
      notify.employeeDeleted()
    } catch {
      notify.genericError('Failed to delete employee.')
    }
    setShowDeleteConfirm(false)
    setDeletingEmployee(null)
    fetchEmployees()
  }

  async function toggleStatus(employee: EmployeeWithPermissions) {
    try {
      await updateRecord('employees', employee.id, { is_active: !employee.is_active })
      notify.statusToggled(!employee.is_active)
    } catch {
      notify.genericError('Failed to toggle status.')
      return
    }
    fetchEmployees()
  }

  function handleEdit(employee: EmployeeWithPermissions) {
    setEditingEmployee(employee)
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone || '',
      role: employee.role,
      department: employee.department || '',
      bio: employee.bio || '',
      photo_url: employee.photo_url || '',
      is_active: employee.is_active,
    })
    setShowForm(true)
  }

  function handlePermissions(employee: EmployeeWithPermissions) {
    setPermissionsEmployee(employee)
    const p = employee.employee_permissions
    setPermData({
      can_manage_courses: p?.can_manage_courses || false,
      can_manage_programs: p?.can_manage_programs || false,
      can_manage_enrollments: p?.can_manage_enrollments || false,
      can_manage_students: p?.can_manage_students || false,
      can_manage_content: p?.can_manage_content || false,
      can_manage_payments: p?.can_manage_payments || false,
      can_manage_leads: p?.can_manage_leads || false,
      can_manage_employees: p?.can_manage_employees || false,
    })
    setShowPermissions(true)
  }

  async function savePermissions() {
    if (!permissionsEmployee) return
    try {
      const existingPerms = permissionsEmployee.employee_permissions
      if (existingPerms) {
        await updateRecord('employee_permissions', existingPerms.id, permData)
      } else {
        await createRecord('employee_permissions', {
          employee_id: permissionsEmployee.id,
          ...permData,
        })
      }
      notify.settingsSaved()
      setShowPermissions(false)
      fetchEmployees()
    } catch {
      notify.genericError('Failed to save permissions.')
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'instructor',
      department: '',
      bio: '',
      photo_url: '',
      is_active: true,
    })
    setPermData({
      can_manage_courses: false,
      can_manage_programs: false,
      can_manage_enrollments: false,
      can_manage_students: false,
      can_manage_content: false,
      can_manage_payments: false,
      can_manage_leads: false,
      can_manage_employees: false,
    })
  }

  const filteredEmployees = employees.filter(
    (e) =>
      (e.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.department || '').toLowerCase().includes(search.toLowerCase())
  )

  const roleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-blue-100 text-blue-700'
      case 'instructor': return 'bg-purple-100 text-purple-700'
      case 'counselor': return 'bg-green-100 text-green-700'
      case 'support': return 'bg-orange-100 text-orange-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employee Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            {employees.length} employee{employees.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button
          className="gap-2 bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            resetForm()
            setEditingEmployee(null)
            setShowForm(true)
          }}
        >
          <Plus className="h-4 w-4" /> Add Employee
        </Button>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Full Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-slate-300"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border-slate-300"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="border-slate-300"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="admin">Admin</option>
                <option value="instructor">Instructor</option>
                <option value="counselor">Counselor</option>
                <option value="support">Support</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">None</option>
                <option value="civil">Civil</option>
                <option value="mechanical">Mechanical</option>
                <option value="electrical">Electrical</option>
                <option value="electronics">Electronics</option>
                <option value="soft-skills">Soft Skills</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Photo URL</label>
              <Input
                value={formData.photo_url}
                onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                className="border-slate-300"
                placeholder="https://..."
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
            <div className="flex items-end">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-700">Active</label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.is_active ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.is_active ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingEmployee ? 'Update Employee' : 'Create Employee'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingEmployee(null)
                  resetForm()
                }}
                className="border-slate-300"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

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

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Name</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Email</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Role</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Department</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Status</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-slate-500">Loading...</td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-slate-500">No employees found.</td>
              </tr>
            ) : (
              filteredEmployees.map((employee) => (
                <tr key={employee.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {employee.photo_url ? (
                        <img src={employee.photo_url} alt={employee.name} className="h-8 w-8 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-blue-600">
                            {employee.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <span className="text-sm font-medium text-slate-900">
                        {employee.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{employee.email}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant="default" className={`${roleBadgeColor(employee.role)} border-0`}>
                      {employee.role}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500 capitalize">
                    {employee.department || '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => toggleStatus(employee)}
                      className="cursor-pointer"
                    >
                      <Badge
                        variant={employee.is_active ? 'default' : 'secondary'}
                        className={
                          employee.is_active
                            ? 'bg-green-100 text-green-700 border-0'
                            : 'bg-slate-100 text-slate-600 border-0'
                        }
                      >
                        {employee.is_active ? 'active' : 'inactive'}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(employee)}
                        className="hover:bg-blue-50 hover:text-blue-600"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePermissions(employee)}
                        className="hover:bg-purple-50 hover:text-purple-600"
                        title="Permissions"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDeletingEmployee(employee)
                          setShowDeleteConfirm(true)
                        }}
                        className="hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-900">
                {deletingEmployee?.name}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false)
                setDeletingEmployee(null)
              }}
              className="border-slate-300"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={showPermissions} onOpenChange={setShowPermissions}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Permissions — {permissionsEmployee?.name}</DialogTitle>
            <DialogDescription>
              Configure what this employee can manage.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            {([
              { key: 'can_manage_courses', label: 'Courses' },
              { key: 'can_manage_programs', label: 'Programs' },
              { key: 'can_manage_enrollments', label: 'Enrollments' },
              { key: 'can_manage_students', label: 'Students' },
              { key: 'can_manage_content', label: 'Content' },
              { key: 'can_manage_payments', label: 'Payments' },
              { key: 'can_manage_leads', label: 'Leads' },
              { key: 'can_manage_employees', label: 'Employees' },
            ] as const).map((perm) => (
              <button
                key={perm.key}
                type="button"
                onClick={() => setPermData({ ...permData, [perm.key]: !permData[perm.key] })}
                className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                  permData[perm.key]
                    ? 'border-green-200 bg-green-50/50 hover:bg-green-50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className={`text-sm font-medium transition-colors ${
                  permData[perm.key] ? 'text-slate-700' : 'text-slate-400'
                }`}>
                  {perm.label}
                </span>
                <span
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    permData[perm.key] ? 'bg-green-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      permData[perm.key] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </span>
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPermissions(false)}
              className="border-slate-300"
            >
              Cancel
            </Button>
            <Button onClick={savePermissions} className="bg-blue-600 hover:bg-blue-700">
              Save Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
