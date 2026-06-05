"use client";

import { useState } from "react";
import { NavBar } from "./Navbar";
import { MenuOverlay } from "./MenuOverlay";

/** Wraps any public page with the shared NavBar + MenuOverlay. */
export function SiteShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <NavBar open={menuOpen} onToggle={() => setMenuOpen((v) => !v)} />
      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
      {children}
    </>
  );
}
