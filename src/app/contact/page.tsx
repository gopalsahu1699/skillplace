'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Mail, Phone, MapPin, Send, User, MessageSquare } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: insertError } = await supabase.from('leads').insert({
      name,
      email,
      phone: phone || null,
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
    <div className="bg-slate-50 min-h-screen">
      <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 py-10 md:py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Contact Us</h1>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Send us a Message</h2>
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
                <div className="inline-flex h-16 w-16 bg-green-100 rounded-2xl items-center justify-center mb-5">
                  <Send className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-green-800 mb-2">Message Sent!</h3>
                <p className="text-green-700 mb-6">Thank you for contacting us. We&apos;ll get back to you within 24 hours.</p>
                <Button variant="outline" onClick={() => setSubmitted(false)} className="border-green-300 text-green-700 hover:bg-green-100">
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                <div>
                  <Label htmlFor="name" className="text-slate-700">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="text-slate-700">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone" className="text-slate-700">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="phone"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="message" className="text-slate-700">Message</Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Textarea
                      id="message"
                      placeholder="How can we help you?"
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>}
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Contact Information</h2>
            <div className="space-y-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-start gap-4 hover:shadow-md transition-all duration-300">
                <div className="h-11 w-11 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Email</h3>
                  <p className="text-sm text-slate-500">info@skillplace.com</p>
                  <p className="text-sm text-slate-500">admissions@skillplace.com</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-start gap-4 hover:shadow-md transition-all duration-300">
                <div className="h-11 w-11 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Phone / WhatsApp</h3>
                  <p className="text-sm text-slate-500">+91 7987814261</p>
                  <p className="text-sm text-slate-500">+91 8085782471</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-start gap-4 hover:shadow-md transition-all duration-300">
                <div className="h-11 w-11 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Address</h3>
                  <p className="text-sm text-slate-500">Bilaspur, Chhattisgarh</p>
                </div>
              </div>
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl h-52 border border-slate-200 shadow-sm">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117942.36109968412!2d82.08316104860012!3d22.08051787680785!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a280b13abdbdcbf%3A0xf635fb85d852a38a!2sBilaspur%2C%20Chhattisgarh!5e0!3m2!1sen!2sin!4v1719391000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
