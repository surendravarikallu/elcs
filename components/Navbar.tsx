"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { ElcsLogo } from "./ElcsLogo";

export function NavBar({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const spring = { type: "spring" as const, stiffness: 220, damping: 14 };

  const [visible, setVisible] = useState(true);
  const [atTop, setAtTop]     = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let accumulatedDistance = 0;

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setAtTop(currentScrollY < 8);

      const deltaY = currentScrollY - lastScrollY;

      if (currentScrollY < 8) {
        setVisible(true);
        accumulatedDistance = 0;
      } else {
        // If direction changed, reset accumulated distance
        if ((deltaY > 0 && accumulatedDistance < 0) || (deltaY < 0 && accumulatedDistance > 0)) {
          accumulatedDistance = 0;
        }
        accumulatedDistance += deltaY;

        if (accumulatedDistance > 30) {
          // Scrolled down more than 30px continuously -> hide
          setVisible(false);
          accumulatedDistance = 0;
        } else if (accumulatedDistance < -15) {
          // Scrolled up more than 15px continuously -> reveal
          setVisible(true);
          accumulatedDistance = 0;
        }
      }

      lastScrollY = currentScrollY;
    };

    onScroll(); // sync on mount
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-[60] flex items-center justify-between px-6 md:px-10 py-5"
      animate={{
        y: visible || open ? "0%" : "-100%",
        backgroundColor: atTop
          ? "oklch(0 0 0 / 0)"
          : "oklch(0.08 0.003 240 / 0.92)",
        borderBottomColor: atTop
          ? "oklch(0 0 0 / 0)"
          : "oklch(0.85 0.012 70 / 0.08)",
      }}
      transition={{ duration: 0.38, ease: [0.25, 1, 0.5, 1] }}
      style={{
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        backdropFilter: atTop ? "none" : "blur(12px)",
        WebkitBackdropFilter: atTop ? "none" : "blur(12px)",
      }}
    >
      {/* Logo */}
      <motion.div
        animate={{ opacity: open ? 0 : 1, pointerEvents: open ? "none" : "auto" }}
        transition={{ duration: 0.2 }}
      >
        <Link href="/">
          <ElcsLogo className="h-10 w-auto object-contain" />
        </Link>
      </motion.div>

      {/* Hamburger → X */}
      <button
        onClick={onToggle}
        aria-label={open ? "Close menu" : "Open menu"}
        className="relative w-10 h-10 flex flex-col items-center justify-center gap-[6px] cursor-pointer rounded-sm transition-colors duration-200 hover:bg-foreground/5"
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
    </motion.header>
  );
}
