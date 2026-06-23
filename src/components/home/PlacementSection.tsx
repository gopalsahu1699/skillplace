import { Briefcase, TrendingUp, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function PlacementSection() {
  return (
    <section className="py-16 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground">Placement Assistance</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            We don&apos;t just train you — we help you get placed. Our dedicated placement cell works with 200+ companies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="bg-white p-6 rounded-xl border border-border text-center">
            <div className="h-14 w-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Resume Building</h3>
            <p className="text-sm text-muted-foreground">Professional resume crafted by industry experts</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-border text-center">
            <div className="h-14 w-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Mock Interviews</h3>
            <p className="text-sm text-muted-foreground">Practice with HR and technical interview rounds</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-border text-center">
            <div className="h-14 w-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Guaranteed Interviews</h3>
            <p className="text-sm text-muted-foreground">Get interview opportunities with top companies</p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/placements">
            <Button size="lg">Get Placement Support</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
