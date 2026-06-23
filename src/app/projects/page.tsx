import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const projects = [
  { id: '1', title: 'Residential Building Plan', student: 'Rahul Sharma', course: 'AutoCAD 2D & 3D', image: '/placeholder.svg' },
  { id: '2', title: 'CNC Machine Assembly', student: 'Priya Patel', course: 'SolidWorks', image: '/placeholder.svg' },
  { id: '3', title: 'Solar Panel Layout', student: 'Amit Kumar', course: 'Solar Design', image: '/placeholder.svg' },
  { id: '4', title: 'PLC Control Panel', student: 'Sneha Reddy', course: 'PLC Programming', image: '/placeholder.svg' },
  { id: '5', title: 'Bridge Structural Analysis', student: 'Vikram Singh', course: 'Quantity Estimation', image: '/placeholder.svg' },
  { id: '6', title: 'Industrial IoT Dashboard', student: 'Neha Gupta', course: 'Industrial Networking', image: '/placeholder.svg' },
]

export default function ProjectsPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">Student Projects</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Explore the amazing projects built by our students during and after their courses.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all">
              <div className="h-48 bg-slate-100 flex items-center justify-center">
                <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-5">
                <Badge variant="secondary" className="mb-2">{project.course}</Badge>
                <h3 className="font-semibold text-foreground mb-1">{project.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">by {project.student}</p>
                <Button variant="outline" size="sm" className="gap-1">
                  View Project <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
