import { Target, Eye, Users, Award, BookOpen, Wrench, MapPin, Briefcase } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">About Skillplace Academy</h1>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Empowering engineers with practical skills since 2020.
          </p>
          <p className="inline-flex items-center gap-1.5 text-sm text-blue-100 bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full mt-4 border border-white/20">
            <MapPin className="h-4 w-4" /> Bilaspur, Chhattisgarh
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Our Mission</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              To bridge the gap between academic knowledge and industry requirements by providing practical, hands-on training in engineering skills. We aim to make every student job-ready within 90 days of joining.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Our Vision</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              To become India&apos;s leading skill development platform for engineers, creating a community of industry-ready professionals who can contribute meaningfully to the engineering sector.
            </p>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Why Choose Skillplace?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">We combine industry expertise with practical training to deliver results</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: 'Industry-Relevant Curriculum', desc: 'Courses designed by industry experts based on current market demands.' },
              { icon: Users, title: 'Expert Faculty', desc: 'Learn from professionals with 10+ years of industry experience.' },
              { icon: Wrench, title: 'Hands-On Training', desc: '70% practical training with real-world projects and assignments.' },
              { icon: Award, title: 'Certified Courses', desc: 'Get certified upon completion, recognized by top companies.' },
              { icon: Briefcase, title: 'Placement Assistance', desc: 'Dedicated placement cell with 200+ hiring partners.' },
              { icon: Wrench, title: 'Flexible Scheduling', desc: 'Weekday and weekend batches to suit your schedule.' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="bg-white p-7 rounded-2xl border border-slate-200 hover:shadow-lg hover:border-blue-200 transition-all duration-300 group">
                  <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Team */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Our Team</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Our team consists of experienced engineers and educators who are passionate about skill development.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { name: 'Dr. Rajesh Mehta', role: 'Founder & Director', specialty: 'Civil Engineering' },
              { name: 'Prof. Sunita Sharma', role: 'Head of Training', specialty: 'Mechanical Engineering' },
              { name: 'Er. Amit Deshmukh', role: 'Placement Head', specialty: 'Electronics & IT' },
            ].map((member) => (
              <div key={member.name} className="text-center group">
                <div className="h-20 w-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-blue-600">{member.name.charAt(0)}</span>
                </div>
                <h4 className="font-bold text-slate-900">{member.name}</h4>
                <p className="text-sm text-slate-500">{member.role}</p>
                <p className="text-xs text-blue-600 font-medium mt-1">{member.specialty}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Partners */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Our Partners</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center">
              <p className="text-sm text-slate-500 mb-1">Sponsored by</p>
              <p className="font-bold text-slate-900">Autommensor Automation Pvt. Ltd.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center">
              <p className="text-sm text-slate-500 mb-1">Industry Partner</p>
              <p className="font-bold text-slate-900">himanshu construction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
