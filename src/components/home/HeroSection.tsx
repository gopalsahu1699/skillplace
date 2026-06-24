import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Phone, MapPin } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-slate-50 py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-100/80 backdrop-blur-sm text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-blue-200/50">
            <MapPin className="h-4 w-4" /> Bilaspur, Chhattisgarh
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
            Become Job Ready Engineer in{' '}
            <span className="text-blue-600">90 Days</span>
          </h1>
          <p className="mt-6 text-lg text-slate-500 max-w-2xl mx-auto">
            Skillplace Academy offers comprehensive training in Civil, Mechanical, Electrical, and Electronics engineering with live classes, hands-on projects, and guaranteed placement assistance.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/courses">
              <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25 px-8">
                Enroll Now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="gap-2 border-slate-300 hover:bg-slate-50 px-8">
                <Phone className="h-4 w-4" /> Free Career Counseling
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {[
            { value: '2000+', label: 'Students Trained' },
            { value: '1500+', label: 'Interviews Cleared' },
            { value: '500+', label: 'Projects Completed' },
            { value: '95%', label: 'Placement Rate' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
              <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
