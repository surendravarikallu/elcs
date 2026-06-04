"use client";

import { motion } from "motion/react";
import { ElcsLogo } from "./ElcsLogo";

export function NavBar({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const spring = { type: "spring" as const, stiffness: 220, damping: 14 };
  return (
    <header className="fixed inset-x-0 top-0 z-[60] flex items-center justify-between px-6 md:px-10 py-5">
      <a href="#top" className="block w-10 h-10">
        <ElcsLogo className="w-full h-full object-contain" />
      </a>
      <button
        onClick={onToggle}
        aria-label={open ? "Close menu" : "Open menu"}
        className="relative w-10 h-10 flex flex-col items-center justify-center gap-[6px] cursor-pointer"
      >
        <motion.span
          className="block h-px w-7 bg-foreground"
          animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
          transition={spring}
        />
        <motion.span
          className="block h-px w-7 bg-foreground origin-center"
          animate={open ? { scaleX: 0, opacity: 0 } : { scaleX: 1, opacity: 1 }}
          transition={spring}
        />
        <motion.span
          className="block h-px w-7 bg-foreground"
          animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
          transition={spring}
        />
      </button>
    </header>
  );
}
