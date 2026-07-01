"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { NavBar } from "./Navbar";
import { MenuOverlay } from "./MenuOverlay";

/** Wraps any public page with the shared NavBar + MenuOverlay (no preloader). */
export function SiteShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <NavBar open={menuOpen} onToggle={() => setMenuOpen((v) => !v)} />
      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
      >
        {children}
      </motion.div>
    </>
  );
}

