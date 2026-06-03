'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const NAV_LINKS = [
  { label: 'HOME',     href: '/',         desc: 'Back to landing' },
  { label: 'iT TALK',  href: '/ittalk',   desc: 'Engineering calculators & design tools' },
  { label: 'PRODUCTS', href: '/products', desc: 'Embedded modules & hardware' },
  { label: 'PROGRESS', href: '/progress', desc: 'What we are building next' },
]

export default function Navbar() {
  const [open, setOpen]       = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* ── Fixed bar ─────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5
          transition-all duration-500
          ${scrolled ? 'bg-anthracite/70 backdrop-blur-lg' : 'bg-transparent'}`}
      >
        {/* Logo */}
        <Link href="/" onClick={() => setOpen(false)} aria-label="ELCS Home">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-11 h-11 rounded-full overflow-hidden
                       ring-1 ring-circuit-gold/40 hover:ring-circuit-gold
                       transition-shadow duration-300"
          >
            <img
              src="/images/ELCS_final_logo.png"
              alt="ELCS"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </Link>

        {/* Hamburger ── spring physics on bars */}
        <button
          onClick={() => setOpen(v => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="relative w-10 h-10 flex flex-col justify-center items-end gap-[7px] z-10"
        >
          <motion.span
            className="block h-[1.5px] rounded-full bg-timberwolf"
            style={{ width: 28 }}
            animate={open ? { rotate: 45, y: 8.5, width: 28 } : { rotate: 0, y: 0, width: 28 }}
            transition={{ type: 'spring', stiffness: 220, damping: 14 }}
          />
          <motion.span
            className="block h-[1.5px] rounded-full bg-timberwolf"
            style={{ width: 20 }}
            animate={open ? { scaleX: 0, opacity: 0 } : { scaleX: 1, opacity: 1, width: 20 }}
            transition={{ duration: 0.18 }}
          />
          <motion.span
            className="block h-[1.5px] rounded-full bg-timberwolf"
            style={{ width: 28 }}
            animate={open ? { rotate: -45, y: -8.5, width: 28 } : { rotate: 0, y: 0, width: 28 }}
            transition={{ type: 'spring', stiffness: 220, damping: 14 }}
          />
        </button>
      </header>

      {/* ── Fullscreen drawer ─────────────────────── */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-40 overflow-hidden pointer-events-auto">

            {/* 4 slat panels — wipe from right, staggered */}
            {[0, 1, 2, 3].map(i => (
              <motion.div
                key={i}
                className="absolute top-0 bottom-0 bg-timberwolf"
                style={{
                  left: `${i * 25}%`,
                  width: '25.2%',       // tiny overlap kills hairline gaps
                  originX: 1,
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                exit={{ scaleX: 0 }}
                transition={{
                  duration: 0.42,
                  delay: i * 0.07,
                  ease: [0.76, 0, 0.24, 1],
                }}
              />
            ))}

            {/* Links — layer above slats */}
            <motion.nav
              className="relative z-10 h-full flex flex-col justify-center px-12 md:px-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, delay: 0.38 }}
            >
              <ul className="flex flex-col gap-0">
                {NAV_LINKS.map((link, i) => (
                  <DrawerLink
                    key={link.label}
                    {...link}
                    index={i}
                    onNavigate={() => setOpen(false)}
                  />
                ))}
              </ul>

              {/* Bottom meta row */}
              <motion.div
                className="absolute bottom-10 left-12 right-12 md:left-20 md:right-20
                           flex items-center justify-between"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.35 }}
              >
                <span
                  className="text-raw-umber text-[10px] tracking-[0.3em] uppercase"
                  style={{ fontFamily: 'var(--ff-mono)' }}
                >
                  elcs.1126.main@gmail.com
                </span>
                <span
                  className="text-raw-umber text-[10px] tracking-[0.3em] uppercase"
                  style={{ fontFamily: 'var(--ff-mono)' }}
                >
                  #ConnectTogether
                </span>
              </motion.div>
            </motion.nav>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ── Individual drawer link ─────────────────────── */
function DrawerLink({
  label, href, desc, index, onNavigate,
}: {
  label: string; href: string; desc: string; index: number; onNavigate: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.li
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.07, duration: 0.35, ease: 'easeOut' }}
    >
      <Link
        href={href}
        onClick={onNavigate}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="block py-1 select-none"
      >
        <motion.div animate={{ x: hovered ? 18 : 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>

          {/* Giant Bebas label */}
          <span
            className="block text-anthracite leading-[0.92] tracking-tight"
            style={{
              fontFamily: 'var(--ff-bebas)',
              fontSize: 'clamp(3.2rem, 7.5vw, 6.5rem)',
            }}
          >
            {label}
          </span>

          {/* Mono desc + gold bar — appear on hover */}
          <div className="overflow-hidden">
            <motion.span
              className="block text-raw-umber text-[11px] tracking-[0.2em] mt-0.5"
              style={{ fontFamily: 'var(--ff-mono)' }}
              initial={false}
              animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 6 }}
              transition={{ duration: 0.18 }}
            >
              {desc}
            </motion.span>
          </div>

          <motion.div
            className="h-[1px] bg-circuit-gold mt-1"
            initial={false}
            animate={{ scaleX: hovered ? 1 : 0, originX: 0 }}
            transition={{ duration: 0.22 }}
          />

        </motion.div>
      </Link>
    </motion.li>
  )
}
