import HeroSection from '@/components/home/HeroSection'
import StatsSection from '@/components/home/StatsSection'
import CoursesSection from '@/components/home/CoursesSection'
import PlacementSection from '@/components/home/PlacementSection'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <CoursesSection />
      <PlacementSection />
      <TestimonialsSection />
      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Ready to Start Your Engineering Career?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have transformed their careers with Skillplace Academy. Enroll today and get placed in top companies.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/courses">
              <Button size="lg" variant="secondary">Browse Courses</Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
