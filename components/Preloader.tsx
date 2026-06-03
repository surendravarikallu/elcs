'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Preloader() {
  const [logoError, setLogoError] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Hard-lock scroll while preloader owns the screen
    document.body.style.overflow = 'hidden'

    // Trigger the curtain wipe after all entrance animations settle
    const timer = setTimeout(() => setIsVisible(false), 2700)

    return () => clearTimeout(timer)
  }, [])

  const handleExitComplete = () => {
    // Restore scroll once curtain finishes lifting
    document.body.style.overflow = ''
  }

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {isVisible && (
        <motion.div
          key="preloader"
          // Full-screen Anthracite canvas, highest z-index
          className="fixed inset-0 z-[9999] bg-anthracite flex items-center justify-center"
          exit={{
            y: '-100%',
            transition: {
              duration: 0.75,
              ease: [0.76, 0, 0.24, 1], // sharp cubic-bezier curtain lift
            },
          }}
        >
          <div className="flex flex-col items-center gap-7">

            {/* ── Logo: rolls in from left, spring-settles at center ── */}
            <motion.div
              initial={{ x: '-58vw', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                duration: 0.9,
                ease: [0.22, 1, 0.36, 1], // smooth deceleration
                delay: 0.15,
              }}
            >
              {/* Settle-bounce when it lands */}
              <motion.div
                animate={{ scale: [1, 1.08, 0.96, 1] }}
                transition={{
                  duration: 0.5,
                  delay: 1.1,
                  times: [0, 0.35, 0.7, 1],
                  ease: 'easeInOut',
                }}
                className="relative"
              >
                {/* Gold ring glow — appears on landing */}
                <motion.div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    inset: '-4px',
                    boxShadow:
                      '0 0 0 1.5px #D4AF37, 0 0 28px rgba(212, 175, 55, 0.18)',
                  }}
                  initial={{ opacity: 0, scale: 1.25 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.12, duration: 0.38, ease: 'easeOut' }}
                />

                {/* Logo image — fallback to gold wordmark if missing */}
                {!logoError ? (
                  <img
                    src="/images/ELCS_final_logo.png"
                    alt="ELCS"
                    onError={() => setLogoError(true)}
                    className="w-24 h-24 rounded-full object-cover block relative z-10"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-anthracite border border-circuit-gold/50 flex items-center justify-center relative z-10">
                    <span
                      className="text-circuit-gold text-2xl tracking-[0.15em]"
                      style={{ fontFamily: 'var(--ff-bebas)' }}
                    >
                      ELCS
                    </span>
                  </div>
                )}
              </motion.div>
            </motion.div>

            {/* ── #ConnectTogether — fades up after logo settles ── */}
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.55,
                delay: 1.55,
                ease: 'easeOut',
              }}
              className="text-circuit-gold text-[10px] tracking-[0.45em] uppercase"
              style={{ fontFamily: 'var(--ff-mono)' }}
            >
              #ConnectTogether
            </motion.span>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
