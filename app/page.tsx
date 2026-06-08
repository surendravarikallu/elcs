"use client";

import { useState, useEffect } from "react";
import { Preloader } from "@/components/Preloader";
import { NavBar } from "@/components/Navbar";
import { MenuOverlay } from "@/components/MenuOverlay";
import { Carousel } from "@/components/sections/Carousel";
import { AboutBento } from "@/components/sections/About";
import { ThreeCs } from "@/components/sections/ThreeCs";
import { Footer } from "@/components/sections/Footer";
import { createClient } from "@/lib/supabase/client";
import type { CarouselSlide } from "@/types/database";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  // null = still fetching  |  [] = fetched empty  |  [...] = ready
  const [slides, setSlides] = useState<CarouselSlide[] | null>(null);

  /* ── Fetch + preload carousel images immediately, in parallel with the preloader ── */
  useEffect(() => {
    const sb = createClient();
    sb.from("carousel_slides")
      .select("*")
      .eq("is_published", true)
      .order("sort_order")
      .then(({ data }) => {
        const sl = (data as CarouselSlide[]) ?? [];
        // Kick browser image preloading while the preloader animation is still running
        sl.forEach((s) => {
          if (s.image_url) {
            const img = new window.Image();
            img.src = s.image_url;
          }
        });
        setSlides(sl);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Preloader onComplete={() => {}} />
      <NavBar open={menuOpen} onToggle={() => setMenuOpen((v) => !v)} />
      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main>
        <h1 className="sr-only">ELCS — Embedded Modules, Control Systems &amp; Connectivity Devices</h1>
        <Carousel slides={slides} />
        <AboutBento />
        <ThreeCs />
      </main>
      <Footer />
    </div>
  );
}
