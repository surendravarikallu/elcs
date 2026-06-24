"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useInView,
  type MotionValue,
} from "motion/react";
import logoImg from "../../public/images/elcs_logo_full.png";

/* ─────────── partner data ─────────── */
/* angle: degrees measured counter-clockwise from 3-o'clock (right).
   180 = left, 270 = top, 360/0 = right.
   The arcs fan from ~190° to ~-10° (i.e. left → top → right). */

const PARTNERS: {
  name: string;
  track: 1 | 2 | 3;
  angle: number; // degrees, 0=right, 90=top, 180=left
  color: string;
}[] = [
  // Track 1 (inner) — 3 logos
  { name: "Google\nPartner", track: 1, angle: 90,  color: "#4285F4" },
  { name: "Microsoft\nPartner", track: 1, angle: 150, color: "#00A4EF" },
  { name: "Meta", track: 1, angle: 30,  color: "#FFFFFF" },
  // Track 2 (middle) — 4 logos
  { name: "intel.", track: 2, angle: 150, color: "#0071C5" },
  { name: "RZ\nOstschweiz", track: 2, angle: 70,  color: "#00A4EF" },
  { name: "HUAWEI", track: 2, angle: 110, color: "#CF0A2C" },
  { name: "ASUS", track: 2, angle: 30,  color: "#FFFFFF" },
  // Track 3 (outer) — 7 logos
  { name: "ADN", track: 3, angle: 105, color: "#FF3B30" },
  { name: "ID:C", track: 3, angle: 55,  color: "#FF6B35" },
  { name: "WIRTIMO", track: 3, angle: 80,  color: "#FFFFFF" },
  { name: "sipcall", track: 3, angle: 140, color: "#3BAF29" },
  { name: "AnyDesk", track: 3, angle: 175, color: "#EF443B" },
  { name: "INGRAM", track: 3, angle: 30,  color: "#0058A3" },
  { name: "swissICT", track: 3, angle: 5,   color: "#00A3E0" },
];

/* ─────────── value-prop badges ─────────── */

const VALUE_PROPS = [
  { icon: "shield",    title: "Trusted Partners",     desc: "Working with global technology leaders" },
  { icon: "handshake", title: "Strong Collaboration",  desc: "Building solutions together" },
  { icon: "globe",     title: "Global Impact",         desc: "Creating change on a global scale" },
  { icon: "users",     title: "Future Ready",          desc: "Innovating for a better tomorrow" },
];

/* ─────────── orbit track radii (px inside 1200×700 viewBox) ─────────── */
const TRACK_R = { 1: 160, 2: 295, 3: 430 } as const;

/* ─────────── Spring config (same as About section) ─────────── */
const SPRING = { stiffness: 120, damping: 18, mass: 0.4 };

/* ─────────── viewBox constants ─────────── */
const VB_W = 1200;
const VB_H = 700;
const ORIGIN_X = VB_W / 2; // 600
const ORIGIN_Y = 580; // 580 — near bottom, leaves 120px space below

/* ─────────── partner coordinates in viewBox space ─────────── */
const PARTNER_COORDS = PARTNERS.map((p) => {
  const r = TRACK_R[p.track];
  const ry = r * 0.88;
  const rad = (p.angle * Math.PI) / 180;
  return {
    x: ORIGIN_X + r * Math.cos(rad),
    y: ORIGIN_Y - ry * Math.sin(rad),
  };
});

/* ═══════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════ */

export function Partners() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-80px" });
  const propsInView = useInView(propsRef, { once: true, margin: "-60px" });

  /* ── active proximity tracking ── */
  const [active, setActive] = useState<number[]>([]);
  const [coords, setCoords] = useState({ x: -500, y: -500 });

  /* ── pointer tracking (match About section) ── */
  const mx = useMotionValue(-500);
  const my = useMotionValue(-500);
  const sx = useSpring(mx, SPRING);
  const sy = useSpring(my, SPRING);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      mx.set(px);
      my.set(py);

      // Convert to viewBox coordinates of the stage
      const stageEl = stageRef.current;
      if (stageEl) {
        const sr = stageEl.getBoundingClientRect();
        const spx = e.clientX - sr.left;
        const spy = e.clientY - sr.top;
        const vX = (spx / sr.width) * VB_W;
        const vY = (spy / sr.height) * VB_H;
        setCoords({ x: vX, y: vY });

        // Find the closest partners
        const dists = PARTNER_COORDS.map((coord, i) => ({
          i,
          d: Math.hypot(coord.x - vX, coord.y - vY),
        }))
          .sort((a, b) => a.d - b.d)
          .filter((n) => n.d < 220) // distance threshold in viewBox pixels
          .map((n) => n.i);

        setActive(dists);
      }
    };
    const onLeave = () => {
      mx.set(-500);
      my.set(-500);
      setActive([]);
      setCoords({ x: -500, y: -500 });
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [mx, my]);

  const haloBg = useTransform(
    [sx, sy] as [MotionValue<number>, MotionValue<number>],
    ([x, y]) =>
      `radial-gradient(180px circle at ${x}px ${y}px, oklch(0.78 0.13 85 / 0.18), transparent 70%)`
  );

  /* ── orbit pause on hover ── */
  const [paused, setPaused] = useState(false);

  return (
    <section ref={wrapRef} id="partners" className="relative bg-background overflow-hidden border-t border-foreground/5">
      {/* Ambient grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Spotlight halo (same as About section, covers full wrapper) */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden md:block z-0"
        style={{ background: haloBg as unknown as string, mixBlendMode: "screen" }}
      />

      {/* Vignette (same style as About section) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0" style={{
        background: "radial-gradient(ellipse at center, transparent 40%, var(--color-background) 95%)",
      }} />

      {/* Golden particle glow — bottom-left */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 w-[500px] h-[500px] pointer-events-none z-0 opacity-80"
        style={{ background: "radial-gradient(ellipse at 20% 80%, oklch(0.78 0.13 85 / 0.12), transparent 60%)" }}
      />
      {/* Golden particle glow — bottom-right */}
      <div
        aria-hidden
        className="absolute bottom-0 right-0 w-[400px] h-[400px] pointer-events-none z-0 opacity-80"
        style={{ background: "radial-gradient(ellipse at 80% 80%, oklch(0.78 0.13 85 / 0.06), transparent 60%)" }}
      />

      <div className="relative px-4 sm:px-6 md:px-12 py-16 md:py-24 max-w-7xl mx-auto z-10">
        {/* ───── HEADER ───── */}
        <div ref={headerRef} className="text-center mb-8 md:mb-12">
          <motion.div
            className="font-mono text-xs text-accent tracking-[0.4em] mb-4 md:mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ type: "spring", ...SPRING }}
          >
            ● PARTNERS AND COLLABORATE WITH US ●
          </motion.div>

          <motion.h2
            className="font-display text-3xl md:text-5xl lg:text-6xl font-light mb-4 md:mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ type: "spring", ...SPRING, delay: 0.1 }}
          >
            <span className="text-foreground">Partners </span>
            <span className="text-accent">and collaborate with us</span>
          </motion.h2>

          <motion.p
            className="font-body text-sm md:text-base text-foreground/60 max-w-lg mx-auto mb-6 md:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ type: "spring", ...SPRING, delay: 0.2 }}
          >
            We collaborate with a number of technology partners
            who help us bring about change on a global scale.
          </motion.p>

          <motion.a
            href="#contact"
            className="inline-block font-mono text-xs tracking-[0.25em] uppercase border border-accent/50 text-accent px-6 py-2.5 rounded-full hover:bg-accent hover:text-background transition-all duration-300"
            initial={{ opacity: 0, y: 15 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ type: "spring", ...SPRING, delay: 0.3 }}
          >
            COLLABORATE WITH US →
          </motion.a>
        </div>

        {/* ───── ORBITING STAGE ───── */}
        <div
          ref={stageRef}
          className="relative w-full mx-auto mb-10 md:mb-16"
          style={{ maxWidth: 1000, aspectRatio: "1200/700" }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Concentric arcs (SVG) — semicircles fanning up from bottom-center */}
          <svg
            aria-hidden
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 w-full h-full"
          >
            <defs>
              <linearGradient id="arc-grad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.06" />
              </linearGradient>
            </defs>
            
            {/* Radial traces from central ELCS logo to each partner badge */}
            {PARTNERS.map((p, i) => {
              const coords = PARTNER_COORDS[i];
              const lit = active.includes(i);
              return (
                <g key={`radial-${i}`}>
                  {/* Base low-opacity trace */}
                  <line
                    x1={ORIGIN_X}
                    y1={ORIGIN_Y}
                    x2={coords.x}
                    y2={coords.y}
                    stroke="var(--color-accent)"
                    strokeWidth="0.5"
                    opacity="0.12"
                  />
                  {/* Glowing active trace */}
                  <motion.line
                    x1={ORIGIN_X}
                    y1={ORIGIN_Y}
                    x2={coords.x}
                    y2={coords.y}
                    stroke={p.color}
                    strokeWidth="1.2"
                    initial={false}
                    animate={{ opacity: lit ? 0.75 : 0 }}
                    transition={{ duration: 0.4 }}
                    style={{
                      filter: lit ? `drop-shadow(0 0 4px ${p.color})` : "none",
                    }}
                  />
                </g>
              );
            })}

            {/* 3 concentric semicircle arcs (extended slightly below horizontal axis to reach lowest logos) */}
            {([160, 295, 430] as const).map((r, i) => {
              const ry = r * 0.88; // vertical squash for elliptical shape
              const radExt = (10 * Math.PI) / 180; // 10 degrees extension
              const xStart = ORIGIN_X - r * Math.cos(radExt);
              const yStart = ORIGIN_Y + ry * Math.sin(radExt);
              const xEnd = ORIGIN_X + r * Math.cos(radExt);
              const yEnd = ORIGIN_Y + ry * Math.sin(radExt);

              return (
                <path
                  key={i}
                  d={`M ${xStart} ${yStart} A ${r} ${ry} 0 1 1 ${xEnd} ${yEnd}`}
                  fill="none"
                  stroke="url(#arc-grad)"
                  strokeWidth={1.2 - i * 0.15}
                  strokeDasharray={i === 1 ? "8 5" : "none"}
                  opacity={0.55 - i * 0.1}
                />
              );
            })}

            {/* Subtle radial background lines fanning from center */}
            {[30, 60, 90, 120, 150].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const len = 450;
              return (
                <line
                  key={deg}
                  x1={ORIGIN_X}
                  y1={ORIGIN_Y}
                  x2={ORIGIN_X + Math.cos(rad) * len}
                  y2={ORIGIN_Y - Math.sin(rad) * len}
                  stroke="var(--color-accent)"
                  strokeWidth="0.3"
                  opacity="0.08"
                />
              );
            })}

            {/* crosshair following cursor (identical to About section) */}
            {coords.x > 0 && (
              <g style={{ transform: `translate(${coords.x}px, ${coords.y}px)` }}>
                <circle r="14" stroke="var(--color-accent)" strokeWidth="0.6" fill="none" opacity="0.6" />
                <circle r="2" fill="var(--color-accent-glow)" />
                <line x1="-22" y1="0" x2="-16" y2="0" stroke="var(--color-accent)" strokeWidth="0.6" />
                <line x1="16" y1="0" x2="22" y2="0" stroke="var(--color-accent)" strokeWidth="0.6" />
                <line x1="0" y1="-22" x2="0" y2="-16" stroke="var(--color-accent)" strokeWidth="0.6" />
                <line x1="0" y1="16" x2="0" y2="22" stroke="var(--color-accent)" strokeWidth="0.6" />
              </g>
            )}
          </svg>

          {/* Orbiting company logos */}
          <div className="absolute inset-0">
            {PARTNERS.map((p, i) => (
              <OrbitBadge
                key={i}
                partner={p}
                index={i}
                paused={paused}
                isLit={active.includes(i)}
              />
            ))}
          </div>

          {/* Central ELCS Logo (mathematically centered at the origin) */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
            style={{ 
              top: `${(ORIGIN_Y / VB_H) * 100}%`,
              left: `${(ORIGIN_X / VB_W) * 100}%`
            }}
          >
            <div className="elcs-breathe flex items-center justify-center">
              <Image
                src={logoImg}
                alt="ELCS — Embedded Labs & Control Systems"
                className="h-8 sm:h-11 md:h-16 w-auto object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {/* ───── VALUE-PROP TIER ───── */}
        <div ref={propsRef}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 max-w-5xl mx-auto">
            {VALUE_PROPS.map((vp, i) => (
              <motion.div
                key={vp.title}
                className="flex items-start gap-3 p-4 md:p-5 border border-foreground/10 bg-card/50 backdrop-blur-sm hover:border-accent/30 transition-colors duration-300"
                initial={{ opacity: 0, y: 30 }}
                animate={propsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ type: "spring", ...SPRING, delay: i * 0.12 }}
              >
                <div className="shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full bg-accent/10 border border-accent/25 flex items-center justify-center">
                  <PropIcon name={vp.icon} />
                </div>
                <div>
                  <div className="font-mono text-xs md:text-sm font-semibold text-accent mb-1">{vp.title}</div>
                  <p className="font-body text-[10px] md:text-xs text-foreground/50 leading-relaxed">{vp.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CSS keyframes */}
      <style jsx global>{`
        .elcs-breathe {
          filter: drop-shadow(0 0 16px oklch(0.78 0.13 85 / 0.35));
          animation: elcs-breathe-kf 4s ease-in-out infinite;
        }
        @keyframes elcs-breathe-kf {
          0%, 100% { filter: drop-shadow(0 0 12px oklch(0.78 0.13 85 / 0.3)); }
          50%       { filter: drop-shadow(0 0 30px oklch(0.78 0.13 85 / 0.65)); }
        }
        @keyframes orbit-float {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50%      { transform: translate(-50%, -50%) translateY(-8px); }
        }
      `}</style>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Orbiting Badge — positioned on arcs via angle + radius
   ═══════════════════════════════════════════════════════════════ */

function OrbitBadge({
  partner,
  index,
  paused,
  isLit,
}: {
  partner: (typeof PARTNERS)[number];
  index: number;
  paused: boolean;
  isLit: boolean;
}) {
  const coords = PARTNER_COORDS[index];
  const pctX = (coords.x / VB_W) * 100;
  const pctY = (coords.y / VB_H) * 100;

  const floatDur = 3 + (index % 4) * 0.8;
  const floatDelay = index * 0.35;

  return (
    <motion.div
      className="absolute z-10"
      style={{
        left: `${pctX}%`,
        top: `${pctY}%`,
        x: "-50%",
        y: "-50%",
      }}
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay: 0.4 + index * 0.07,
      }}
      whileHover={{ scale: 1.18, transition: { type: "spring", stiffness: 300, damping: 15 } }}
    >
      <motion.div
        animate={paused ? { y: 0 } : { y: [0, -8, 0] }}
        transition={{
          duration: floatDur,
          ease: "easeInOut",
          repeat: Infinity,
          delay: floatDelay,
        }}
      >
        <LogoBadge partner={partner} isLit={isLit} />
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Partner SVG Logo Component — renders high-fidelity vector logos
   ═══════════════════════════════════════════════════════════════ */

function PartnerLogo({ name }: { name: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      {/* Renders differently based on brand layout */}
      {(() => {
        switch (name) {
          case "Google\nPartner":
            return (
              <div className="flex flex-col items-center justify-center select-none scale-[0.6] sm:scale-[0.8] md:scale-100">
                <div className="flex items-center gap-0.5 leading-none">
                  <span className="font-sans font-bold text-[8px] sm:text-[11px] md:text-[14px] tracking-tight">
                    <span className="text-[#4285F4]">G</span>
                    <span className="text-[#EA4335]">o</span>
                    <span className="text-[#FBBC05]">o</span>
                    <span className="text-[#4285F4]">g</span>
                    <span className="text-[#34A853]">l</span>
                    <span className="text-[#EA4335]">e</span>
                  </span>
                </div>
                <span className="text-[3px] sm:text-[5px] md:text-[6.5px] uppercase tracking-[0.25em] text-foreground/50 font-mono mt-0.5 md:mt-1">Partner</span>
              </div>
            );
          case "Microsoft\nPartner":
            return (
              <div className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 px-0.5 md:px-1 justify-center select-none scale-[0.65] sm:scale-[0.8] md:scale-100">
                <div className="grid grid-cols-2 gap-[1px] md:gap-0.5 w-2 h-2 sm:w-3.5 sm:h-3.5 md:w-4.5 md:h-4.5 shrink-0">
                  <div className="bg-[#F25022]" />
                  <div className="bg-[#7FBA00]" />
                  <div className="bg-[#00A4EF]" />
                  <div className="bg-[#FFB900]" />
                </div>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[5.5px] sm:text-[8px] md:text-[10px] font-bold text-white tracking-tight">Microsoft</span>
                  <span className="text-[3px] sm:text-[5px] md:text-[6.5px] text-foreground/50 font-mono uppercase mt-0.5">Partner</span>
                </div>
              </div>
            );
          case "Meta":
            return (
              <div className="flex flex-col items-center justify-center select-none scale-[0.65] sm:scale-[0.8] md:scale-100">
                <svg className="w-2.5 h-2.5 sm:w-4 sm:h-4 md:w-6 md:h-6 text-[#0064E0]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z"/>
                </svg>
                <span className="text-[5.5px] sm:text-[8px] md:text-[10px] font-bold text-white tracking-wide mt-0.5">Meta</span>
              </div>
            );
          case "intel.":
            return (
              <div className="flex items-center justify-center select-none scale-[0.7] sm:scale-[0.85] md:scale-100">
                <span className="font-sans font-bold italic text-[#0071C5] text-[8px] sm:text-[12px] md:text-[16px] tracking-tight">
                  intel<span className="text-accent">.</span>
                </span>
              </div>
            );
          case "HUAWEI":
            return (
              <div className="flex flex-col items-center justify-center select-none scale-[0.6] sm:scale-[0.8] md:scale-100">
                <svg className="w-2.5 h-2.5 sm:w-4 sm:h-4 md:w-6 md:h-6 text-[#CF0A2C]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.67 6.14S1.82 7.91 1.72 9.78v.35c.08 1.51 1.22 2.4 1.22 2.4 1.83 1.79 6.26 4.04 7.3 4.55 0 0 .06.03.1-.01l.02-.04v-.04C7.52 10.8 3.67 6.14 3.67 6.14zM9.65 18.6c-.02-.08-.1-.08-.1-.08l-7.38.26c.8 1.43 2.15 2.53 3.56 2.2.96-.25 3.16-1.78 3.88-2.3.06-.05.04-.09.04-.09zm.08-.78C6.49 15.63.21 12.28.21 12.28c-.15.46-.2.9-.21 1.3v.07c0 1.07.4 1.82.4 1.82.8 1.69 2.34 2.2 2.34 2.2.7.3 1.4.31 1.4.31.12.02 4.4 0 5.54 0 .05 0 .08-.05.08-.05v-.06c0-.03-.03-.05-.03-.05zM9.06 3.19a3.42 3.42 0 00-2.57 3.15v.41c.03.6.16 1.05.16 1.05.66 2.9 3.86 7.65 4.55 8.65.05.05.1.03.1.03a.1.1 0 00.06-.1c1.06-10.6-1.11-13.42-1.11-13.42-.32.02-1.19.23-1.19.23zm8.299 2.27s-.49-1.8-2.44-2.28c0 0-.57-.14-1.17-.22 0 0-2.18 2.81-1.12 13.43.01.07.06.08.06.08.07.03.1-.03.1-.03.72-1.03 3.9-5.76 4.55-8.64 0 0 .36-1.4.02-2.34zm-2.92 13.07s-.07 0-.09.05c0 0-.01.07.03.1.7.51 2.85 2 3.88 2.3 0 0 .16.05.43.06h.14c.69-.02 1.9-.37 3-2.26l-7.4-.25zm7.83-8.41c.14-2.06-1.94-3.97-1.94-3.98 0 0-3.85 4.66-6.67 10.8 0 0-.03.08.02.13l.04.01h.06c1.06-.53 5.46-2.77 7.28-4.54 0 0 1.15-.93 1.21-2.42zm1.52 2.14s-6.28 3.37-9.52 5.55c0 0-.05.04-.03.11 0 0 .03.06.07.06 1.16 0 5.56 0 5.67-.02 0 0 .57-.02 1.27-.29 0 0 1.56-.5 2.37-2.27 0 0 .73-1.45.17-3.14z"/>
                </svg>
                <span className="text-[3px] sm:text-[5px] md:text-[7px] font-bold text-[#CF0A2C] uppercase tracking-wider mt-0.5">HUAWEI</span>
              </div>
            );
          case "ASUS":
            return (
              <div className="flex items-center justify-center select-none scale-[0.7] sm:scale-[0.85] md:scale-100">
                <span className="font-sans font-extrabold text-white text-[7px] sm:text-[11px] md:text-[15px] tracking-[0.1em]">
                  ASUS
                </span>
              </div>
            );
          case "ADN":
            return (
              <div className="flex items-center gap-0.5 md:gap-1 justify-center select-none scale-[0.7] sm:scale-[0.85] md:scale-100">
                <div className="w-0.5 h-0.5 sm:w-2 sm:h-2 md:w-3 md:h-3 rounded bg-[#FF3B30] shrink-0" />
                <span className="font-sans font-black text-white text-[6px] sm:text-[10px] md:text-[13px] tracking-tight">
                  ADN
                </span>
              </div>
            );
          case "ID:C":
            return (
              <div className="flex items-center justify-center select-none scale-[0.7] sm:scale-[0.85] md:scale-100">
                <span className="font-mono font-bold text-[6px] sm:text-[10px] md:text-[13px]">
                  <span className="text-white">ID</span>
                  <span className="text-[#FF6B35]">:</span>
                  <span className="text-white">C</span>
                </span>
              </div>
            );
          case "WIRTIMO":
            return (
              <div className="flex items-center gap-0.5 md:gap-1 justify-center select-none scale-[0.65] sm:scale-[0.8] md:scale-100">
                <span className="font-sans font-extrabold text-white text-[5px] sm:text-[8px] md:text-[11px]">W</span>
                <span className="font-mono text-[4px] sm:text-[6px] md:text-[8px] text-foreground/50 tracking-wider">WIRTIMO</span>
              </div>
            );
          case "sipcall":
            return (
              <div className="flex items-center justify-center select-none scale-[0.7] sm:scale-[0.85] md:scale-100">
                <span className="font-sans font-semibold text-white text-[7px] sm:text-[10px] md:text-[13px] tracking-wide">
                  sipcall
                </span>
              </div>
            );
          case "AnyDesk":
            return (
              <div className="flex items-center gap-0.5 md:gap-1 justify-center select-none scale-[0.65] sm:scale-[0.8] md:scale-100">
                <svg className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 text-[#EF443B]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.322 3.677L0 12l8.322 8.323L16.645 12zm7.371.01l-1.849 1.85 6.49 6.456-6.49 6.49 1.85 1.817L24 11.993Z"/>
                </svg>
                <span className="font-sans font-medium text-white text-[5px] sm:text-[8px] md:text-[10.5px] tracking-tight">AnyDesk</span>
              </div>
            );
          case "INGRAM":
            return (
              <div className="flex items-center justify-center select-none scale-[0.7] sm:scale-[0.85] md:scale-100">
                <span className="font-sans font-black italic text-[#0058A3] text-[6px] sm:text-[9px] md:text-[12px] tracking-wide">
                  INGRAM
                </span>
              </div>
            );
          case "swissICT":
            return (
              <div className="flex items-center gap-0.5 md:gap-1 justify-center select-none scale-[0.7] sm:scale-[0.85] md:scale-100">
                <span className="font-sans font-light text-white text-[5px] sm:text-[8px] md:text-[10.5px] tracking-tighter">swiss</span>
                <span className="font-sans font-bold text-[#00A3E0] text-[5px] sm:text-[8px] md:text-[10.5px] tracking-tighter">ICT</span>
              </div>
            );
          case "RZ\nOstschweiz":
            return (
              <div className="flex flex-col items-center justify-center select-none scale-[0.65] sm:scale-[0.8] md:scale-100">
                <div className="flex items-center gap-0.5">
                  <span className="text-[6px] sm:text-[9px] md:text-[12px] font-bold text-[#00A4EF] leading-none">RZ</span>
                  <div className="w-0.5 h-0.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 rounded-full border border-[#00A4EF]/60 flex items-center justify-center shrink-0">
                    <div className="w-0.5 h-0.5 bg-[#00A4EF] rounded-full" />
                  </div>
                </div>
                <span className="text-[3px] sm:text-[5px] md:text-[6.5px] text-foreground/40 leading-none text-center font-mono mt-0.5">Ostschweiz</span>
              </div>
            );
          default:
            return null;
        }
      })()}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Logo Badge — Circular dark badge with company name & glow
   ═══════════════════════════════════════════════════════════════ */

function LogoBadge({ partner, isLit }: { partner: (typeof PARTNERS)[number]; isLit: boolean }) {
  return (
    <motion.div
      className="rounded-full border flex items-center justify-center cursor-pointer relative group w-[36px] h-[36px] sm:w-[56px] sm:h-[56px] md:w-[84px] md:h-[84px]"
      initial={false}
      animate={{
        borderColor: isLit ? partner.color : `${partner.color}33`,
        backgroundColor: isLit ? "oklch(0.16 0.01 240)" : "oklch(0.10 0.002 240)",
        boxShadow: isLit 
          ? `0 0 30px ${partner.color}55, inset 0 1px 2px oklch(0 0 0 / 0.4)`
          : "0 0 0 1px oklch(0.18 0.002 240), inset 0 1px 2px oklch(0 0 0 / 0.3)",
        scale: isLit ? 1.12 : 1,
      }}
      transition={{ type: "spring", stiffness: 150, damping: 20 }}
    >
      <div
        className="transition-colors duration-500 flex items-center justify-center w-full h-full"
        style={{ 
          color: isLit ? "#FFFFFF" : partner.color, 
          filter: isLit ? `drop-shadow(0 0 8px ${partner.color})` : "none" 
        }}
      >
        <PartnerLogo name={partner.name} />
      </div>

      {/* Tooltip on hover */}
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-background border border-accent/30 text-accent font-mono text-[9px] whitespace-nowrap rounded opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.5)] z-30">
        {partner.name.replace("\n", " ")}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Value Prop Icon SVGs
   ═══════════════════════════════════════════════════════════════ */

function PropIcon({ name }: { name: string }) {
  const cls = "w-4 h-4 md:w-5 md:h-5 text-accent";
  switch (name) {
    case "shield":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "handshake":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.5 10.5l-1-1a2 2 0 00-2.83 0L12 14.17l-1.41-1.41" />
          <path d="M3.5 10.5l1-1a2 2 0 012.83 0" />
          <path d="M2 15h3l4 4 4-4h2l4 4" />
          <path d="M22 15h-3" />
          <path d="M2 7l4.5-4.5" />
          <path d="M22 7l-4.5-4.5" />
        </svg>
      );
    case "globe":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>
      );
    case "users":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
      );
    default:
      return null;
  }
}
