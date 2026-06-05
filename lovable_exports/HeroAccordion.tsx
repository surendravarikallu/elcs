import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import pcbImg from "@/assets/hero-custom-pcbs.jpg";
import embeddedImg from "@/assets/hero-embedded-modules.jpg";
import connectImg from "@/assets/hero-connectivity.jpg";
import controlImg from "@/assets/hero-control.jpg";
import firmwareImg from "@/assets/hero-firmware.jpg";

const COLUMNS = [
  { img: pcbImg, heading: "CUSTOM PCB FABRICATION", sub: "High-density multi-layer routing, precision impedance control, and rapid manufacturing prototyping rules.", tag: "[IPC-CLASS-3]" },
  { img: embeddedImg, heading: "CORE SYSTEM MODULES", sub: "Compact processing solutions and plug-and-play architecture for faster device scaling.", tag: "[ARM-ARCHITECTURE]" },
  { img: connectImg, heading: "IOT CONNECTIVITY", sub: "Secure, low-latency communication frameworks bridging hardware interfaces and networks.", tag: "[WIRELESS-PROTOCOLS]" },
  { img: controlImg, heading: "AUTOMATION CONTROL", sub: "Industrial-grade execution environments designed for mission-critical deterministic systems.", tag: "[DETERMINISTIC-IO]" },
  { img: firmwareImg, heading: "FIRMWARE ENGINEERING", sub: "Bare-metal optimization and clean real-time operational device orchestration.", tag: "[RTOS-KERNELS]" },
];

export function HeroAccordion({ ready }: { ready: boolean }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [taken, setTaken] = useState<number | null>(null);
  const [activeMobile, setActiveMobile] = useState<number>(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => { if (window.scrollY > 40) setScrolled(true); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="top" className="relative pt-24 md:pt-28 px-0">
      {/* Desktop */}
      <motion.div
        className="hidden md:flex w-full h-[78vh] lg:h-[85vh] overflow-hidden"
        initial="hidden"
        animate={ready ? "show" : "hidden"}
        variants={{ show: { transition: { staggerChildren: 0.1 } } }}
      >
        {COLUMNS.map((c, i) => {
          const isTaken = taken === i;
          const anyTaken = taken !== null;
          const isHovered = hovered === i;
          const flex = anyTaken
            ? (isTaken ? 100 : 0)
            : hovered === null
              ? 1
              : (isHovered ? 4 : 1);

          return (
            <motion.div
              key={i}
              variants={{ hidden: { opacity: 0, scaleY: 0.95 }, show: { opacity: 1, scaleY: 1, transition: { duration: 0.8 } } }}
              onMouseEnter={() => !anyTaken && setHovered(i)}
              onMouseLeave={() => !anyTaken && setHovered(null)}
              onClick={() => setTaken(i)}
              animate={{ flexGrow: flex, flexBasis: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 22 }}
              className="relative h-full border-r border-foreground/5 last:border-r-0 overflow-hidden cursor-pointer min-w-0"
              style={{ flexShrink: 0 }}
            >
              <motion.img
                src={c.img}
                alt={c.heading}
                className="absolute inset-0 w-full h-full object-cover"
                animate={{
                  filter: isHovered || isTaken ? "grayscale(0) brightness(0.85)" : "grayscale(0.8) brightness(0.45)",
                  scale: isHovered || isTaken ? 1.04 : 1,
                }}
                transition={{ duration: 0.6 }}
                loading={i === 0 ? "eager" : "lazy"}
                width={800} height={1024}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
              {!isHovered && !isTaken && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 [writing-mode:vertical-rl] rotate-180 font-mono text-xs tracking-[0.3em] text-foreground/70 uppercase whitespace-nowrap">
                  {c.heading.split(" ")[0]}
                </div>
              )}
              <AnimatePresence>
                {(isHovered || isTaken) && (
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 14 }}
                    transition={{ duration: 0.35 }}
                    className="absolute bottom-0 left-0 right-0 p-8 md:p-10"
                  >
                    <div className="font-mono text-xs text-accent tracking-[0.25em] mb-3">{c.tag}</div>
                    <h2 className="font-sans font-light text-2xl md:text-4xl text-foreground uppercase tracking-tight max-w-2xl">{c.heading}</h2>
                    <p className="font-body text-foreground/70 mt-3 max-w-xl text-sm md:text-base">{c.sub}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Back arrow when taken */}
      <AnimatePresence>
        {taken !== null && (
          <motion.button
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            onClick={(e) => { e.stopPropagation(); setTaken(null); }}
            className="hidden md:flex absolute top-32 left-8 z-10 items-center gap-2 font-mono text-xs text-foreground/80 hover:text-accent transition-colors uppercase tracking-widest cursor-pointer"
          >
            <span>←</span> Back
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile vertical accordion */}
      <div className="md:hidden flex flex-col w-full">
        {COLUMNS.map((c, i) => {
          const active = activeMobile === i;
          return (
            <motion.div
              key={i}
              onClick={() => setActiveMobile(i)}
              animate={{ height: active ? "55vh" : "11vh" }}
              transition={{ type: "spring", stiffness: 120, damping: 22 }}
              className={`relative overflow-hidden border-b border-foreground/5 ${active ? "border-l-2 border-l-accent" : ""}`}
            >
              <img src={c.img} alt={c.heading} className={`absolute inset-0 w-full h-full object-cover ${active ? "brightness-75" : "brightness-50 grayscale"}`} loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="font-mono text-[10px] text-accent tracking-[0.25em] mb-1">{c.tag}</div>
                <h2 className="font-sans font-light text-lg text-foreground uppercase">{c.heading}</h2>
                {active && <p className="font-body text-foreground/70 mt-2 text-xs">{c.sub}</p>}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Scroll cue */}
      <AnimatePresence>
        {ready && !scrolled && taken === null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.2, duration: 0.4 }}
            className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 font-mono text-[10px] tracking-[0.4em] text-foreground/50 uppercase z-10"
          >
            <span>Scroll</span>
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              className="block w-px h-8 bg-accent/60"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
