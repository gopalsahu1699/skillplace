'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import SectionReveal from './SectionReveal'
import { supabase } from '@/lib/supabase/client'
import { isNetworkError, withRetry } from '@/lib/network'
import { useOnlineStatus } from '@/context/OnlineStatusContext'
import { WifiOff, RefreshCw } from 'lucide-react'

interface FaqItem {
  id: string
  question: string
  answer: string
  display_order: number
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [faqItems, setFaqItems] = useState<FaqItem[]>([])
  const [loading, setLoading] = useState(true)
  const [networkError, setNetworkError] = useState(false)
  const { isOnline } = useOnlineStatus()

  const fetchFaqs = async () => {
    setLoading(true)
    setNetworkError(false)

    const { data: response, error } = await withRetry(() =>
      supabase
        .from('faqs')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true })
        .limit(5)
    )

    let data = response?.data as FaqItem[] | undefined

    if (error) {
      if (isNetworkError(error)) {
        setNetworkError(true)
      }
      setLoading(false)
      return
    }

    if (!data || data.length === 0) {
      const { data: fallback } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true })
        .limit(5)
      data = fallback as FaqItem[] | undefined
    }

    if (data) setFaqItems(data)
    setLoading(false)
  }

  useEffect(() => {
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
          {networkError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-border-subtle">
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <WifiOff className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Unable to load FAQs</h3>
              <p className="text-sm text-slate-500 mb-6 max-w-sm">
                {isOnline ? 'Something went wrong. Please try again.' : 'You appear to be offline. Connect to the internet and retry.'}
              </p>
              <button
                onClick={fetchFaqs}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary text-white text-sm font-bold hover:bg-secondary/90 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-16 bg-white rounded-2xl border border-border-subtle">
              <div className="w-8 h-8 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin" />
            </div>
          ) : faqItems.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-border-subtle">
              <p className="text-slate-500">No FAQs available.</p>
            </div>
          ) : (
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
          )}
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
