import Link from 'next/link'

export default function CTASection() {
  return (
    <section className="py-20 md:py-30 px-5 md:px-20">
      <div className="max-w-7xl mx-auto bg-[var(--secondary)] rounded-3xl md:rounded-[2rem] p-10 md:p-20 relative overflow-hidden text-center">
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent opacity-50" />

        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
            Ready to Start Your Career?
          </h2>
          <p className="text-base text-white mb-8 max-w-2xl mx-auto">
            Join thousands of students who have transformed their careers with Skillplace Academy. The best time to start was yesterday. The next best time is now.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/courses"
              className="bg-white text-[var(--secondary)] px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-white/90 transition-all shadow-xl"
            >
              Browse Courses
            </Link>
            <Link
              href="/contact"
              className="border border-white text-white px-7 py-3.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
