'use client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search, Plus, Download } from 'lucide-react'

const certificates = [
  { id: '1', student: 'Rahul Sharma', course: 'Resume Building', number: 'SP-2024-001', issued: '2024-01-15' },
  { id: '2', student: 'Priya Patel', course: 'PLC Basics', number: 'SP-2024-002', issued: '2024-01-10' },
]

export default function AdminCertificatesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Certificate Management</h1>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Issue Certificate</Button>
      </div>

      <div className="bg-white border border-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Issue New Certificate</h2>
        <form className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="student">Student</Label>
            <Input id="student" placeholder="Select student" />
          </div>
          <div>
            <Label htmlFor="course">Course</Label>
            <Input id="course" placeholder="Select course" />
          </div>
          <div>
            <Label htmlFor="certNumber">Certificate Number</Label>
            <Input id="certNumber" placeholder="SP-2024-XXX" />
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full">Issue</Button>
          </div>
        </form>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search certificates..." className="pl-10" />
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-slate-50">
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Student</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Course</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Certificate #</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Issued</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {certificates.map((cert) => (
              <tr key={cert.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-sm font-medium text-foreground">{cert.student}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{cert.course}</td>
                <td className="px-4 py-3 text-sm text-foreground">{cert.number}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{cert.issued}</td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Download className="h-4 w-4" /> PDF
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
