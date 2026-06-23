'use client'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Rahul Sharma',
    course: 'AutoCAD 2D & 3D',
    rating: 5,
    review: 'Skillplace Academy transformed my career. The practical approach to teaching AutoCAD helped me land a job within 2 months of completing the course.',
    photo: '/placeholder.svg',
  },
  {
    name: 'Priya Patel',
    course: 'PLC Programming',
    rating: 5,
    review: 'The PLC programming course was incredibly detailed. The hands-on labs and real-world projects gave me confidence to work in the automation industry.',
    photo: '/placeholder.svg',
  },
  {
    name: 'Amit Kumar',
    course: 'SolidWorks',
    rating: 4,
    review: 'Great learning environment and experienced faculty. The placement assistance team was very supportive throughout my job search journey.',
    photo: '/placeholder.svg',
  },
]

export default function TestimonialsSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground">What Our Students Say</h2>
          <p className="mt-3 text-muted-foreground">
            Hear from our students who transformed their careers with Skillplace Academy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white p-6 rounded-xl border border-border shadow-sm">
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-4">&quot;{t.review}&quot;</p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">{t.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.course}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
