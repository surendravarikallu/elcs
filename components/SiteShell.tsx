"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { NavBar } from "./Navbar";
import { MenuOverlay } from "./MenuOverlay";
import { Preloader } from "./Preloader";

/** Wraps any public page with the shared NavBar + MenuOverlay. */
export function SiteShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [ready, setReady] = useState(false);

  return (
    <>
      <Preloader skipLogo={true} onComplete={() => setReady(true)} />
      <NavBar open={menuOpen} onToggle={() => setMenuOpen((v) => !v)} />
      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
        transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
      >
        {children}
      </motion.div>
    </>
  );
}

