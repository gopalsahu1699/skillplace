import { Briefcase, TrendingUp, CheckCircle, Building2 } from 'lucide-react'

const companies = ['TCS', 'Infosys', 'Wipro', 'L&T', 'Reliance', 'Adani', 'Tata Steel', 'Godrej']

export default function PlacementsPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">Placement Assistance</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Our dedicated placement cell works tirelessly to connect our students with top companies across India.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl border border-border text-center">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Resume Building</h3>
            <p className="text-muted-foreground">Professional resume crafted by industry experts to highlight your skills and projects.</p>
          </div>
          <div className="bg-white p-8 rounded-xl border border-border text-center">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Mock Interviews</h3>
            <p className="text-muted-foreground">Practice with HR and technical interview rounds conducted by industry professionals.</p>
          </div>
          <div className="bg-white p-8 rounded-xl border border-border text-center">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Guaranteed Interviews</h3>
            <p className="text-muted-foreground">Get interview opportunities with our 200+ hiring partner companies.</p>
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-8">Our Hiring Partners</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {companies.map((company) => (
              <div key={company} className="bg-white p-6 rounded-xl border border-border flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">{company}</span>
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
            <div key={stat.label} className="bg-white p-8 rounded-xl border border-border text-center">
              <div className="text-4xl font-bold text-primary">{stat.value}</div>
              <div className="text-muted-foreground mt-2">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
