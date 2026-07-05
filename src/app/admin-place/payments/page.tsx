'use client'

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Download, TrendingUp, Clock, CheckCircle, CreditCard } from 'lucide-react'
import { getRecords } from '@/lib/admin-api'

interface PurchaseRecord {
  id: string
  user_id: string
  course_id: string | null
  program_id: string | null
  amount: number
  currency: string | null
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  razorpay_signature: string | null
  order_id: string | null
  cf_order_id: string | null
  cf_payment_id: string | null
  payment_method: string | null
  coupon_id: string | null
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  created_at: string
  updated_at: string
  profiles: { full_name: string | null; email: string | null } | null
  courses: { title: string | null } | null
  training_programs: { name: string | null } | null
}

function formatAmount(paise: number): string {
  return `₹${(paise / 100).toLocaleString()}`
}

function getStatusClasses(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-700 border-0'
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 border-0'
    case 'failed':
      return 'bg-red-100 text-red-700 border-0'
    case 'refunded':
      return 'bg-slate-100 text-slate-700 border-0'
    default:
      return 'bg-slate-100 text-slate-700 border-0'
  }
}

export default function AdminPaymentsPage() {
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  async function fetchPurchases() {
    setLoading(true)
    try {
      const data = await getRecords(
        'payments',
        undefined,
        undefined,
        '*,profiles(full_name,email),courses(title),training_programs(name)'
      )
      if (data) {
        setPurchases(
          [...data].sort(
            (a: PurchaseRecord, b: PurchaseRecord) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        )
      }
    } catch {
      setPurchases([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    Promise.resolve().then(() => fetchPurchases())
  }, [])

  const filteredPurchases = purchases.filter((p) => {
    const name = (p.profiles?.full_name || '').toLowerCase()
    const course = (p.courses?.title || '').toLowerCase()
    const program = (p.training_programs?.name || '').toLowerCase()
    const term = search.toLowerCase()
    return name.includes(term) || course.includes(term) || program.includes(term)
  })

  const completedPurchases = purchases.filter((p) => p.status === 'completed')
  const totalRevenue = completedPurchases.reduce((sum, p) => sum + p.amount, 0)
  const completedCount = completedPurchases.length
  const pendingCount = purchases.filter((p) => p.status === 'pending').length

  const now = new Date()
  const thisMonthRevenue = purchases
    .filter((p) => {
      const d = new Date(p.created_at)
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear() &&
        p.status === 'completed'
      )
    })
    .reduce((sum, p) => sum + p.amount, 0)

  function exportToCSV() {
    const headers = ['Student', 'Email', 'Course/Program', 'Amount', 'Status', 'Date']
    const rows = filteredPurchases.map((p) => [
      p.profiles?.full_name || '',
      p.profiles?.email || '',
      p.courses?.title || p.training_programs?.name || 'Free Enrollment',
      formatAmount(p.amount),
      p.status,
      new Date(p.created_at).toLocaleDateString(),
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Payment Management</h1>
        <Button
          variant="outline"
          className="gap-2 border-slate-300 hover:bg-slate-50"
          onClick={exportToCSV}
        >
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatAmount(totalRevenue)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{completedCount}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">This Month</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatAmount(thisMonthRevenue)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by student, course or program..."
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
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">
                  Student
                </th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">
                  Course / Program
                </th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">
                  Amount
                </th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">
                  Razorpay Order ID
                </th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">
                  Status
                </th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : filteredPurchases.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    No purchases found.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((purchase) => (
                  <React.Fragment key={purchase.id}>
                    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-blue-600">
                              {(purchase.profiles?.full_name || 'U').charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {purchase.profiles?.full_name || 'Unknown'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {purchase.profiles?.email || ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-700">
                        {purchase.courses?.title || purchase.training_programs?.name || 'Free Enrollment'}
                      </td>
                      <td className="px-5 py-3.5 text-sm font-bold text-slate-900">
                        {formatAmount(purchase.amount)}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-500 font-mono">
                        {purchase.order_id || purchase.razorpay_order_id || '-'}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge className={getStatusClasses(purchase.status)}>
                          {purchase.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">
                        {new Date(purchase.created_at).toLocaleDateString()}
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
