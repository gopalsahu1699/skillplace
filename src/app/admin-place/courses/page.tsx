'use client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Edit, Trash2 } from 'lucide-react'

const courses = [
  { id: '1', title: 'AutoCAD 2D & 3D', category: 'Civil Engineering', price: '₹3,999', students: 150, status: 'active' },
  { id: '2', title: 'Revit Architecture', category: 'Civil Engineering', price: '₹5,999', students: 80, status: 'active' },
  { id: '3', title: 'SolidWorks', category: 'Mechanical', price: '₹4,499', students: 120, status: 'active' },
  { id: '4', title: 'PLC Programming', category: 'Electronics', price: '₹5,999', students: 95, status: 'active' },
  { id: '5', title: 'Resume Building', category: 'Soft Skills', price: '₹999', students: 200, status: 'active' },
]

export default function AdminCoursesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Course Management</h1>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Add Course</Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search courses..." className="pl-10" />
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-slate-50">
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Title</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Category</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Price</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Students</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-sm font-medium text-foreground">{course.title}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{course.category}</td>
                <td className="px-4 py-3 text-sm text-foreground">{course.price}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{course.students}</td>
                <td className="px-4 py-3">
                  <Badge variant="default">{course.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4 text-red-500" /></Button>
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
