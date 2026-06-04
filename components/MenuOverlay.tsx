"use client";

import { AnimatePresence, motion } from "motion/react";

const LINKS = [
  { label: "iT TALK", sub: "[CALCULATORS / TOOLS]" },
  { label: "PRODUCTS", sub: "[CATALOG / STORE]" },
  { label: "PROGRESS", sub: "[ROADMAP / LOG]" },
  { label: "HOME", sub: "[LANDING / ABOUT]" },
];

export function MenuOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid grid-cols-3"
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="bg-[#D7D0C7] h-full"
              variants={{
                initial: { x: "100%" },
                animate: { x: 0, transition: { duration: 0.55, ease: [0.76, 0, 0.24, 1], delay: i * 0.1 } },
                exit: { x: "100%", transition: { duration: 0.4, ease: [0.76, 0, 0.24, 1], delay: (2 - i) * 0.05 } },
              }}
            />
          ))}
          <motion.nav
            className="absolute inset-0 flex flex-col justify-center px-8 md:px-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.45 } }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            <ul className="space-y-2 md:space-y-4">
              {LINKS.map((l) => (
                <li key={l.label} className="group">
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); onClose(); }}
                    className="relative inline-block transition-transform duration-300 group-hover:translate-x-4"
                  >
                    <span className="font-display block text-[#2D302F] text-[clamp(2.5rem,9vw,9rem)] leading-[0.9] uppercase font-bold tracking-tight">
                      {l.label}
                    </span>
                    <span className="font-mono text-xs md:text-sm text-[#7A5938] opacity-0 group-hover:opacity-100 transition-opacity">
                      {l.sub}
                    </span>
                    <span className="absolute -bottom-1 left-1/2 h-[2px] w-0 group-hover:w-full -translate-x-1/2 bg-[#D4AF37] transition-[width] duration-500" />
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
