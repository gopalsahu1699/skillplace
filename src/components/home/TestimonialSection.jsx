'use client';

export default function TestimonialSection({ testimonials }) {
  const displayReview = (review) => {
    let clean = review.trim();
    if (clean.startsWith('\u201C') || clean.startsWith('\"')) {
      clean = clean.slice(1);
    }
    if (clean.endsWith('\u201D') || clean.endsWith('\"')) {
      clean = clean.slice(0, -1);
    }
    return `\u201C${clean}\u201D`;
  };

  return (
    <section className="py-section-gap bg-surface text-on-surface overflow-hidden relative border-b border-border-subtle/40">
      <div className="relative px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center mb-16">
        <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">What Our Students Say</h2>
        <p className="font-body-md text-on-surface-variant">Hear from students who transformed their careers at SkillPlace Academy</p>
      </div>
      <div
        className="relative px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory gap-6 pb-6"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {testimonials.map((t) => (
          <div className="bg-white p-8 rounded-2xl border border-border-subtle hover:border-secondary/30 transition-all flex flex-col justify-between min-w-[80vw] sm:min-w-[50vw] md:min-w-0 snap-center snap-always card-shadow" key={t.id}>
            <div>
              <div className="flex items-center gap-1.5 bg-amber-500/5 border border-amber-500/20 px-3 py-1 rounded-full w-fit mb-6 shadow-sm">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < (t.rating || 5)
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-amber-300/40 fill-none stroke-amber-500/40'
                      }`}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs font-bold text-amber-700 ml-1">{(t.rating || 5).toFixed(1)}</span>
              </div>
              <p className="font-body-lg text-body-lg mb-10 max-w-2xl text-on-surface-variant">{displayReview(t.review)}</p>
            </div>
            <div className="flex items-center gap-4 mt-auto">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center font-bold text-secondary uppercase">
                {t.student_name ? t.student_name[0] : 'S'}
              </div>
              <div>
                <p className="font-bold text-on-surface">{t.student_name}</p>
                <p className="text-caption uppercase text-on-surface-variant">{t.course_name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Swipe Cue */}
      <div className="flex md:hidden items-center justify-center gap-1.5 mt-2 text-caption text-on-surface-variant font-semibold relative z-10">
        <span className="material-symbols-outlined text-[16px] animate-pulse">swipe</span>
        <span>Swipe to see all reviews</span>
      </div>
    </section>
  );
}