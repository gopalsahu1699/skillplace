'use client'

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Download, CheckCircle, XCircle } from 'lucide-react'
import { getRecords, updateRecord } from '@/lib/admin-api'
import { notify } from '@/lib/notifications'

interface Enrollment {
  id: string
  user_id: string
  program_id: string
  branch_id: string | null
  status: string
  notes: string | null
  enrolled_at: string
  selected_mode: string | null
  profiles: { full_name: string; email: string; phone: string } | null
  training_programs: { name: string; program_type: string } | null
  branches: { name: string } | null
}

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  async function fetchData() {
    setLoading(true)
    const data = await getRecords('enrollments', undefined, undefined, 'profiles(*),training_programs(*),branches(*)')
    setEnrollments(
      (data || [])
        .sort((a: Enrollment, b: Enrollment) => new Date(b.enrolled_at).getTime() - new Date(a.enrolled_at).getTime())
    )
    setLoading(false)
  }

  useEffect(() => {
    Promise.resolve().then(() => fetchData())
  }, [])

  async function updateStatus(id: string, status: string) {
    await updateRecord('enrollments', id, { status })
    notify.settingsSaved()
    fetchData()
  }

  function exportToCSV() {
    const headers = ['Name', 'Email', 'Phone', 'Program', 'Type', 'Mode', 'Branch', 'Status', 'Date']
    const rows = filteredEnrollments.map((e) => [
      e.profiles?.full_name || '',
      e.profiles?.email || '',
      e.profiles?.phone || '',
      e.training_programs?.name || '',
      e.training_programs?.program_type || '',
      e.selected_mode || '',
      e.branches?.name || '',
      e.status,
      new Date(e.enrolled_at).toLocaleDateString(),
    ])
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `enrollments-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredEnrollments = enrollments.filter((e) => {
    const matchesSearch =
      e.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.profiles?.email?.toLowerCase().includes(search.toLowerCase()) ||
      e.training_programs?.name?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: enrollments.length,
    pending: enrollments.filter((e) => e.status === 'pending').length,
    active: enrollments.filter((e) => e.status === 'active').length,
    completed: enrollments.filter((e) => e.status === 'completed').length,
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Program Enrollments</h1>
        <Button variant="outline" className="gap-2 border-slate-300" onClick={exportToCSV}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-sm text-slate-500">Total</p>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-sm text-slate-500">Active</p>
          <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-sm text-slate-500">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, email, or program..."
            className="pl-10 border-slate-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Student</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Program</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Type</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Mode</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Branch</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Status</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Date</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-500">Loading...</td>
                </tr>
              ) : filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-500">No enrollments found.</td>
                </tr>
              ) : (
                filteredEnrollments.map((enrollment) => (
                  <React.Fragment key={enrollment.id}>
                    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{enrollment.profiles?.full_name || 'N/A'}</p>
                          <p className="text-xs text-slate-500">{enrollment.profiles?.email}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-900">{enrollment.training_programs?.name || 'N/A'}</td>
                      <td className="px-5 py-3.5">
                        <Badge className={
                          enrollment.training_programs?.program_type === 'offline' ? 'bg-blue-100 text-blue-700 border-0' :
                          enrollment.training_programs?.program_type === 'online' ? 'bg-purple-100 text-purple-700 border-0' :
                          'bg-amber-100 text-amber-700 border-0'
                        }>
                          {enrollment.training_programs?.program_type || 'N/A'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        {enrollment.selected_mode ? (
                          <Badge className={
                            enrollment.selected_mode === 'offline' ? 'bg-blue-100 text-blue-700 border-0' :
                            enrollment.selected_mode === 'online' ? 'bg-purple-100 text-purple-700 border-0' :
                            'bg-amber-100 text-amber-700 border-0'
                          }>
                            {enrollment.selected_mode}
                          </Badge>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{enrollment.branches?.name || 'N/A'}</td>
                      <td className="px-5 py-3.5">
                        <Badge className={
                          enrollment.status === 'active' ? 'bg-green-100 text-green-700 border-0' :
                          enrollment.status === 'completed' ? 'bg-blue-100 text-blue-700 border-0' :
                          enrollment.status === 'cancelled' ? 'bg-red-100 text-red-700 border-0' :
                          'bg-amber-100 text-amber-700 border-0'
                        }>
                          {enrollment.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">
                        {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          {enrollment.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateStatus(enrollment.id, 'active')}
                                className="hover:bg-green-50 hover:text-green-600"
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateStatus(enrollment.id, 'cancelled')}
                                className="hover:bg-red-50 hover:text-red-600"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {enrollment.status === 'active' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateStatus(enrollment.id, 'completed')}
                              className="hover:bg-blue-50 hover:text-blue-600"
                              title="Mark Complete"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
