'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

const COUNTRY_CODES = [
  { code: '+91', country: 'IN', label: '+91' },
  { code: '+1', country: 'US', label: '+1' },
  { code: '+44', country: 'UK', label: '+44' },
  { code: '+61', country: 'AU', label: '+61' },
  { code: '+971', country: 'AE', label: '+971' },
  { code: '+65', country: 'SG', label: '+65' },
  { code: '+86', country: 'CN', label: '+86' },
  { code: '+81', country: 'JP', label: '+81' },
  { code: '+82', country: 'KR', label: '+82' },
  { code: '+49', country: 'DE', label: '+49' },
  { code: '+33', country: 'FR', label: '+33' },
  { code: '+966', country: 'SA', label: '+966' },
  { code: '+974', country: 'QA', label: '+974' },
  { code: '+973', country: 'BH', label: '+973' },
  { code: '+968', country: 'OM', label: '+968' },
  { code: '+965', country: 'KW', label: '+965' },
]

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneCode, setPhoneCode] = useState('+91')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [message, setMessage] = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const fullPhone = phoneNumber ? `${phoneCode}${phoneNumber.replace(/[\s\-()]/g, '')}` : null

    const { error: insertError } = await supabase.from('leads').insert({
      name,
      email,
      phone: fullPhone,
      message,
      source: 'website',
    })

    if (insertError) {
      setError('Failed to send message. Please try again.')
      setLoading(false)
      return
    }

    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div className="bg-background text-on-surface font-body-md overflow-x-hidden">

      {/* Hero Section — dot-pattern background */}
      <section
        className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24 px-margin-mobile md:px-margin-desktop text-center"
        style={{
          backgroundColor: '#f8f9ff',
          backgroundImage: 'radial-gradient(#d3e4fe 0.5px, transparent 0.5px)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary opacity-5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-12 -left-24 w-64 h-64 bg-primary-fixed opacity-10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-container-max mx-auto relative z-10">
          <span className="inline-block py-1 px-3 bg-secondary-fixed text-on-secondary font-label-md text-[12px] rounded-full mb-6 tracking-wider uppercase">
            Support Center
          </span>
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary-container mb-6">
            Get In Touch
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Have questions about our programs? We&apos;re here to help you start your engineering career with industry-aligned precision and academic excellence.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-section-gap">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-start">

          {/* Left Column: Form */}
          <div className="bg-surface-container-lowest p-8 md:p-12 rounded-xl border border-border-subtle shadow-soft">
            <h2 className="font-headline-lg text-headline-lg text-primary-container mb-2">Send us a Message</h2>
            <p className="font-body-md text-on-surface-variant mb-10">
              Fill out the form below and our admissions team will get back to you within 24 hours.
            </p>

            {submitted ? (
              <div className="bg-success-green/5 border border-success-green/30 rounded-xl p-10 text-center">
                <div className="w-16 h-16 bg-success-green/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <span className="material-symbols-outlined text-success-green text-4xl" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-success-green mb-2">Message Sent!</h3>
                <p className="text-on-surface-variant mb-8">Thank you for contacting us. We&apos;ll get back to you within 24 hours.</p>
                <button
                  onClick={() => { setSubmitted(false); setName(''); setEmail(''); setPhoneCode('+91'); setPhoneNumber(''); setMessage('') }}
                  className="border-2 border-secondary text-secondary px-8 py-3 rounded-lg font-label-md hover:bg-secondary hover:text-on-primary transition-all"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="full_name"
                      className={`font-label-md text-label-md transition-colors ${focusedField === 'name' ? 'text-secondary' : 'text-on-surface-variant'}`}
                    >
                      Full Name
                    </label>
                    <input
                      id="full_name"
                      type="text"
                      placeholder="John Doe"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full px-4 py-3 border border-border-subtle rounded-lg font-body-md bg-surface-light input-focus-ring transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="email"
                      className={`font-label-md text-label-md transition-colors ${focusedField === 'email' ? 'text-secondary' : 'text-on-surface-variant'}`}
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full px-4 py-3 border border-border-subtle rounded-lg font-body-md bg-surface-light input-focus-ring transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="phone"
                    className={`font-label-md text-label-md transition-colors ${focusedField === 'phone' ? 'text-secondary' : 'text-on-surface-variant'}`}
                  >
                    Phone Number
                  </label>
                  <div className="flex">
                    <select
                      value={phoneCode}
                      onChange={(e) => setPhoneCode(e.target.value)}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-border-subtle bg-surface-container text-on-surface-variant font-label-md focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="98765 43210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      className="flex-1 px-4 py-3 border border-border-subtle rounded-r-lg font-body-md bg-surface-light input-focus-ring transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="message"
                    className={`font-label-md text-label-md transition-colors ${focusedField === 'message' ? 'text-secondary' : 'text-on-surface-variant'}`}
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    placeholder="How can we help you?"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onFocus={() => setFocusedField('message')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full px-4 py-3 border border-border-subtle rounded-lg font-body-md bg-surface-light input-focus-ring resize-none transition-all"
                  />
                </div>

                {error && (
                  <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto bg-primary-container text-on-primary px-10 py-4 rounded-lg font-bold text-headline-md hover:scale-[0.98] transition-transform duration-200 flex items-center justify-center gap-3 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                      Sending…
                    </>
                  ) : (
                    <>
                      Send Message
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: '"wght" 600' }}>send</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Info */}
          <div className="lg:pl-12 space-y-12">

            {/* Contact Cards */}
            <div className="space-y-8">
              {/* Email */}
              <div className="flex gap-6 group">
                <div className="w-14 h-14 bg-surface-container rounded-lg flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-colors duration-300 shrink-0">
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: '"FILL" 1' }}>mail</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-primary-container mb-2">Email</h3>
                  <p className="font-body-md text-on-surface-variant leading-relaxed">
                    <a href="mailto:info@skillplace.com" className="hover:text-secondary transition-colors">info@skillplace.com</a><br />
                    <a href="mailto:admissions@skillplace.com" className="hover:text-secondary transition-colors">admissions@skillplace.com</a>
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-6 group">
                <div className="w-14 h-14 bg-surface-container rounded-lg flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-colors duration-300 shrink-0">
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: '"FILL" 1' }}>call</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-primary-container mb-2">Phone / WhatsApp</h3>
                  <p className="font-body-md text-on-surface-variant leading-relaxed">
                    <a href="tel:+917987814261" className="hover:text-secondary transition-colors">+91 79878 14261</a><br />
                    <a href="tel:+918085782471" className="hover:text-secondary transition-colors">+91 80857 82471</a>
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="flex gap-6 group">
                <div className="w-14 h-14 bg-surface-container rounded-lg flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-colors duration-300 shrink-0">
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: '"FILL" 1' }}>location_on</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-primary-container mb-2">Address</h3>
                  <p className="font-body-md text-on-surface-variant leading-relaxed">
                    Bilaspur, Chhattisgarh, India<br />
                    <span className="text-[12px] font-medium uppercase tracking-widest text-on-surface-variant opacity-70">Main Campus</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Map Card */}
            <div className="rounded-xl overflow-hidden border border-border-subtle shadow-soft bg-surface-container">
              <div className="p-6 bg-surface-container-lowest flex justify-between items-center border-b border-border-subtle">
                <div>
                  <h4 className="font-headline-md text-headline-md text-primary-container">Visit Our Office</h4>
                  <p className="text-[12px] text-on-surface-variant">Bilaspur, Chhattisgarh</p>
                </div>
                <a
                  href="https://maps.google.com/?q=Bilaspur,Chhattisgarh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-secondary text-on-secondary px-4 py-2 rounded-lg font-label-md text-label-md hover:bg-secondary/90 transition-all"
                >
                  Get Directions
                </a>
              </div>
              <div className="h-64 relative bg-surface-container-highest group">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117942.36109968412!2d82.08316104860012!3d22.08051787680785!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a280b13abdbdcbf%3A0xf635fb85d852a38a!2sBilaspur%2C%20Chhattisgarh!5e0!3m2!1sen!2sin!4v1719391000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-white shadow-xl animate-bounce">
                    <span className="material-symbols-outlined">school</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-container text-on-primary py-24 px-margin-mobile md:px-margin-desktop text-center relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-secondary/10 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 border-[32px] border-white/5 rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="max-w-container-max mx-auto relative z-10">
          <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg mb-6">Ready to Start Your Career?</h2>
          <p className="font-body-lg text-body-lg text-on-primary-container max-w-2xl mx-auto mb-10 opacity-90">
            Join hundreds of successful alumni. Our advisors are ready to help you choose the right path for your technical future.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/programs"
              className="bg-secondary-container text-on-secondary px-10 py-4 rounded-lg font-bold text-headline-md hover:shadow-lg transition-all"
            >
              View Programs
            </Link>
            <Link
              href="/courses"
              className="border-2 border-on-primary-container text-on-primary-container px-10 py-4 rounded-lg font-bold text-headline-md hover:bg-on-primary-container hover:text-primary-container transition-all"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
