import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Preloader } from "@/components/elcs/Preloader";
import { NavBar } from "@/components/elcs/NavBar";
import { MenuOverlay } from "@/components/elcs/MenuOverlay";
import { HeroAccordion } from "@/components/elcs/HeroAccordion";
import { AboutBento } from "@/components/elcs/AboutBento";
import { ThreeCs } from "@/components/elcs/ThreeCs";
import { Footer } from "@/components/elcs/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ELCS — Embedded Modules, Control & Connectivity" },
      { name: "description", content: "ELCS designs and manufactures future-ready embedded modules, control systems, and connectivity devices — precision-engineered hardware for engineers, makers, and industry." },
      { property: "og:title", content: "ELCS — Embedded Modules, Control & Connectivity" },
      { property: "og:description", content: "Future-ready embedded hardware: custom PCBs, core modules, IoT, control, firmware." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

function Index() {
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Preloader onComplete={() => setReady(true)} />
      <NavBar open={menuOpen} onToggle={() => setMenuOpen((v) => !v)} />
      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main>
        <h1 className="sr-only">ELCS — Embedded Modules, Control Systems & Connectivity Devices</h1>
        <HeroAccordion ready={ready} />
        <AboutBento />
        <ThreeCs />
      </main>
      <Footer />
    </div>
  );
}
