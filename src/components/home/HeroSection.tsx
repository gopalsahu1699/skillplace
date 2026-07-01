import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="relative min-h-[95vh] flex items-center overflow-hidden bg-gradient-to-br from-surface via-surface-container-low to-surface-container text-on-surface noise-overlay">
      {/* Background orbs (static, subtle in light theme) */}


      <div className="relative z-10 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-section-gap">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div>
            {/* Brand & Badge */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="text-2xl font-extrabold tracking-wider text-secondary uppercase">Skillplace Academy</span>
              <span className="text-slate-300">|</span>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-emerald-800 tracking-wide">Admissions Open</span>
              </div>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6">
              <span className="text-on-surface">Build Skills.</span>
              <br />
              <span className="gradient-text">Build Career.</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-on-surface-variant mb-8 max-w-lg leading-relaxed">
              Learn industry-ready engineering skills through practical training, real-world projects, expert mentorship, and 100% placement assistance.
            </p>

            {/* CTAs */}
            {/* <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link
                href="#path-finder-quiz"
                className="bg-secondary text-white px-8 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-secondary-container transition-all shadow-md shadow-secondary/15"
              >
                Find Your Path (Quiz)
                <span className="material-symbols-outlined">quiz</span>
              </Link>
              <Link
                href="#free-counseling"
                className="bg-white border border-border-subtle text-on-surface px-8 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
              >
                Book Free Counseling
                <span className="material-symbols-outlined">support_agent</span>
              </Link>
            </div> */}

            {/* Quick stats inline */}
            {/* <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">P</div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">R</div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">K</div>
                </div>
                <span className="text-sm text-on-surface-variant">
                  <strong className="text-on-surface">2,000+</strong> students placed
                </span>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-amber-500 text-[20px]" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                ))}
                <span className="text-sm text-on-surface-variant ml-1">4.9/5</span>
              </div>
            </div> */}

          </div>

          {/* Right: Visual showcase */}
          <div className="hidden lg:block relative">
            {/* Main card */}
            <div className="relative">
              {/* Glow behind (subtle) */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-violet-500/5 rounded-3xl blur-2xl scale-110" />

              {/* Main visual card */}
              <div className="relative bg-white/95 backdrop-blur-md rounded-3xl p-8 border border-border-subtle shadow-xl">
                {/* Top row: Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                    <span className="material-symbols-outlined text-secondary text-[28px] mb-2" style={{ fontVariationSettings: '"FILL" 1' }}>workspace_premium</span>
                    <p className="text-2xl font-bold text-on-surface">100%</p>
                    <p className="text-xs text-on-surface-variant">Job Support</p>
                  </div>
                  {/* <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                    <span className="material-symbols-outlined text-emerald-600 text-[28px] mb-2" style={{ fontVariationSettings: '"FILL" 1' }}>groups</span>
                    <p className="text-2xl font-bold text-on-surface">2K+</p>
                    <p className="text-xs text-on-surface-variant">Students</p>
                  </div> */}
                  <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                    <span className="material-symbols-outlined text-violet-600 text-[28px] mb-2" style={{ fontVariationSettings: '"FILL" 1' }}>school</span>
                    <p className="text-2xl font-bold text-on-surface">8+</p>
                    <p className="text-xs text-on-surface-variant">Mentors</p>
                  </div>
                </div>

                {/* Course preview cards */}
                <div className="space-y-3">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-4 hover:bg-slate-100/80 transition-colors">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-600/5 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-amber-600" style={{ fontVariationSettings: '"FILL" 1' }}>architecture</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-on-surface text-sm">Civil Engineering</p>
                      <p className="text-xs text-on-surface-variant">AutoCAD, Revit, Staad Pro, .etc</p>
                    </div>
                    {/* <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">Hot</span> */}
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-4 hover:bg-slate-100/80 transition-colors">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/5 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: '"FILL" 1' }}>settings</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-on-surface text-sm">Mechanical Engineering</p>
                      <p className="text-xs text-on-surface-variant">SolidWorks, GD&T, CNC, .etc</p>
                    </div>
                    {/* <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">New</span> */}
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-4 hover:bg-slate-100/80 transition-colors">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-emerald-600" style={{ fontVariationSettings: '"FILL" 1' }}>electrical_services</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-on-surface text-sm">Electrical & Electronics</p>
                      <p className="text-xs text-on-surface-variant">PLC, SCADA, Solar, VFD, .etc</p>
                    </div>
                    {/* <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2 py-1 rounded">Trending</span> */}
                  </div>
                </div>
              </div>

              {/* Floating notification card (static) */}
              {/* <div className="absolute -bottom-4 -left-4 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-border-subtle shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-emerald-600 text-[20px]" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">New Placement!</p>
                    <p className="text-[10px] text-on-surface-variant">Rahul placed at L&T</p>
                  </div>
                </div>
              </div> */}

              {/* Floating rating card (static) */}
              {/* <div className="absolute -top-3 -right-3 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-border-subtle shadow-xl">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500 text-[20px]" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                  <span className="text-sm font-bold text-on-surface">4.9</span>
                  <span className="text-[10px] text-on-surface-variant">(2.4K reviews)</span>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-surface to-transparent" />
    </section>
  )
}
