'use client'

import { useState, useRef, FormEvent } from 'react'
import { motion } from 'framer-motion'

/* ── Gold-focus input ─────────────────────────── */
function GoldInput({
  type = 'text', name, placeholder, required = false, textarea = false,
}: {
  type?: string; name: string; placeholder: string; required?: boolean; textarea?: boolean
}) {
  const [focused, setFocused] = useState(false)
  const base = "w-full bg-transparent outline-none text-timberwolf placeholder-timberwolf/30 pb-2 pt-1 text-sm resize-none"
  const style = { fontFamily: 'var(--ff-nunito)' }

  return (
    <div className="relative mb-6">
      {textarea ? (
        <textarea
          name={name}
          placeholder={placeholder}
          required={required}
          rows={3}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={base}
          style={style}
        />
      ) : (
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={base}
          style={style}
        />
      )}
      {/* Bottom line: grey → gold on focus */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-timberwolf/20" />
      <motion.div
        className="absolute bottom-0 left-0 h-px bg-circuit-gold"
        animate={{ width: focused ? '100%' : '0%' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </div>
  )
}

/* ── Scroll-to-top button ─────────────────────── */
function ScrollTop() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="group flex flex-col items-center gap-1 text-timberwolf/40
                 hover:text-circuit-gold transition-colors duration-300"
    >
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M4 13L10 7L16 13" stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.div>
      <span
        className="text-[9px] tracking-[0.3em] uppercase"
        style={{ fontFamily: 'var(--ff-mono)' }}
      >
        Top
      </span>
    </button>
  )
}

export default function Footer() {
  const formRef = useRef<HTMLFormElement>(null)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    const form = formRef.current
    if (!form) return
    const data = Object.fromEntries(new FormData(form))

    try {
      const res = await fetch('https://sasikanth-elcs.onrender.com/api/contact/send-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      setStatus('sent')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  const SOCIALS = [
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/company/embedded-labs-and-control-systems/?viewAsMember=true',
    },
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/elcs_electronics?igsh=MWFmdWpjMW9odnV0OA',
    },
    {
      label: 'YouTube',
      href: '#',
    },
  ]

  return (
    <footer className="bg-anthracite border-t border-white/[0.06]">

      {/* ── Top tier ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 px-8 md:px-16 py-20">

        {/* Left: logo + tagline */}
        <motion.div
          className="flex flex-col gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden ring-1 ring-circuit-gold/40">
              <img
                src="/images/ELCS_final_logo.png"
                alt="ELCS"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p
                className="text-timberwolf font-bold text-lg tracking-wider"
                style={{ fontFamily: 'var(--ff-outfit)' }}
              >
                ELCS
              </p>
              <p
                className="text-timberwolf/40 text-[10px] tracking-[0.25em] uppercase"
                style={{ fontFamily: 'var(--ff-mono)' }}
              >
                Embedded Labs & Control Systems
              </p>
            </div>
          </div>

          <p
            className="text-circuit-gold text-2xl md:text-3xl tracking-widest"
            style={{ fontFamily: 'var(--ff-mono)' }}
          >
            #ConnectTogether
          </p>

          <p
            className="text-timberwolf/50 text-sm leading-relaxed max-w-sm"
            style={{ fontFamily: 'var(--ff-caudex)' }}
          >
            Making advanced embedded technology accessible — so everyone can build
            smarter, safer, and more efficient systems.
          </p>
        </motion.div>

        {/* Right: contact form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <p
            className="text-[10px] tracking-[0.4em] text-circuit-gold uppercase mb-8"
            style={{ fontFamily: 'var(--ff-mono)' }}
          >
            Quick Message
          </p>

          {status === 'sent' ? (
            <p
              className="text-circuit-gold text-sm tracking-wider"
              style={{ fontFamily: 'var(--ff-mono)' }}
            >
              Message sent. We will be in touch.
            </p>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit}>
              <GoldInput name="name"    placeholder="Your Name"    required />
              <GoldInput name="email"   placeholder="Your Email"   type="email" required />
              <GoldInput name="message" placeholder="Your Message" textarea required />

              {status === 'error' && (
                <p
                  className="text-red-400/70 text-xs mb-4"
                  style={{ fontFamily: 'var(--ff-mono)' }}
                >
                  Failed to send. Try again.
                </p>
              )}

              {/* Capsule button — Timberwolf slides in on hover */}
              <div className="relative inline-block overflow-hidden rounded-full border border-timberwolf/30 group cursor-pointer">
                <motion.div
                  className="absolute inset-0 bg-timberwolf"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '0%' }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                />
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="relative z-10 px-8 py-3 text-xs tracking-[0.3em] uppercase
                             text-timberwolf group-hover:text-anthracite
                             transition-colors duration-300"
                  style={{ fontFamily: 'var(--ff-mono)' }}
                >
                  {status === 'sending' ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>

      {/* ── Divider ───────────────────────────────── */}
      <div className="mx-8 md:mx-16 h-px bg-white/[0.06]" />

      {/* ── Bottom tier ──────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-8 md:px-16 py-12"
           style={{ fontFamily: 'var(--ff-mono)' }}>

        {/* Address */}
        <div className="flex flex-col gap-2">
          <p className="text-circuit-gold text-[9px] tracking-[0.4em] uppercase mb-3">Address</p>
          {['ELCS Pvt Ltd', 'Ambapuram — 6th Line', 'Vijayawada, AP 520012', 'India'].map(l => (
            <p key={l} className="text-timberwolf/50 text-[11px] tracking-wider">{l}</p>
          ))}
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-2">
          <p className="text-circuit-gold text-[9px] tracking-[0.4em] uppercase mb-3">Contact</p>
          {[
            { label: 'Email', val: 'elcs.1126.main@gmail.com' },
            { label: 'WhatsApp', val: '7382382685' },
            { label: 'Phone', val: '7382382685' },
          ].map(({ label, val }) => (
            <div key={label}>
              <span className="text-timberwolf/30 text-[10px] tracking-wider">{label} / </span>
              <span className="text-timberwolf/60 text-[11px] tracking-wider">{val}</span>
            </div>
          ))}
        </div>

        {/* Social */}
        <div className="flex flex-col gap-2">
          <p className="text-circuit-gold text-[9px] tracking-[0.4em] uppercase mb-3">Follow</p>
          {SOCIALS.map(s => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-timberwolf/50 text-[11px] tracking-wider
                         hover:text-circuit-gold transition-colors duration-200"
            >
              {s.label} ↗
            </a>
          ))}
        </div>

        {/* Scroll top + copyright */}
        <div className="flex flex-col justify-between">
          <ScrollTop />
          <p className="text-timberwolf/25 text-[10px] tracking-wider mt-8 md:mt-0">
            © {new Date().getFullYear()} ELCS Pvt Ltd.<br />All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  )
}
