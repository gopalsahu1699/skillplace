'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { notify } from '@/lib/notifications'
import PhoneInput from '@/components/ui/phone-input'
import { getFullPhone } from '@/lib/validation/phone'

interface QuizAnswers {
  status: string
  branch: string
  goal: string
  mode: string
}

export default function CareerPathQuiz() {
  const [step, setStep] = useState<number>(1)
  const [answers, setAnswers] = useState<QuizAnswers>({
    status: '',
    branch: '',
    goal: '',
    mode: '',
  })
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneCode, setPhoneCode] = useState('+91')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSelect = (key: keyof QuizAnswers, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
    // Automatically advance steps for single-choice screens
    setTimeout(() => {
      setStep((prev) => prev + 1)
    }, 200)
  }

  const getRecommendation = () => {
    const { branch, mode } = answers
    const modeStr = mode === 'offline' ? 'Offline Bootcamp' : mode === 'hybrid' ? 'Hybrid Training' : 'Online Certification'
    
    switch (branch) {
      case 'civil':
        return {
          title: `Civil Engineering - ${modeStr}`,
          desc: 'A comprehensive curriculum focused on AutoCAD, Revit, Quantity Estimation, and Site Execution with 100% placement support.',
          img: '/images/course-civil-engineering.jpg',
          skills: ['AutoCAD 2D/3D', 'Revit Architecture', 'Staad Pro', 'Quantity Surveying', 'BOQ & Billing'],
          salary: '₹3.5L - ₹6L per annum'
        }
      case 'mechanical':
        return {
          title: `Mechanical Engineering Design - ${modeStr}`,
          desc: 'Master SolidWorks, GD&T, and CNC programming. Specially designed for students aiming for core R&D and manufacturing jobs.',
          img: '/images/course-mechanical-engineering.jpg',
          skills: ['SolidWorks CAD', 'GD&T (Geometric Dimensioning & Tolerancing)', 'Production Drawings', 'CNC Basics'],
          salary: '₹3.6L - ₹6.5L per annum'
        }
      case 'electrical':
        return {
          title: `Electrical Systems Design - ${modeStr}`,
          desc: 'Learn LT/HT Panel Designing, Substation layouts, Solar design, and basic PLC automation for modern utility grid industries.',
          img: '/images/course-civil-fallback.jpg', // Fallback or utility
          skills: ['LT/HT Cable Sizing', 'AutoCAD Electrical', 'Panel Designing', 'Solar PV Design', 'Earthing Calculation'],
          salary: '₹3.2L - ₹5.8L per annum'
        }
      case 'electronics':
        return {
          title: `Industrial Automation & ECE - ${modeStr}`,
          desc: 'Specialized program on PLCs (Siemens, Delta), SCADA, HMI, VFD, and Industrial Sensors. Critical for manufacturing/process industries.',
          img: '/images/course-electronics-automation.jpg',
          skills: ['PLC Ladder Programming', 'SCADA & HMI Design', 'VFD & Motor Control', 'Sensor Integration', 'Industrial IoT'],
          salary: '₹4.0L - ₹7.2L per annum'
        }
      default:
        return {
          title: `Master Engineering Core - ${modeStr}`,
          desc: 'Explore various job-oriented training courses under our premium placement programs.',
          img: '/images/home-engineering-students.jpg',
          skills: ['Industry Software Tools', 'Practical Lab Work', 'Resume and Interview Prep', '100% Placements Support'],
          salary: '₹3L - ₹6L per annum'
        }
    }
  }

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const rec = getRecommendation()
    const quizSummary = `
--- Career Quiz Results ---
Current Status: ${answers.status}
Preferred Branch: ${answers.branch}
Main Career Goal: ${answers.goal}
Preferred Learning Mode: ${answers.mode}
Recommended Program: ${rec.title}
    `.trim()

    const fullPhone = getFullPhone(phoneCode, phone)

    try {
      const { error: insertError } = await supabase.from('leads').insert({
        name,
        email,
        phone: fullPhone,
        message: quizSummary,
        source: 'quiz_path_finder'
      })

      if (insertError) {
        throw new Error(insertError.message)
      }

      setSubmitted(true)
      if (typeof window !== 'undefined') {
        notify.registerSuccess()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const rec = getRecommendation()

  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container-low scroll-mt-20" id="path-finder-quiz">
      <div className="max-w-4xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-widest mb-4">
            Interactive Path Finder
          </span>
          <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-3">
            Find Your Ideal Engineering Career Path
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Take our 2-minute quiz to analyze your background and match with the highest-paying courses and placements in Bilaspur.
          </p>
        </div>

        {/* Quiz Box */}
        <div className="bg-white rounded-3xl border border-border-subtle p-6 md:p-10 card-shadow relative overflow-hidden min-h-[400px] flex flex-col justify-between">
          
          {/* Progress Indicator */}
          {step <= 4 && (
            <div className="mb-8">
              <div className="flex justify-between items-center text-caption text-on-surface-variant mb-2 font-semibold">
                <span>Question {step} of 4</span>
                <span>{Math.round(((step - 1) / 4) * 100)}% Completed</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-secondary h-full transition-all duration-300"
                  style={{ width: `${Math.max(8, ((step - 1) / 4) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* STEP 1: Current Status */}
          {step === 1 && (
            <div className="animate-count-up">
              <h3 className="text-headline-md font-bold text-primary mb-6">What is your current educational or job status?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'student', label: 'College Student', desc: 'Currently pursuing B.E / B.Tech / Diploma', icon: 'school' },
                  { id: 'graduate', label: 'Recent Graduate', desc: 'Finished studies, looking for core engineering jobs', icon: 'workspace_premium' },
                  { id: 'professional', label: 'Working Professional', desc: 'Seeking upskilling or field shift', icon: 'badge' },
                  { id: 'other', label: 'Other Background', desc: 'IT/Non-engineering interested in core skills', icon: 'diversity_3' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect('status', item.label)}
                    className="flex items-start gap-4 p-5 rounded-2xl border border-border-subtle hover:border-secondary hover:bg-secondary/5 text-left transition-all group"
                  >
                    <span className="material-symbols-outlined text-secondary text-3xl group-hover:scale-110 transition-transform">{item.icon}</span>
                    <div>
                      <p className="font-bold text-on-surface text-base group-hover:text-secondary transition-colors">{item.label}</p>
                      <p className="text-caption text-on-surface-variant mt-1 leading-normal">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Branch of Interest */}
          {step === 2 && (
            <div className="animate-count-up">
              <h3 className="text-headline-md font-bold text-primary mb-6">Which engineering branch or sector interests you most?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'civil', label: 'Civil & Construction', desc: 'AutoCAD, Revit, Estimating, Structure design', image: '/images/course-civil-engineering.jpg' },
                  { id: 'mechanical', label: 'Mechanical & Product Design', desc: 'SolidWorks, GD&T, R&D, Manufacturing design', image: '/images/course-mechanical-engineering.jpg' },
                  { id: 'electrical', label: 'Electrical Systems & Panels', desc: 'LT/HT Systems, AutoCAD Electrical, Substation design', image: '/images/courses-hero-bg.jpg' },
                  { id: 'electronics', label: 'Electronics & Automation', desc: 'PLC Coding, SCADA, HMIs, Sensors, Industrial VFD', image: '/images/course-electronics-automation.jpg' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect('branch', item.id)}
                    className="flex flex-col rounded-2xl border border-border-subtle hover:border-secondary hover:bg-secondary/5 text-left transition-all overflow-hidden group"
                  >
                    <div className="h-28 w-full overflow-hidden relative">
                      <img src={item.image} alt={item.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-primary/20" />
                    </div>
                    <div className="p-4">
                      <p className="font-bold text-on-surface text-base group-hover:text-secondary transition-colors">{item.label}</p>
                      <p className="text-caption text-on-surface-variant mt-1 leading-normal">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setStep(1)} 
                className="mt-6 inline-flex items-center gap-1 text-caption text-secondary font-bold hover:underline"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back
              </button>
            </div>
          )}

          {/* STEP 3: Primary Goal */}
          {step === 3 && (
            <div className="animate-count-up">
              <h3 className="text-headline-md font-bold text-primary mb-6">What is your primary career goal right now?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'placement', label: 'Get Placed in Core Company', desc: 'Need 100% job assistance & core industry placements', icon: 'work' },
                  { id: 'software', label: 'Master Specific Industry Software', desc: 'AutoCAD, SolidWorks, Revit, PLC programming training', icon: 'computer' },
                  { id: 'practical', label: 'Gain Hands-on Lab Experience', desc: 'Looking for physical machinery, panels, and equipment work', icon: 'handyman' },
                  { id: 'career', label: 'Interview & Resume Prep', desc: 'Mock interviews, profile optimizer, soft skills building', icon: 'record_voice_over' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect('goal', item.label)}
                    className="flex items-start gap-4 p-5 rounded-2xl border border-border-subtle hover:border-secondary hover:bg-secondary/5 text-left transition-all group"
                  >
                    <span className="material-symbols-outlined text-secondary text-3xl group-hover:scale-110 transition-transform">{item.icon}</span>
                    <div>
                      <p className="font-bold text-on-surface text-base group-hover:text-secondary transition-colors">{item.label}</p>
                      <p className="text-caption text-on-surface-variant mt-1 leading-normal">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setStep(2)} 
                className="mt-6 inline-flex items-center gap-1 text-caption text-secondary font-bold hover:underline"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back
              </button>
            </div>
          )}

          {/* STEP 4: Learning Mode */}
          {step === 4 && (
            <div className="animate-count-up">
              <h3 className="text-headline-md font-bold text-primary mb-6">Which training format fits your schedule best?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'offline', label: '100% Offline Bootcamp', desc: 'Daily physical lectures & lab work at Bilaspur campus. Highly recommended for placements.', icon: 'apartment' },
                  { id: 'online', label: '100% Online Classes', desc: 'Live + recorded batches, online doubt solving, learn from anywhere.', icon: 'cell_tower' },
                  { id: 'hybrid', label: 'Hybrid Mode', desc: 'Weekly online lectures + Saturday/Sunday physical labs & site visits.', icon: 'sync' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect('mode', item.id)}
                    className="flex flex-col p-5 rounded-2xl border border-border-subtle hover:border-secondary hover:bg-secondary/5 text-left transition-all group"
                  >
                    <span className="material-symbols-outlined text-secondary text-3xl mb-3 group-hover:scale-110 transition-transform">{item.icon}</span>
                    <p className="font-bold text-on-surface text-base group-hover:text-secondary transition-colors mb-1">{item.label}</p>
                    <p className="text-caption text-on-surface-variant leading-relaxed">{item.desc}</p>
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setStep(3)} 
                className="mt-6 inline-flex items-center gap-1 text-caption text-secondary font-bold hover:underline"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back
              </button>
            </div>
          )}

          {/* STEP 5: Recommendation + Lead Capture */}
          {step === 5 && !submitted && (
            <div className="animate-count-up grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Recommended Course Info */}
              <div className="lg:col-span-6 space-y-4">
                <span className="inline-block bg-success-green/10 text-success-green px-3 py-1 rounded-full text-caption font-bold tracking-wide uppercase">
                  Matching Recommendation Found!
                </span>
                <h3 className="text-headline-lg text-primary font-bold leading-tight">{rec.title}</h3>
                <p className="text-body-md text-on-surface-variant leading-relaxed">{rec.desc}</p>
                
                <div className="bg-surface-container rounded-xl p-4 border border-border-subtle">
                  <p className="text-caption text-on-surface-variant font-bold uppercase mb-2">Key Skills You Will Master:</p>
                  <div className="flex flex-wrap gap-2">
                    {rec.skills.map((skill, i) => (
                      <span key={i} className="bg-white px-2.5 py-1 rounded-lg text-caption font-semibold border border-border-subtle shadow-sm flex items-center gap-1.5 text-on-surface-variant">
                        <span className="w-1.5 h-1.5 bg-secondary rounded-full" /> {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-primary font-bold">
                  <span className="material-symbols-outlined text-secondary">payments</span>
                  <span>Average Starting Salary: <strong className="text-secondary">{rec.salary}</strong></span>
                </div>
              </div>

              {/* Lead Form */}
              <div className="lg:col-span-6 bg-surface-container p-6 rounded-2xl border border-border-subtle">
                <h4 className="font-headline-md text-headline-md text-primary mb-2">Unlock Syllabus & Career Call</h4>
                <p className="text-caption text-on-surface-variant mb-4 leading-normal">
                  Enter your details to download the complete {rec.title} curriculum PDF and schedule a free guidance call with our advisor.
                </p>

                <form onSubmit={handleSubmitLead} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Your Full Name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-border-subtle rounded-xl text-body-md input-focus-ring"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Your Email Address"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-border-subtle rounded-xl text-body-md input-focus-ring"
                    />
                  </div>
                  <PhoneInput
                    phoneCode={phoneCode}
                    phoneNumber={phone}
                    onPhoneCodeChange={setPhoneCode}
                    onPhoneNumberChange={setPhone}
                    required
                  />

                  {error && <p className="text-caption text-error bg-error/10 p-2 rounded">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-secondary text-white py-3 rounded-xl font-bold hover:bg-secondary/90 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                        Generating Path...
                      </>
                    ) : (
                      <>
                        Unlock Syllabus & Recommended Path
                        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* STEP 6: Success Message */}
          {submitted && (
            <div className="animate-count-up text-center py-10 max-w-md mx-auto">
              <div className="w-20 h-20 bg-success-green/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-success-green text-5xl animate-bounce" style={{ fontVariationSettings: '"FILL" 1' }}>
                  check_circle
                </span>
              </div>
              <h3 className="text-headline-lg font-bold text-success-green mb-2">Congratulations, {name.split(' ')[0]}!</h3>
              <p className="text-body-md text-on-surface-variant mb-6">
                Your path for <strong>{rec.title}</strong> has been unlocked. We have logged your request.
              </p>
              
              <div className="bg-surface-container rounded-2xl p-4 border border-border-subtle text-left mb-6">
                <div className="flex gap-3 items-start">
                  <span className="material-symbols-outlined text-secondary mt-0.5">phone_callback</span>
                  <div>
                    <p className="font-bold text-on-surface text-sm">Next Step: Free Counselor Call</p>
                    <p className="text-caption text-on-surface-variant leading-relaxed">
                      Our engineering career mentor will call you at <strong className="text-primary">{phoneCode} {phone}</strong> within 2 hours to walk through your study plan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="/programs"
                  className="flex-1 bg-secondary text-white py-3 rounded-xl font-bold text-sm text-center hover:bg-secondary/90 transition-colors shadow-lg shadow-secondary/15"
                >
                  Browse Recommended Programs
                </a>
                <button
                  onClick={() => {
                    setStep(1)
                    setSubmitted(false)
                    setName('')
                    setEmail('')
                    setPhone('')
                  }}
                  className="px-5 py-3 border border-border-subtle rounded-xl text-sm font-bold hover:bg-surface-container text-on-surface transition-colors"
                >
                  Restart Quiz
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  )
}
