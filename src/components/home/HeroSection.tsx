import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="relative min-h-[95vh] flex items-center overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#091425] text-white noise-overlay">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large gradient orbs */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-600/20 to-cyan-500/10 blur-3xl animate-float" />
        <div className="absolute bottom-[-15%] left-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-indigo-600/15 to-blue-400/10 blur-3xl animate-float-delayed" />
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-gradient-to-r from-violet-600/10 to-blue-500/5 blur-2xl animate-float" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 grid-pattern opacity-40" />

        {/* Floating geometric shapes */}
        <div className="absolute top-[15%] right-[12%] animate-float">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-400/10 border border-blue-400/20 rotate-12 backdrop-blur-sm" />
        </div>
        <div className="absolute top-[35%] right-[8%] animate-float-delayed">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-400/10 border border-violet-400/20 backdrop-blur-sm" />
        </div>
        <div className="absolute bottom-[25%] right-[18%] animate-float">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-400/10 border border-emerald-400/15 -rotate-6 backdrop-blur-sm" />
        </div>
        <div className="absolute top-[60%] left-[5%] animate-float-delayed">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/15 to-orange-400/10 border border-amber-400/15 rotate-45 backdrop-blur-sm" />
        </div>

        {/* Floating tech icons */}
        <div className="absolute top-[20%] right-[25%] animate-float-delayed opacity-30">
          <span className="material-symbols-outlined text-[40px] text-blue-300">precision_manufacturing</span>
        </div>
        <div className="absolute bottom-[30%] right-[5%] animate-float opacity-20">
          <span className="material-symbols-outlined text-[36px] text-cyan-300">architecture</span>
        </div>
        <div className="absolute top-[50%] left-[8%] animate-float opacity-20">
          <span className="material-symbols-outlined text-[32px] text-violet-300">electrical_services</span>
        </div>

        {/* Subtle horizontal lines */}
        <div className="absolute top-[30%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />
        <div className="absolute top-[65%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/5 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-section-gap">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-semibold tracking-wide text-blue-200">Admissions Open 2025</span>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6">
              <span className="text-white">Build Skills.</span>
              <br />
              <span className="gradient-text">Build Career.</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-blue-100/80 mb-8 max-w-lg leading-relaxed">
              Learn industry-ready engineering skills through practical training, real-world projects, expert mentorship, and 100% placement assistance.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link
                href="/courses"
                className="shimmer-btn glow-secondary bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:from-blue-500 hover:to-blue-400 transition-all shadow-2xl shadow-blue-600/30"
              >
                Explore Courses
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <Link
                href="/register"
                className="glass text-white px-8 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-white/15 transition-all"
              >
                Start Learning Free
                <span className="material-symbols-outlined">play_circle</span>
              </Link>
            </div>

            {/* Quick stats inline */}
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-[#0a1628] flex items-center justify-center text-[10px] font-bold">P</div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 border-2 border-[#0a1628] flex items-center justify-center text-[10px] font-bold">R</div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 border-2 border-[#0a1628] flex items-center justify-center text-[10px] font-bold">K</div>
                </div>
                <span className="text-sm text-blue-200">
                  <strong className="text-white">2,000+</strong> students placed
                </span>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-amber-400 text-[20px]" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                ))}
                <span className="text-sm text-blue-200 ml-1">4.9/5</span>
              </div>
            </div>
          </div>

          {/* Right: Visual showcase */}
          <div className="hidden lg:block relative">
            {/* Main card */}
            <div className="relative">
              {/* Glow behind */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-violet-500/10 rounded-3xl blur-2xl scale-110" />

              {/* Main visual card */}
              <div className="relative glass rounded-3xl p-8 border border-white/10">
                {/* Top row: Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
                    <span className="material-symbols-outlined text-blue-400 text-[28px] mb-2" style={{ fontVariationSettings: '"FILL" 1' }}>workspace_premium</span>
                    <p className="text-2xl font-bold text-white">100%</p>
                    <p className="text-xs text-blue-300">Job Support</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
                    <span className="material-symbols-outlined text-emerald-400 text-[28px] mb-2" style={{ fontVariationSettings: '"FILL" 1' }}>groups</span>
                    <p className="text-2xl font-bold text-white">2K+</p>
                    <p className="text-xs text-blue-300">Students</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
                    <span className="material-symbols-outlined text-violet-400 text-[28px] mb-2" style={{ fontVariationSettings: '"FILL" 1' }}>school</span>
                    <p className="text-2xl font-bold text-white">10+</p>
                    <p className="text-xs text-blue-300">Mentors</p>
                  </div>
                </div>

                {/* Course preview cards */}
                <div className="space-y-3">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-colors">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500/30 to-amber-600/20 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-amber-400" style={{ fontVariationSettings: '"FILL" 1' }}>architecture</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm">Civil Engineering</p>
                      <p className="text-xs text-blue-300">AutoCAD, Revit, Staad Pro</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">Hot</span>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-colors">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/30 to-blue-600/20 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-blue-400" style={{ fontVariationSettings: '"FILL" 1' }}>settings</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm">Mechanical Engineering</p>
                      <p className="text-xs text-blue-300">SolidWorks, GD&T, CNC</p>
                    </div>
                    <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded">New</span>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-colors">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-emerald-400" style={{ fontVariationSettings: '"FILL" 1' }}>electrical_services</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm">Electrical & Electronics</p>
                      <p className="text-xs text-blue-300">PLC, SCADA, Solar, VFD</p>
                    </div>
                    <span className="text-xs font-bold text-violet-400 bg-violet-400/10 px-2 py-1 rounded">Trending</span>
                  </div>
                </div>
              </div>

              {/* Floating notification card */}
              <div className="absolute -bottom-4 -left-4 glass rounded-xl p-3 border border-white/10 animate-float-delayed shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-emerald-400 text-[20px]" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">New Placement!</p>
                    <p className="text-[10px] text-blue-300">Rahul placed at L&T</p>
                  </div>
                </div>
              </div>

              {/* Floating rating card */}
              <div className="absolute -top-3 -right-3 glass rounded-xl p-3 border border-white/10 animate-float shadow-2xl">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-400 text-[20px]" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                  <span className="text-sm font-bold text-white">4.9</span>
                  <span className="text-[10px] text-blue-300">(2.4K reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-surface to-transparent" />
    </section>
  )
}
