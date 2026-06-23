import { Target, Eye, Users, Award, BookOpen, Wrench } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">About Skillplace Academy</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Empowering engineers with practical skills since 2020.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Target className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Our Mission</h2>
            </div>
            <p className="text-muted-foreground">
              To bridge the gap between academic knowledge and industry requirements by providing practical, hands-on training in engineering skills. We aim to make every student job-ready within 90 days of joining.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Eye className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Our Vision</h2>
            </div>
            <p className="text-muted-foreground">
              To become India&apos;s leading skill development platform for engineers, creating a community of industry-ready professionals who can contribute meaningfully to the engineering sector.
            </p>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">Why Choose Skillplace?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: 'Industry-Relevant Curriculum', desc: 'Courses designed by industry experts based on current market demands.' },
              { icon: Users, title: 'Expert Faculty', desc: 'Learn from professionals with 10+ years of industry experience.' },
              { icon: Wrench, title: 'Hands-On Training', desc: '70% practical training with real-world projects and assignments.' },
              { icon: Award, title: 'Certified Courses', desc: 'Get certified upon completion, recognized by top companies.' },
              { icon: Users, title: 'Placement Assistance', desc: 'Dedicated placement cell with 200+ hiring partners.' },
              { icon: Wrench, title: 'Flexible Scheduling', desc: 'Weekday and weekend batches to suit your schedule.' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="bg-white p-6 rounded-xl border border-border">
                  <Icon className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl border border-border">
          <h2 className="text-2xl font-bold text-foreground mb-4">Our Team</h2>
          <p className="text-muted-foreground mb-6">
            Our team consists of experienced engineers and educators who are passionate about skill development. With combined experience of over 50 years in the engineering industry, we bring real-world knowledge to the classroom.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { name: 'Dr. Rajesh Mehta', role: 'Founder & Director', specialty: 'Civil Engineering' },
              { name: 'Prof. Sunita Sharma', role: 'Head of Training', specialty: 'Mechanical Engineering' },
              { name: 'Er. Amit Deshmukh', role: 'Placement Head', specialty: 'Electronics & IT' },
            ].map((member) => (
              <div key={member.name} className="text-center">
                <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">{member.name.charAt(0)}</span>
                </div>
                <h4 className="font-semibold text-foreground">{member.name}</h4>
                <p className="text-sm text-muted-foreground">{member.role}</p>
                <p className="text-xs text-primary">{member.specialty}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
