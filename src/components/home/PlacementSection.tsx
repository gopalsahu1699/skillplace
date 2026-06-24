import { Briefcase, TrendingUp, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function PlacementSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Placement Assistance</h2>
          <p className="mt-3 text-slate-500 max-w-2xl mx-auto">
            We don&apos;t just train you — we help you get placed. Our dedicated placement cell works with 200+ companies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="bg-white p-7 rounded-2xl border border-slate-200 text-center hover:shadow-lg transition-all duration-300 group">
            <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
              <Briefcase className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Resume Building</h3>
            <p className="text-sm text-slate-500">Professional resume crafted by industry experts</p>
          </div>
          <div className="bg-white p-7 rounded-2xl border border-slate-200 text-center hover:shadow-lg transition-all duration-300 group">
            <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Mock Interviews</h3>
            <p className="text-sm text-slate-500">Practice with HR and technical interview rounds</p>
          </div>
          <div className="bg-white p-7 rounded-2xl border border-slate-200 text-center hover:shadow-lg transition-all duration-300 group">
            <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
              <CheckCircle className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Guaranteed Interviews</h3>
            <p className="text-sm text-slate-500">Get interview opportunities with top companies</p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/placements">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25 px-8">
              Get Placement Support
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
