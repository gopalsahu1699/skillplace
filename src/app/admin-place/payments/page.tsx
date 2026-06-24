'use client'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Download } from 'lucide-react'
import { getRecords, getRecord, createRecord, updateRecord, deleteRecord } from '@/lib/admin-api'

interface Payment {
  id: string
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  created_at: string
  profiles: { full_name: string | null } | null
  courses: { title: string } | null
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [])

  async function fetchPayments() {
    setLoading(true)
    const data = await getRecords('payments')
    if (data) {
      setPayments(data.sort((a: Payment, b: Payment) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
    }
    setLoading(false)
  }

  const filteredPayments = payments.filter((p) =>
    p.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.courses?.title?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Payment Management</h1>
        <Button variant="outline" className="gap-2 border-slate-300 hover:bg-slate-50"><Download className="h-4 w-4" /> Export CSV</Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search payments..."
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
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Student</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Course</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Amount</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Status</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-slate-500">Loading...</td>
              </tr>
            ) : filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-slate-500">No payments found.</td>
              </tr>
            ) : (
              filteredPayments.map((payment) => (
                <tr key={payment.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-blue-600">{(payment.profiles?.full_name || 'U').charAt(0)}</span>
                      </div>
                      <span className="text-sm font-medium text-slate-900">{payment.profiles?.full_name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{payment.courses?.title || 'Unknown'}</td>
                  <td className="px-5 py-3.5 text-sm font-bold text-slate-900">₹{payment.amount}</td>
                  <td className="px-5 py-3.5">
                    <Badge
                      variant={
                        payment.status === 'completed' ? 'default' :
                        payment.status === 'pending' ? 'secondary' : 'destructive'
                      }
                      className={
                        payment.status === 'completed' ? 'bg-green-100 text-green-700 border-0' :
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-0' :
                        'bg-red-100 text-red-700 border-0'
                      }
                    >
                      {payment.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">
                    {new Date(payment.created_at).toLocaleDateString()}
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
