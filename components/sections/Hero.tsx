'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const COLUMNS = [
  {
    id: 1,
    image: '/images/hero/Custom PCBs.png',
    heading: 'CUSTOM PCB FABRICATION',
    subtext: 'High-density multi-layer routing, precision impedance control, and rapid manufacturing prototyping rules.',
    tag: '[IPC-CLASS-3]',
    accent: '#2a1f10',
  },
  {
    id: 2,
    image: '/images/hero/Embedded Modules.png',
    heading: 'CORE SYSTEM MODULES',
    subtext: 'Compact processing solutions and plug-and-play architecture for faster device scaling.',
    tag: '[ARM-ARCHITECTURE]',
    accent: '#0f1a2e',
  },
  {
    id: 3,
    image: '/images/hero/Connectivity Devices.png',
    heading: 'IOT CONNECTIVITY',
    subtext: 'Secure, low-latency communication frameworks bridging hardware interfaces and networks.',
    tag: '[WIRELESS-PROTOCOLS]',
    accent: '#0a1f1a',
  },
  {
    id: 4,
    image: '/images/hero/Control Hardware.png',
    heading: 'AUTOMATION CONTROL',
    subtext: 'Industrial-grade execution environments designed for mission-critical deterministic systems.',
    tag: '[DETERMINISTIC-IO]',
    accent: '#1a1a1a',
  },
  {
    id: 5,
    image: '/images/hero/Firmware Architectur.png',
    heading: 'FIRMWARE ENGINEERING',
    subtext: 'Bare-metal optimization and clean real-time operational device orchestration.',
    tag: '[RTOS-KERNELS]',
    accent: '#1f0f0a',
  },
]

export default function Hero() {
  const [hoveredId, setHoveredId]   = useState<number | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())

  const getWidth = (id: number) => {
    if (expandedId !== null) return expandedId === id ? '100%' : '0%'
    if (hoveredId !== null)  return hoveredId  === id ? '38%'  : '15.5%'
    return '20%'
  }

  const handleClick = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id))
  }

  const handleImageError = (id: number) => {
    setImageErrors(prev => new Set(prev).add(id))
  }

  return (
    <section className="relative w-full overflow-hidden bg-anthracite">

      {/* ── Desktop: Horizontal Accordion (≥768px) ── */}
      <div
        className="hidden md:flex h-[85vh]"
        onMouseLeave={() => { if (!expandedId) setHoveredId(null) }}
      >
        {COLUMNS.map(col => {
          const isActive   = hoveredId === col.id || expandedId === col.id
          const isExpanded = expandedId === col.id
          const imgMissing = imageErrors.has(col.id)

          return (
            <motion.div
              key={col.id}
              className="relative overflow-hidden cursor-pointer flex-shrink-0"
              animate={{ width: getWidth(col.id) }}
              transition={{ type: 'spring', stiffness: 180, damping: 28 }}
              onMouseEnter={() => { if (!expandedId) setHoveredId(col.id) }}
              onClick={() => handleClick(col.id)}
            >
              {/* Background image or fallback */}
              {!imgMissing ? (
                <img
                  src={col.image}
                  alt={col.heading}
                  onError={() => handleImageError(col.id)}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    filter: isActive ? 'grayscale(0%) brightness(0.55)' : 'grayscale(80%) brightness(0.3)',
                    transition: 'filter 0.5s ease',
                  }}
                />
              ) : (
                /* Fallback gradient tile */
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(160deg, ${col.accent} 0%, #2D302F 100%)`,
                    opacity: isActive ? 0.9 : 0.5,
                    transition: 'opacity 0.5s ease',
                  }}
                />
              )}

              {/* Dark overlay vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Thin right border divider */}
              <div className="absolute top-0 right-0 bottom-0 w-px bg-white/5" />

              {/* Text — slides up on hover */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 p-8 flex flex-col gap-3"
                animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                {/* Mono tag */}
                <span
                  className="text-circuit-gold text-[10px] tracking-[0.3em]"
                  style={{ fontFamily: 'var(--ff-mono)' }}
                >
                  {col.tag}
                </span>

                {/* Heading */}
                <h2
                  className="text-timberwolf leading-tight"
                  style={{
                    fontFamily: 'var(--ff-outfit)',
                    fontSize: isExpanded ? 'clamp(2rem, 3.5vw, 3.2rem)' : 'clamp(1.2rem, 2vw, 1.8rem)',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    transition: 'font-size 0.4s ease',
                  }}
                >
                  {col.heading}
                </h2>

                {/* Subtext — only when expanded */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="text-timberwolf/70 text-sm leading-relaxed max-w-md"
                      style={{ fontFamily: 'var(--ff-nunito)' }}
                    >
                      {col.subtext}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Back arrow — visible only when this column is expanded */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.button
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.25, delay: 0.15 }}
                    onClick={e => { e.stopPropagation(); setExpandedId(null); setHoveredId(null) }}
                    className="absolute top-8 left-8 flex items-center gap-2 text-timberwolf/60
                               hover:text-circuit-gold transition-colors duration-200 group"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span
                      className="text-[10px] tracking-[0.2em] uppercase"
                      style={{ fontFamily: 'var(--ff-mono)' }}
                    >
                      Back
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* ── Mobile: Vertical Stack Accordion (<768px) ── */}
      <div className="flex md:hidden flex-col">
        {COLUMNS.map(col => {
          const isOpen     = expandedId === col.id
          const imgMissing = imageErrors.has(col.id)

          return (
            <motion.div
              key={col.id}
              className="relative overflow-hidden cursor-pointer"
              animate={{ height: isOpen ? '50vh' : '72px' }}
              transition={{ type: 'spring', stiffness: 200, damping: 28 }}
              onClick={() => setExpandedId(prev => prev === col.id ? null : col.id)}
            >
              {/* BG */}
              {!imgMissing ? (
                <img
                  src={col.image}
                  alt={col.heading}
                  onError={() => handleImageError(col.id)}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ filter: isOpen ? 'grayscale(0%) brightness(0.5)' : 'grayscale(70%) brightness(0.25)', transition: 'filter 0.4s' }}
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(160deg, ${col.accent} 0%, #2D302F 100%)` }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col gap-2">
                <span
                  className="text-circuit-gold text-[9px] tracking-[0.3em]"
                  style={{ fontFamily: 'var(--ff-mono)' }}
                >
                  {col.tag}
                </span>
                <h2
                  className="text-timberwolf font-bold text-lg leading-tight"
                  style={{ fontFamily: 'var(--ff-outfit)' }}
                >
                  {col.heading}
                </h2>
                <AnimatePresence>
                  {isOpen && (
                    <motion.p
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="text-timberwolf/70 text-sm leading-relaxed"
                      style={{ fontFamily: 'var(--ff-nunito)' }}
                    >
                      {col.subtext}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom border */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-white/5" />
            </motion.div>
          )
        })}
      </div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <span
          className="text-timberwolf/30 text-[9px] tracking-[0.4em] uppercase"
          style={{ fontFamily: 'var(--ff-mono)' }}
        >
          Scroll
        </span>
        <motion.div
          className="w-px h-8 bg-gradient-to-b from-timberwolf/30 to-transparent"
          animate={{ scaleY: [1, 0.4, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  )
}
