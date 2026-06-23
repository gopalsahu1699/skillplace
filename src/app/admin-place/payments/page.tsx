'use client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Download } from 'lucide-react'

const payments = [
  { id: '1', student: 'Rahul Sharma', course: 'AutoCAD 2D & 3D', amount: '₹3,999', status: 'completed', date: '2024-01-22' },
  { id: '2', student: 'Priya Patel', course: 'PLC Programming', amount: '₹5,999', status: 'completed', date: '2024-01-21' },
  { id: '3', student: 'Amit Kumar', course: 'SolidWorks', amount: '₹4,499', status: 'pending', date: '2024-01-20' },
  { id: '4', student: 'Sneha Reddy', course: 'PLC Programming', amount: '₹5,999', status: 'failed', date: '2024-01-19' },
]

export default function AdminPaymentsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Payment Management</h1>
        <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Export CSV</Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search payments..." className="pl-10" />
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-slate-50">
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Student</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Course</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Amount</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-sm font-medium text-foreground">{payment.student}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{payment.course}</td>
                <td className="px-4 py-3 text-sm text-foreground">{payment.amount}</td>
                <td className="px-4 py-3">
                  <Badge
                    variant={
                      payment.status === 'completed' ? 'default' :
                      payment.status === 'pending' ? 'secondary' : 'destructive'
                    }
                  >
                    {payment.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{payment.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
