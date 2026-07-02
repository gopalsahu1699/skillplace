'use client'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import { getRecords, updateRecord } from '@/lib/admin-api'
import { displayPhone } from '@/lib/validation/phone'

interface Lead {
  id: string
  name: string
  email: string
  phone: string | null
  source: string
  status: 'new' | 'contacted' | 'converted' | 'closed'
  created_at: string
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  converted: 'bg-green-100 text-green-700',
  closed: 'bg-slate-100 text-slate-700',
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  async function fetchLeads() {
    setLoading(true)
    const data = await getRecords('leads')
    if (data) {
      setLeads(data.sort((a: Lead, b: Lead) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
    }
    setLoading(false)
  }

  useEffect(() => {
    Promise.resolve().then(() => fetchLeads())
  }, [])

  async function updateLeadStatus(id: string, status: Lead['status']) {
    await updateRecord('leads', id, { status })
    fetchLeads()
  }

  const filteredLeads = leads.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Lead Management</h1>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search leads..."
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
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Phone</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Source</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Status</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Date</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-slate-500">Loading...</td>
              </tr>
            ) : filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-slate-500">No leads found.</td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr key={lead.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-900">{lead.name}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{lead.email}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{displayPhone(lead.phone) || 'N/A'}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{lead.source}</td>
                  <td className="px-5 py-3.5">
                    <Badge className={`${statusColors[lead.status]} border-0`}>{lead.status}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <select
                      value={lead.status}
                      onChange={(e) => updateLeadStatus(lead.id, e.target.value as Lead['status'])}
                      className="text-sm border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="converted">Converted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
