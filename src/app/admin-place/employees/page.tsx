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

interface Employee {
  id: string
  full_name: string | null
  email: string
  phone: string | null
  role: string
  is_active: boolean
  created_at: string
}

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'employee',
    is_active: true,
  })

  useEffect(() => {
    fetchEmployees()
  }, [])

  async function fetchEmployees() {
    setLoading(true)
    const data = await getRecords('profiles')
    if (data) {
      setEmployees(data.filter((e: any) => e.role === 'employee' || e.role === 'admin').sort((a: Employee, b: Employee) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
    }
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editingEmployee) {
      try {
        await updateRecord('profiles', editingEmployee.id, {
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone || null,
          role: formData.role,
          is_active: formData.is_active,
        })
      } catch (err: any) {
        console.error('Error updating employee:', err)
        return
      }
    } else {
      try {
        await createRecord('profiles', {
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone || null,
          role: formData.role,
          is_active: formData.is_active,
        })
      } catch (err: any) {
        console.error('Error creating employee:', err)
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
      await deleteRecord('profiles', deletingEmployee.id)
    } catch (err: any) {
      console.error('Error deleting employee:', err)
    }
    setShowDeleteConfirm(false)
    setDeletingEmployee(null)
    fetchEmployees()
  }

  async function toggleStatus(employee: Employee) {
    try {
      await updateRecord('profiles', employee.id, { is_active: !employee.is_active })
    } catch (err: any) {
      console.error('Error toggling status:', err)
      return
    }
    fetchEmployees()
  }

  function handleEdit(employee: Employee) {
    setEditingEmployee(employee)
    setFormData({
      full_name: employee.full_name || '',
      email: employee.email,
      phone: employee.phone || '',
      role: employee.role,
      is_active: employee.is_active,
    })
    setShowForm(true)
  }

  function resetForm() {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      role: 'employee',
      is_active: true,
    })
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
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
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
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
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
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Name</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Email</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Phone</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Role</th>
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
                      <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-blue-600">
                          {(employee.full_name || 'U').charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-slate-900">
                        {employee.full_name || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{employee.email}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{employee.phone || '—'}</td>
                  <td className="px-5 py-3.5">
                    <Badge
                      variant="default"
                      className={
                        employee.role === 'admin'
                          ? 'bg-blue-100 text-blue-700 border-0'
                          : 'bg-purple-100 text-purple-700 border-0'
                      }
                    >
                      {employee.role}
                    </Badge>
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
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDeletingEmployee(employee)
                          setShowDeleteConfirm(true)
                        }}
                        className="hover:bg-red-50 hover:text-red-600"
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

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-900">
                {deletingEmployee?.full_name || deletingEmployee?.email}
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
    </div>
  )
}
