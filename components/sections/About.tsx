'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

/* ── PCB schematic grid SVG ───────────────────── */
function PCBGrid() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <pattern id="pcb-cell" x="0" y="0" width="44" height="44" patternUnits="userSpaceOnUse">
          {/* Grid lines */}
          <line x1="0" y1="0" x2="44" y2="0"  stroke="#7A5938" strokeWidth="0.4" opacity="0.5"/>
          <line x1="0" y1="0" x2="0"  y2="44" stroke="#7A5938" strokeWidth="0.4" opacity="0.5"/>
          {/* Corner pads */}
          <circle cx="0"  cy="0"  r="2"   fill="#7A5938" opacity="0.7"/>
          <circle cx="44" cy="0"  r="1.2" fill="#7A5938" opacity="0.4"/>
          <circle cx="0"  cy="44" r="1.2" fill="#7A5938" opacity="0.4"/>
          {/* PCB traces */}
          <line x1="0"  y1="12" x2="20" y2="12" stroke="#7A5938" strokeWidth="0.6" opacity="0.6"/>
          <line x1="20" y1="12" x2="20" y2="30" stroke="#7A5938" strokeWidth="0.6" opacity="0.6"/>
          <line x1="20" y1="30" x2="44" y2="30" stroke="#7A5938" strokeWidth="0.6" opacity="0.6"/>
          {/* Via circles */}
          <circle cx="20" cy="12" r="2.5" fill="none" stroke="#D4AF37" strokeWidth="0.6" opacity="0.5"/>
          <circle cx="20" cy="30" r="2.5" fill="none" stroke="#D4AF37" strokeWidth="0.6" opacity="0.5"/>
          {/* IC component outline */}
          <rect x="28" y="18" width="12" height="8" fill="none" stroke="#7A5938" strokeWidth="0.4" opacity="0.4"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#pcb-cell)" />
    </svg>
  )
}

/* ── Bento block wrapper ─────────────────────── */
function BentoBlock({
  children, className = '', delay = 0,
}: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`relative bg-anthracite/60 border border-white/[0.07] rounded-2xl overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  )
}

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = sectionRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    el.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  const CERTS = ['[IPC-DESIGN-RULES]', '[ROHS-COMPLIANT]', '[ESD-SAFE-PROCESS]', '[MULTI-LAYER-PCB]']
  const SUPPORTS = [
    { label: '3D Models',   desc: 'Complete .STEP files for every module' },
    { label: 'Schematics',  desc: 'Full circuit documentation & BOMs' },
    { label: 'Firmware',    desc: 'Reference firmware and HAL libraries' },
    { label: 'Datasheets',  desc: 'Comprehensive technical specifications' },
  ]

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative py-24 px-6 md:px-12 bg-anthracite overflow-hidden"
      style={{ '--mx': '-999px', '--my': '-999px' } as React.CSSProperties}
    >

      {/* ── PCB cursor-reveal layer ──────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          maskImage:         'radial-gradient(circle 200px at var(--mx) var(--my), black 20%, transparent 100%)',
          WebkitMaskImage:   'radial-gradient(circle 200px at var(--mx) var(--my), black 20%, transparent 100%)',
        }}
      >
        <PCBGrid />
      </div>

      {/* ── Section label ── */}
      <motion.p
        className="text-raw-umber text-[10px] tracking-[0.45em] uppercase mb-10"
        style={{ fontFamily: 'var(--ff-mono)' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        [01] — About ELCS
      </motion.p>

      {/* ── Bento Grid ───────────────────────────── */}
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto">

        {/* Block 1 — Mission prose · span 2 cols */}
        <BentoBlock className="md:col-span-2 p-10" delay={0.1}>
          <p
            className="text-[10px] tracking-[0.35em] text-circuit-gold mb-6 uppercase"
            style={{ fontFamily: 'var(--ff-mono)' }}
          >
            Mission Statement
          </p>
          <p
            className="text-timberwolf text-xl md:text-2xl leading-relaxed font-normal mb-6"
            style={{ fontFamily: 'var(--ff-caudex)' }}
          >
            At ELCS, we design and manufacture future-ready embedded modules,
            control systems, and connectivity devices built with precision and quality.
          </p>
          <p
            className="text-timberwolf/60 text-base leading-relaxed"
            style={{ fontFamily: 'var(--ff-caudex)' }}
          >
            Our mission is to simplify hardware development — offering plug-and-play
            modules, ready-to-use PCB designs, and custom embedded solutions that help
            engineers, makers, and industries innovate faster. Every product ships with
            complete 3D models, technical documentation, and full support files, making
            integration easy for everyone from beginners to professionals.
          </p>
        </BentoBlock>

        {/* Block 2 — Compliance badges · span 1 col */}
        <BentoBlock className="md:col-span-1 p-8 flex flex-col justify-between" delay={0.2}>
          <p
            className="text-[10px] tracking-[0.35em] text-circuit-gold mb-6 uppercase"
            style={{ fontFamily: 'var(--ff-mono)' }}
          >
            Quality Standards
          </p>
          <div className="flex flex-col gap-4 flex-1 justify-center">
            {CERTS.map((cert, i) => (
              <motion.div
                key={cert}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35 + i * 0.1, duration: 0.4 }}
                className="flex items-center gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-circuit-gold flex-shrink-0" />
                <span
                  className="text-timberwolf/80 text-xs tracking-[0.15em]"
                  style={{ fontFamily: 'var(--ff-mono)' }}
                >
                  {cert}
                </span>
              </motion.div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-white/[0.07]">
            <p
              className="text-timberwolf/40 text-[10px] tracking-[0.25em]"
              style={{ fontFamily: 'var(--ff-mono)' }}
            >
              IPC · RoHS · ESD-safe
            </p>
          </div>
        </BentoBlock>

        {/* Block 3 — Support ecosystem · full width */}
        <BentoBlock className="md:col-span-3 p-8" delay={0.3}>
          <p
            className="text-[10px] tracking-[0.35em] text-circuit-gold mb-8 uppercase"
            style={{ fontFamily: 'var(--ff-mono)' }}
          >
            Open Engineering Ecosystem
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {SUPPORTS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + i * 0.08, duration: 0.45 }}
                className="flex flex-col gap-2 group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-px bg-circuit-gold/60 group-hover:w-8 transition-all duration-300" />
                  <span
                    className="text-timberwolf text-sm font-semibold"
                    style={{ fontFamily: 'var(--ff-outfit)' }}
                  >
                    {s.label}
                  </span>
                </div>
                <p
                  className="text-timberwolf/50 text-xs leading-relaxed pl-7"
                  style={{ fontFamily: 'var(--ff-nunito)' }}
                >
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </BentoBlock>

      </div>
    </section>
  )
}
