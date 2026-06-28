'use client'
import { useState, useEffect } from 'react'
import { Briefcase, TrendingUp, CheckCircle, Building2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

const staticCompanies = ['TCS', 'Infosys', 'Wipro', 'L&T', 'Reliance', 'Adani', 'Tata Steel', 'Godrej']

interface PlacementCompany {
  name: string
}

export default function PlacementsPage() {
  const [companies, setCompanies] = useState<string[]>(staticCompanies)

  useEffect(() => {
    async function fetchCompanies() {
      const { data } = await supabase
        .from('companies')
        .select('name')
        .eq('is_active', true)

      if (data && data.length > 0) {
        setCompanies(data.map((c: PlacementCompany) => c.name))
      }
    }
    fetchCompanies()
  }, [])

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 py-10 md:py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Placement Assistance</h1>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Our dedicated placement cell works tirelessly to connect our students with top companies across India.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center hover:shadow-lg transition-all duration-300 group">
            <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Resume Building</h3>
            <p className="text-slate-500">Professional resume crafted by industry experts to highlight your skills and projects.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center hover:shadow-lg transition-all duration-300 group">
            <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Mock Interviews</h3>
            <p className="text-slate-500">Practice with HR and technical interview rounds conducted by industry professionals.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center hover:shadow-lg transition-all duration-300 group">
            <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Guaranteed Interviews</h3>
            <p className="text-slate-500">Get interview opportunities with our 200+ hiring partner companies.</p>
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Our Hiring Partners</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {companies.map((company) => (
              <div key={company} className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-center hover:shadow-md hover:border-blue-200 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-slate-400" />
                  <span className="font-semibold text-slate-700">{company}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { value: '2000+', label: 'Students Trained' },
            { value: '1500+', label: 'Interviews Cleared' },
            { value: '95%', label: 'Placement Rate' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-8 rounded-2xl border border-slate-200 text-center hover:shadow-lg transition-all duration-300">
              <div className="text-4xl font-bold text-blue-600">{stat.value}</div>
              <div className="text-slate-500 mt-2 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
