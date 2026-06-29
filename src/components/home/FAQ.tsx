'use client'

import { useState } from 'react'
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
    q: 'Are classes online or offline?',
    a: 'We offer both. Choose the format that works best for you — online for flexibility, offline for hands-on lab access, or hybrid for the best of both worlds.',
  },
  {
    q: 'Do you provide career guidance?',
    a: 'Yes, career guidance is part of our core offering. From career planning to LinkedIn optimization, freelancing guidance to startup mentorship — we cover it all.',
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
          <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">
            Frequently Asked Questions
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Got questions? We've got answers. If you don't find what you're looking for, reach out to us.
          </p>
        </SectionReveal>

        <SectionReveal>
          <div className="bg-white rounded-2xl border border-border-subtle overflow-hidden card-shadow" role="region" aria-label="Frequently asked questions">
            {faqItems.map((item, idx) => (
              <div key={idx} className="faq-accordion-item">
                <button
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-surface-container-low transition-colors focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:ring-inset"
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
                    <p className="px-6 pb-6 text-body-md text-on-surface-variant">{item.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionReveal>
      </div>
    </section>
  )
}
