import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Phone } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-white py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
            Become Job Ready Engineer in{' '}
            <span className="text-primary">90 Days</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Skillplace Academy offers comprehensive training in Civil, Mechanical, Electrical, and Electronics engineering with live classes, hands-on projects, and guaranteed placement assistance.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/courses">
              <Button size="lg" className="gap-2">
                Enroll Now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="gap-2">
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
              <div className="text-3xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
