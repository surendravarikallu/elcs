"use client";

import { useState } from "react";
import { Preloader } from "@/components/Preloader";
import { NavBar } from "@/components/Navbar";
import { MenuOverlay } from "@/components/MenuOverlay";
import { HeroAccordion } from "@/components/sections/Hero";
import { AboutBento } from "@/components/sections/About";
import { ThreeCs } from "@/components/sections/ThreeCs";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Preloader onComplete={() => setReady(true)} />
      <NavBar open={menuOpen} onToggle={() => setMenuOpen((v) => !v)} />
      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main>
        <h1 className="sr-only">ELCS — Embedded Modules, Control Systems &amp; Connectivity Devices</h1>
        <HeroAccordion ready={ready} />
        <AboutBento />
        <ThreeCs />
      </main>
      <Footer />
    </div>
  );
}
