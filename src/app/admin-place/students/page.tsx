'use client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, UserCheck, UserX } from 'lucide-react'

const students = [
  { id: '1', name: 'Rahul Sharma', email: 'rahul@example.com', course: 'AutoCAD 2D & 3D', status: 'active', enrolled: '2024-01-15' },
  { id: '2', name: 'Priya Patel', email: 'priya@example.com', course: 'PLC Programming', status: 'active', enrolled: '2024-01-10' },
  { id: '3', name: 'Amit Kumar', email: 'amit@example.com', course: 'SolidWorks', status: 'suspended', enrolled: '2024-01-05' },
  { id: '4', name: 'Sneha Reddy', email: 'sneha@example.com', course: 'PLC Programming', status: 'active', enrolled: '2024-01-08' },
]

export default function AdminStudentsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Student Management</h1>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search students..." className="pl-10" />
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-slate-50">
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Name</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Email</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Course</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Enrolled</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-sm font-medium text-foreground">{student.name}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{student.email}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{student.course}</td>
                <td className="px-4 py-3">
                  <Badge variant={student.status === 'active' ? 'default' : 'destructive'}>
                    {student.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{student.enrolled}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm"><UserCheck className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm"><UserX className="h-4 w-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
