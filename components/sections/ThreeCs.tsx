'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

/* ── Geometric crystal ────────────────────────── */
function Crystal({ rotDeg }: { rotDeg: number }) {
  const hex = (r: number, offset = -30) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = ((i * 60 + offset) * Math.PI) / 180
      return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`
    }).join(' ')

  return (
    <svg viewBox="-120 -120 240 240" width="300" height="300" className="overflow-visible">
      <defs>
        <pattern id="eng-grid" x="-120" y="-120" width="20" height="20" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="20" y2="0" stroke="#7A5938" strokeWidth="0.3" opacity="0.3"/>
          <line x1="0" y1="0" x2="0" y2="20" stroke="#7A5938" strokeWidth="0.3" opacity="0.3"/>
        </pattern>
      </defs>
      <rect x="-120" y="-120" width="240" height="240" fill="url(#eng-grid)" />

      {/* Outer hex */}
      <polygon points={hex(100)} fill="none" stroke="#7A5938" strokeWidth="0.8" opacity="0.3"
        style={{ transform: `rotate(${rotDeg * 0.4}deg)`, transformOrigin: 'center' }} />

      {/* Spokes */}
      {Array.from({ length: 6 }, (_, i) => {
        const a = ((i * 60 - 30 + rotDeg * 0.4) * Math.PI) / 180
        return <line key={i} x1="0" y1="0" x2={(Math.cos(a)*100).toFixed(1)} y2={(Math.sin(a)*100).toFixed(1)}
          stroke="#7A5938" strokeWidth="0.4" opacity="0.2" />
      })}

      {/* Mid hex */}
      <polygon points={hex(64, 0)} fill="none" stroke="#D4AF37" strokeWidth="0.7" opacity="0.5"
        style={{ transform: `rotate(${rotDeg * 0.7 + 20}deg)`, transformOrigin: 'center' }} />

      {/* Inner hex */}
      <polygon points={hex(30)} fill="none" stroke="#D4AF37" strokeWidth="1.2" opacity="0.85"
        style={{ transform: `rotate(${rotDeg * 1.3}deg)`, transformOrigin: 'center' }} />

      {/* Cross hairs */}
      <line x1="-100" y1="0" x2="100" y2="0" stroke="#7A5938" strokeWidth="0.3" opacity="0.2"/>
      <line x1="0" y1="-100" x2="0" y2="100" stroke="#7A5938" strokeWidth="0.3" opacity="0.2"/>

      {/* Center */}
      <circle cx="0" cy="0" r="3.5" fill="#D4AF37" opacity="0.9"/>
      <circle cx="0" cy="0" r="7"   fill="none" stroke="#D4AF37" strokeWidth="0.6" opacity="0.4"/>

      <text x="0" y="115" textAnchor="middle" fill="#7A5938" fontSize="7"
        fontFamily="monospace" letterSpacing="3" opacity="0.6">
        #ConnectTogether
      </text>
    </svg>
  )
}

/* ── The three content panels ─────────────────── */
const SECTIONS = [
  {
    tag: 'Connect',
    heading: 'CONNECT',
    body: [
      'We bridge the gap between complex embedded hardware and the engineers who build with it — offering plug-and-play modules, ready-to-use PCB designs, and connectivity devices that just work.',
      'Whether you are scaling an IoT deployment or prototyping a new control system, ELCS gives you the hardware backbone to move faster.',
    ],
    index: 0,
  },
  {
    tag: 'Control',
    heading: 'CONTROL',
    body: [
      'Every module ships with complete 3D models, full schematics, reference firmware, and technical documentation — giving you total control over your integration pipeline.',
      'We follow IPC design rules, RoHS compliance, and ESD-safe processes. Built for real-world applications where reliability is not optional.',
    ],
    index: 1,
  },
  {
    tag: 'CareSure',
    heading: 'CARESURE',
    body: [
      'From beginner makers to professional engineers, ELCS ensures every product is accessible, documented, and supported. Advanced embedded technology should not be gated behind complexity.',
      'We aim to make smarter, safer, and more efficient systems the default — not the exception.',
    ],
    index: 2,
  },
]

export default function ThreeCs() {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // Crystal rotation: 0° → 240° over entire 300vh
  const crystalRotation = useTransform(scrollYProgress, [0, 1], [0, 240])

  // Right column scrolls upward: 0 → -200vh
  const rightY = useTransform(scrollYProgress, [0, 1], ['0vh', '-200vh'])

  // Per-section opacity ranges (fade in/out as each occupies the viewport)
  const op0 = useTransform(scrollYProgress, [0, 0.08, 0.27, 0.37], [0.5, 1, 1, 0])
  const op1 = useTransform(scrollYProgress, [0.27, 0.37, 0.63, 0.73], [0, 1, 1, 0])
  const op2 = useTransform(scrollYProgress, [0.63, 0.73, 1],          [0, 1, 1])
  const opacities = [op0, op1, op2]

  return (
    <section
      ref={containerRef}
      className="relative bg-anthracite"
      style={{ height: '300vh' }}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-white/[0.06]" />

      {/* ── DESKTOP: sticky 100vh frame ─────────── */}
      <div className="hidden md:flex sticky top-0 h-screen overflow-hidden">

        {/* Left: rotating crystal */}
        <div className="w-1/2 flex items-center justify-center relative border-r border-white/[0.06]">
          <div
            className="absolute w-72 h-72 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)' }}
          />
          <motion.div style={{ rotate: crystalRotation }}>
            <Crystal rotDeg={0} />
          </motion.div>
        </div>

        {/* Right: translate-up driven by scroll */}
        <div className="w-1/2 overflow-hidden">
          <motion.div style={{ y: rightY }}>
            {SECTIONS.map((s) => (
              <motion.div
                key={s.tag}
                style={{ opacity: opacities[s.index] }}
                className="h-screen flex flex-col justify-center px-12 max-w-xl"
              >
                <p
                  className="text-circuit-gold text-[10px] tracking-[0.4em] uppercase mb-6"
                  style={{ fontFamily: 'var(--ff-mono)' }}
                >
                  [{String(s.index + 1).padStart(2, '0')}] — {s.tag}
                </p>
                <h3
                  className="text-timberwolf leading-none mb-8"
                  style={{
                    fontFamily: 'var(--ff-bebas)',
                    fontSize: 'clamp(3.5rem, 7vw, 6rem)',
                    letterSpacing: '0.03em',
                  }}
                >
                  {s.heading}
                </h3>
                {s.body.map((p, i) => (
                  <p
                    key={i}
                    className="text-timberwolf/60 text-base leading-relaxed mb-4 last:mb-0"
                    style={{ fontFamily: 'var(--ff-caudex)' }}
                  >
                    {p}
                  </p>
                ))}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── MOBILE: normal flow stack ───────────── */}
      <div className="flex md:hidden flex-col py-20 px-6 gap-20">
        {SECTIONS.map((s, i) => (
          <div key={s.tag}>
            <div className="flex justify-center mb-8 opacity-50">
              <Crystal rotDeg={i * 80} />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55 }}
            >
              <p
                className="text-circuit-gold text-[10px] tracking-[0.4em] uppercase mb-4"
                style={{ fontFamily: 'var(--ff-mono)' }}
              >
                [{String(i + 1).padStart(2, '0')}] — {s.tag}
              </p>
              <h3
                className="text-timberwolf leading-none mb-6"
                style={{
                  fontFamily: 'var(--ff-bebas)',
                  fontSize: 'clamp(3rem, 12vw, 5rem)',
                }}
              >
                {s.heading}
              </h3>
              {s.body.map((p, j) => (
                <p
                  key={j}
                  className="text-timberwolf/60 text-sm leading-relaxed mb-3 last:mb-0"
                  style={{ fontFamily: 'var(--ff-caudex)' }}
                >
                  {p}
                </p>
              ))}
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  )
}
