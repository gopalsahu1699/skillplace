'use client'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

const leads = [
  { id: '1', name: 'John Doe', email: 'john@example.com', phone: '+91 9876543210', source: 'website', status: 'new', date: '2024-01-22' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '+91 9876543211', source: 'website', status: 'contacted', date: '2024-01-21' },
  { id: '3', name: 'Ravi Kumar', email: 'ravi@example.com', phone: '+91 9876543212', source: 'referral', status: 'converted', date: '2024-01-20' },
]

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  converted: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-700',
}

export default function AdminLeadsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Lead Management</h1>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search leads..." className="pl-10" />
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-slate-50">
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Name</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Email</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Phone</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Source</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Date</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-sm font-medium text-foreground">{lead.name}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{lead.email}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{lead.phone}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{lead.source}</td>
                <td className="px-4 py-3">
                  <Badge className={statusColors[lead.status]}>{lead.status}</Badge>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{lead.date}</td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm">Update</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
