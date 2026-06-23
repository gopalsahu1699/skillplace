import Link from 'next/link'
import { Building2, Cpu, Zap, Wrench, Users, ArrowRight } from 'lucide-react'

const categories = [
  {
    name: 'Civil Engineering',
    count: 6,
    icon: Building2,
    courses: ['AutoCAD 2D', 'AutoCAD 3D', 'Revit Architecture', 'Quantity Estimation', 'BOQ Preparation', 'Site Execution Basics'],
  },
  {
    name: 'Mechanical',
    count: 4,
    icon: Wrench,
    courses: ['AutoCAD Mechanical', 'SolidWorks', 'GD&T Basics', 'Production Drawing Reading'],
  },
  {
    name: 'Electrical',
    count: 5,
    icon: Zap,
    courses: ['AutoCAD Electrical', 'LT/HT Systems', 'Panel Design', 'Solar Design', 'PLC Basics'],
  },
  {
    name: 'Electronics',
    count: 6,
    icon: Cpu,
    courses: ['PLC Programming', 'HMI', 'SCADA', 'Industrial Sensors', 'VFD', 'Industrial Networking'],
  },
  {
    name: 'Soft Skills',
    count: 5,
    icon: Users,
    courses: ['Resume Building', 'Interview Preparation', 'Communication Skills', 'LinkedIn Profile', 'Mock Interviews'],
  },
]

export default function CoursesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground">Our Course Categories</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Explore our comprehensive range of engineering and soft skills courses designed to make you industry-ready.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <Link
                key={cat.name}
                href={`/courses?category=${cat.name.toLowerCase().replace(/ /g, '-')}`}
                className="group block p-6 bg-white border border-border rounded-xl hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{cat.name}</h3>
                    <p className="text-sm text-muted-foreground">{cat.count} courses</p>
                  </div>
                </div>
                <ul className="space-y-1 mb-4">
                  {cat.courses.slice(0, 4).map((course) => (
                    <li key={course} className="text-sm text-muted-foreground flex items-center gap-1">
                      <span className="h-1 w-1 bg-primary rounded-full" />
                      {course}
                    </li>
                  ))}
                  {cat.courses.length > 4 && (
                    <li className="text-sm text-muted-foreground">+{cat.courses.length - 4} more</li>
                  )}
                </ul>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                  View Courses <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
