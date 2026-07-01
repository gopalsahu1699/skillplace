'use client'

import { useState } from 'react'
import Link from 'next/link'
import SectionReveal from './SectionReveal'

const faqItems = [
  {
    q: 'Who can join SkillPlace Academy?',
    a: 'Anyone who wants to build a career in engineering — fresh graduates, diploma holders, working professionals looking to upskill, or students. No prior experience required for most programs.',
  },
  {
    q: 'Is prior experience required?',
    a: 'No. Our programs are designed for beginners and intermediate learners. We start with fundamentals and build up to advanced topics. All you need is dedication and a willingness to learn.',
  },
  {
    q: 'Will I receive a certificate?',
    a: 'Yes! Every program includes an industry-recognized certificate upon successful completion. Our certificates are valued by companies across India.',
  },
  {
    q: 'Is placement support available?',
    a: 'Absolutely. We provide 100% placement assistance including resume building, interview preparation, mock interviews, and direct connections with hiring partners.',
  },
  {
    q: 'What if I don\'t get placed?',
    a: 'We stand behind our training. Our placement team works actively with 50+ hiring partners. With a 87% placement rate, we are confident in our process. If you follow our guidance, you will get placed.',
  },
  {
    q: 'Can I pay in installments?',
    a: 'Yes! We offer flexible EMI options for all programs. You can split your fees into easy monthly installments. Contact our admissions team for details.',
  },
  {
    q: 'Are the classes online or offline?',
    a: 'We offer all three modes — 100% Offline (at our Bilaspur campus), 100% Online (live + recorded), and Hybrid (online lectures + weekend labs). Choose what fits your schedule.',
  },
  {
    q: 'How long are the programs?',
    a: 'Program durations range from 12 to 48 weeks depending on the discipline and depth. Most core engineering programs run 24-36 weeks with 3-4 sessions per week.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  function toggle(idx: number) {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface">
      <div className="max-w-3xl mx-auto">
        <SectionReveal className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-widest mb-4">
            FAQ
          </span>
          <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">
            Frequently Asked Questions
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Got questions? We&apos;ve got answers. If you don&apos;t find what you&apos;re looking for, reach out to us.
          </p>
        </SectionReveal>

        <SectionReveal>
          <div className="bg-white rounded-2xl border border-border-subtle overflow-hidden card-shadow" role="region" aria-label="Frequently asked questions">
            {faqItems.map((item, idx) => (
              <div key={idx} className="faq-accordion-item">
                <button
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-surface-container-low/50 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:ring-inset"
                  onClick={() => toggle(idx)}
                  aria-expanded={openIndex === idx}
                  aria-controls={`faq-panel-${idx}`}
                  id={`faq-trigger-${idx}`}
                >
                  <span className="font-bold text-on-surface pr-4">{item.q}</span>
                  <span
                    className={`material-symbols-outlined text-on-surface-variant flex-shrink-0 transition-transform duration-300 ${
                      openIndex === idx ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </button>
                <div
                  id={`faq-panel-${idx}`}
                  role="region"
                  aria-labelledby={`faq-trigger-${idx}`}
                  className="faq-accordion-content"
                  data-open={openIndex === idx}
                >
                  <div>
                    <p className="px-6 pb-6 text-body-md text-on-surface-variant leading-relaxed">{item.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionReveal>

        <SectionReveal>
          <div className="text-center mt-10 space-y-4">
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary-container text-on-primary-container font-bold text-label-md hover:bg-primary/10 transition-all group"
            >
              View All FAQs
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </Link>
            <p className="text-sm text-on-surface-variant">
              Still have questions?{' '}
              <Link href="/contact" className="text-secondary font-bold hover:underline">
                Talk to our team
              </Link>
            </p>
          </div>
        </SectionReveal>
      </div>
    </section>
  )
}
