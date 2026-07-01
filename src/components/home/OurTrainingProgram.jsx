'use client';
import Link from 'next/link';

const getProgramImage = (branchSlug) => {
  switch (branchSlug) {
    case 'civil':
      return 'https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/course-civil-engineering.jpg';
    case 'mechanical':
      return 'https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/course-mechanical-engineering.jpg';
    case 'electronics':
      return 'https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/course-electronics-automation.jpg';
    case 'electrical':
      return 'https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/course-civil-fallback.jpg';
    default:
      return 'https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/course-civil-engineering.jpg';
  }
};

const renderBadge = (type) => {
  switch (type) {
    case 'online':
      return (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
          <span className="text-caption font-bold text-secondary uppercase tracking-widest">Online</span>
        </div>
      );
    case 'offline':
      return (
        <div className="absolute top-4 right-4 bg-secondary text-white px-3 py-1 rounded-full shadow-sm">
          <span className="text-caption font-bold uppercase tracking-widest">Offline</span>
        </div>
      );
    case 'hybrid':
      return (
        <div className="absolute top-4 right-4 bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full shadow-sm">
          <span className="text-caption font-bold uppercase tracking-widest">Hybrid</span>
        </div>
      );
    default:
      return (
        <div className="absolute top-4 right-4 bg-secondary text-white px-3 py-1 rounded-full shadow-sm">
          <span className="text-caption font-bold uppercase tracking-widest">{type}</span>
        </div>
      );
  }
};

export default function OurTrainingProgram({ trainingPrograms }) {
  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto" id="programs">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div className="max-w-2xl">
          <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">Our Training Programs</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Choose the learning format that works best for you. Specialized curriculum tailored for mechanical, civil, and electrical engineers.</p>
        </div>
        <Link href="/programs" className="inline-flex items-center gap-2 text-secondary font-bold hover:underline">
          View All Programs
          <span className="material-symbols-outlined">chevron_right</span>
        </Link>
      </div>

      <div
        className="flex md:grid md:grid-cols-2 lg:grid-cols-3 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory gap-6 pb-6"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {trainingPrograms.length > 0 ? (
          trainingPrograms.slice(0, 6).map((p) => (
            <Link
              href={`/programs/${p.slug}`}
              key={p.id}
              className="group bg-white rounded-xl border border-border-subtle overflow-hidden card-shadow transition-all duration-300 flex flex-col h-full block min-w-[80vw] sm:min-w-[50vw] md:min-w-0 snap-center snap-always"
            >
              <div className="relative aspect-video">
                <img className="w-full h-full object-cover" alt={p.name} src={getProgramImage(p.branches?.slug)} />
                {renderBadge(p.program_type)}
              </div>
              <div className="p-6 flex flex-col justify-between flex-grow">
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-4 group-hover:text-secondary transition-colors line-clamp-2">{p.name}</h3>
                  <ul className="space-y-3 mb-8">
                    {(p.features || []).slice(0, 3).map((f, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-body-md text-on-surface-variant">
                        <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
                        <span className="line-clamp-1">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center justify-between border-t border-border-subtle pt-6 mt-auto">
                  <div>
                    <span className="block text-caption text-on-surface-variant uppercase font-semibold">Price</span>
                    <span className="text-headline-md font-bold text-primary">₹{p.price?.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-caption text-on-surface-variant uppercase font-semibold">Duration</span>
                    <span className="font-bold">{p.duration_weeks} weeks</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <>
            {/* Static Default Fallbacks */}
            <div className="group bg-white rounded-xl border border-border-subtle overflow-hidden card-shadow transition-all duration-300 min-w-[80vw] sm:min-w-[50vw] md:min-w-0 snap-center snap-always">
              <div className="relative aspect-video">
                <img className="w-full h-full object-cover" alt="Civil Engineering" src="https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/course-civil-engineering.jpg" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                  <span className="text-caption font-bold text-secondary uppercase tracking-widest">Online</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-4 group-hover:text-secondary transition-colors">Civil Engineering Online</h3>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-body-md text-on-surface-variant"><span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>Online Course Access</li>
                  <li className="flex items-center gap-3 text-body-md text-on-surface-variant"><span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>Doubt Sessions</li>
                  <li className="flex items-center gap-3 text-body-md text-on-surface-variant"><span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>Training Certificate</li>
                </ul>
                <div className="flex items-center justify-between border-t border-border-subtle pt-6">
                  <div><span className="block text-caption text-on-surface-variant uppercase font-semibold">Price</span><span className="text-headline-md font-bold text-primary">₹29,999</span></div>
                  <div className="text-right"><span className="block text-caption text-on-surface-variant uppercase font-semibold">Duration</span><span className="font-bold">24 weeks</span></div>
                </div>
              </div>
            </div>
            <div className="group bg-white rounded-xl border border-border-subtle overflow-hidden card-shadow transition-all duration-300 min-w-[80vw] sm:min-w-[50vw] md:min-w-0 snap-center snap-always">
              <div className="relative aspect-video">
                <img className="w-full h-full object-cover" alt="Mechanical Engineering" src="https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/course-mechanical-engineering.jpg" />
                <div className="absolute top-4 right-4 bg-secondary text-white px-3 py-1 rounded-full shadow-sm">
                  <span className="text-caption font-bold uppercase tracking-widest">Offline</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-4 group-hover:text-secondary transition-colors">Mechanical Engineering Offline</h3>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-body-md text-on-surface-variant"><span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>100% Job Assistance</li>
                  <li className="flex items-center gap-3 text-body-md text-on-surface-variant"><span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>Soft Skills Training</li>
                  <li className="flex items-center gap-3 text-body-md text-on-surface-variant"><span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>Hands-on Practical</li>
                </ul>
                <div className="flex items-center justify-between border-t border-border-subtle pt-6">
                  <div><span className="block text-caption text-on-surface-variant uppercase font-semibold">Price</span><span className="text-headline-md font-bold text-primary">₹44,999</span></div>
                  <div className="text-right"><span className="block text-caption text-on-surface-variant uppercase font-semibold">Duration</span><span className="font-bold">48 weeks</span></div>
                </div>
              </div>
            </div>
            <div className="group bg-white rounded-xl border border-border-subtle overflow-hidden card-shadow transition-all duration-300 min-w-[80vw] sm:min-w-[50vw] md:min-w-0 snap-center snap-always">
              <div className="relative aspect-video">
                <img className="w-full h-full object-cover" alt="Electronics & Automation" src="https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/course-electronics-automation.jpg" />
                <div className="absolute top-4 right-4 bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full shadow-sm">
                  <span className="text-caption font-bold uppercase tracking-widest">Hybrid</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-4 group-hover:text-secondary transition-colors">Electronics & Automation</h3>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-body-md text-on-surface-variant"><span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>PLC & SCADA Training</li>
                  <li className="flex items-center gap-3 text-body-md text-on-surface-variant"><span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>Industry Expert Mentorship</li>
                  <li className="flex items-center gap-3 text-body-md text-on-surface-variant"><span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>Site Visits</li>
                </ul>
                <div className="flex items-center justify-between border-t border-border-subtle pt-6">
                  <div><span className="block text-caption text-on-surface-variant uppercase font-semibold">Price</span><span className="text-headline-md font-bold text-primary">₹39,999</span></div>
                  <div className="text-right"><span className="block text-caption text-on-surface-variant uppercase font-semibold">Duration</span><span className="font-bold">36 weeks</span></div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile Swipe Cue */}
      <div className="flex md:hidden items-center justify-center gap-1.5 mt-2 text-caption text-on-surface-variant font-semibold">
        <span className="material-symbols-outlined text-[16px] animate-pulse">swipe</span>
        <span>Swipe to see all training programs</span>
      </div>
    </section>
  );
}