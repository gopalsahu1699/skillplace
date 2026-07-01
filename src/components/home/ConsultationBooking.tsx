'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { notify } from '@/lib/notifications'
import PhoneInput from '@/components/ui/phone-input'
import { sanitizePhone } from '@/lib/validation/phone'

export default function ConsultationBooking() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [branch, setBranch] = useState('civil')
  const [timeSlot, setTimeSlot] = useState('morning')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const sanitized = sanitizePhone(phone)
    const details = `
--- Consultation Booking Request ---
Engineering Branch: ${branch.toUpperCase()}
Preferred Counseling Time: ${timeSlot.toUpperCase()} (Morning: 10AM-12PM, Afternoon: 2PM-5PM, Evening: 6PM-8PM)
    `.trim()

    try {
      const { error: insertError } = await supabase.from('leads').insert({
        name,
        email,
        phone: sanitized,
        message: details,
        source: 'consultation_booking'
      })

      if (insertError) {
        throw new Error(insertError.message)
      }

      setSubmitted(true)
      if (typeof window !== 'undefined') {
        notify.registerSuccess()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to schedule consultation. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-primary-container text-white overflow-hidden relative scroll-mt-20" id="free-counseling">
      {/* Decorative background shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-container-max mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Info Grid */}
          <div className="lg:col-span-6 space-y-8">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/20 border border-secondary/30 backdrop-blur-sm text-secondary-fixed text-caption font-bold uppercase tracking-wider mb-4 text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                1-on-1 Guidance
              </span>
              <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg font-bold text-white mb-6 leading-tight">
                Book a Free 1-on-1 Career Consultation Call
              </h2>
              <p className="text-body-lg text-blue-100/80 leading-relaxed">
                Confused about your core career options? Speak directly with our experienced engineering mentors. We will help you draft a roadmap tailored to your specific engineering goals.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: 'schedule', title: '30-Minute Video/Phone Call', desc: 'Direct, focused session answering all your queries.' },
                { icon: 'map', title: 'Custom Career Roadmap', desc: 'Step-by-step guideline on which software and skills to learn first.' },
                { icon: 'payments', title: 'Job Market & Salary Insights', desc: 'Real statistics on active core hiring in Bilaspur and PAN India.' },
                { icon: 'reviews', title: 'Resume & Project Review', desc: 'Get actionable suggestions to optimize your current CV.' },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-cyan-300 shrink-0 border border-white/5">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: '"FILL" 1' }}>{item.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{item.title}</h4>
                    <p className="text-caption text-blue-100/70 mt-0.5 leading-normal">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Lead Capture Card */}
          <div className="lg:col-span-6">
            <div className="bg-white text-on-surface rounded-3xl p-6 md:p-10 card-shadow border border-border-subtle">
              {submitted ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-success-green/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-success-green text-4xl" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                  </div>
                  <h3 className="text-headline-md font-bold text-success-green mb-2">Consultation Requested!</h3>
                  <p className="text-body-md text-on-surface-variant mb-6">
                    Thank you, <strong>{name}</strong>. Your counseling slot has been registered.
                  </p>
                  <p className="text-caption text-on-surface-variant bg-surface-container p-4 rounded-xl border border-border-subtle text-left leading-relaxed">
                    Our admissions officer will call you to confirm your exact session time for the <strong>{timeSlot}</strong> slot. Keep your phone handy!
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 border-2 border-secondary text-secondary px-8 py-3 rounded-xl font-bold text-sm hover:bg-secondary hover:text-white transition-colors"
                  >
                    Book Another Slot
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h3 className="font-headline-md text-headline-md text-primary mb-2">Schedule Your Session</h3>
                    <p className="text-caption text-on-surface-variant">Fill in your contact details and branch to lock your free call.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="booking_name" className="block text-caption text-on-surface-variant font-semibold mb-1">Full Name</label>
                      <input
                        id="booking_name"
                        type="text"
                        placeholder="Enter your name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 bg-surface-light border border-border-subtle rounded-xl text-body-md input-focus-ring text-on-surface"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="booking_email" className="block text-caption text-on-surface-variant font-semibold mb-1">Email Address</label>
                        <input
                          id="booking_email"
                          type="email"
                          placeholder="name@example.com"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-surface-light border border-border-subtle rounded-xl text-body-md input-focus-ring text-on-surface"
                        />
                      </div>
                      <div>
                        <label htmlFor="booking_phone" className="block text-caption text-on-surface-variant font-semibold mb-1">Phone Number</label>
                        <PhoneInput
                          value={phone}
                          onChange={setPhone}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="booking_branch" className="block text-caption text-on-surface-variant font-semibold mb-1">Engineering Branch</label>
                        <select
                          id="booking_branch"
                          value={branch}
                          onChange={(e) => setBranch(e.target.value)}
                          className="w-full px-4 py-3 bg-surface-light border border-border-subtle rounded-xl text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
                        >
                          <option value="civil">Civil Engineering</option>
                          <option value="mechanical">Mechanical Engineering</option>
                          <option value="electrical">Electrical Engineering</option>
                          <option value="electronics">Electronics & Automation</option>
                          <option value="other">Other / Mixed</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="booking_slot" className="block text-caption text-on-surface-variant font-semibold mb-1">Preferred Time Slot</label>
                        <select
                          id="booking_slot"
                          value={timeSlot}
                          onChange={(e) => setTimeSlot(e.target.value)}
                          className="w-full px-4 py-3 bg-surface-light border border-border-subtle rounded-xl text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
                        >
                          <option value="morning">Morning (10:00 AM - 12:00 PM)</option>
                          <option value="afternoon">Afternoon (02:00 PM - 05:00 PM)</option>
                          <option value="evening">Evening (06:00 PM - 08:00 PM)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {error && <p className="text-caption text-error bg-error/10 p-2 rounded">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-secondary text-white py-4 rounded-xl font-bold hover:bg-secondary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-secondary/15"
                  >
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                        Scheduling Slot...
                      </>
                    ) : (
                      <>
                        Confirm Consultation Booking
                        <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
