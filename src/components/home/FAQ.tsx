'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import SectionReveal from './SectionReveal'
import { supabase } from '@/lib/supabase/client'

interface FaqItem {
  id: string
  question: string
  answer: string
  display_order: number
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [faqItems, setFaqItems] = useState<FaqItem[]>([])

  useEffect(() => {
    async function fetchFaqs() {
      const { data } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true })
      if (data) setFaqItems(data)
    }
    fetchFaqs()
  }, [])

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
              <div key={item.id} className="faq-accordion-item">
                <button
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-surface-container-low/50 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:ring-inset"
                  onClick={() => toggle(idx)}
                  aria-expanded={openIndex === idx}
                  aria-controls={`faq-panel-${idx}`}
                  id={`faq-trigger-${idx}`}
                >
                  <span className="font-bold text-on-surface pr-4">{item.question}</span>
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
                    <p className="px-6 pb-6 text-body-md text-on-surface-variant leading-relaxed">{item.answer}</p>
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
