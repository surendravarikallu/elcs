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
  { name: "Zenith Tek",    track: 3, angle: 165, color: "#006666" },
  { name: "FAA Robotics",   track: 2, angle: 140, color: "#CF0A2C" },
  { name: "ebezz",          track: 1, angle: 90,  color: "#00A3E0" },
  { name: "mark 3D",        track: 2, angle: 40,  color: "#FF8F00" },
  { name: "HSAIT",          track: 3, angle: 15,  color: "#0058A3" },
];

/* ─────────── value-prop badges ─────────── */

const VALUE_PROPS = [
  { icon: "shield",    title: "Trusted Partners",     desc: "Working with global technology leaders" },
  { icon: "handshake", title: "Strong Collaboration",  desc: "Building solutions together" },
  { icon: "globe",     title: "Global Impact",         desc: "Creating change on a global scale" },
  { icon: "users",     title: "Future Ready",          desc: "Innovating for a better tomorrow" },
];

/* ─────────── orbit track radii (px inside 1200×700 viewBox) ─────────── */
const TRACK_R = { 1: 240, 2: 350, 3: 460 } as const;

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
            {([TRACK_R[1], TRACK_R[2], TRACK_R[3]] as const).map((r, i) => {
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
            <div className="elcs-breathe flex items-center justify-center w-16 h-16 sm:w-24 sm:h-24 md:w-36 md:h-36 rounded-full border border-accent bg-background shadow-[0_0_40px_var(--color-accent-glow)]">
              <span className="font-display font-light text-xs sm:text-lg md:text-3xl text-accent tracking-[0.2em] translate-x-[0.1em]">
                ELCS
              </span>
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
  let src = "";
  let blendClass = "";
  
  switch (name) {
    case "Zenith Tek":
      src = "/images/partners/zenith_tek.jpg";
      blendClass = "brightness-110 contrast-105";
      break;
    case "FAA Robotics":
      src = "/images/partners/faa_robotics.jpg";
      blendClass = "brightness-110";
      break;
    case "ebezz":
      src = "/images/partners/ebezz.jpg";
      blendClass = "brightness-125 contrast-110";
      break;
    case "mark 3D":
      src = "/images/partners/mark_3d.png";
      blendClass = "brightness-110";
      break;
    case "HSAIT":
      src = "/images/partners/hsait.png";
      blendClass = "brightness-110";
      break;
    default:
      return null;
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Inner white circle that clips the logo into a circular shape */}
      <div className="relative w-[78%] h-[78%] rounded-full overflow-hidden bg-white/95 shadow-[inset_0_0_8px_rgba(0,0,0,0.08)]">
        <Image
          src={src}
          alt={name}
          fill
          sizes="(max-width: 640px) 40px, (max-width: 1024px) 72px, 108px"
          className={`object-contain p-1.5 sm:p-2 md:p-3 transition-all duration-300 ${blendClass}`}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Logo Badge — Circular gold badge with company logo & glow
   ═══════════════════════════════════════════════════════════════ */

function LogoBadge({ partner, isLit }: { partner: (typeof PARTNERS)[number]; isLit: boolean }) {
  return (
    <motion.div
      className="rounded-full border-2 flex items-center justify-center cursor-pointer relative group w-[56px] h-[56px] sm:w-[96px] sm:h-[96px] md:w-[140px] md:h-[140px]"
      initial={false}
      animate={{
        borderColor: isLit ? "oklch(0.78 0.13 85)" : "oklch(0.78 0.13 85 / 0.35)",
        // Transparent background so the logo is clearly visible inside the gold ring
        background: isLit 
          ? "oklch(0.12 0.005 240 / 0.85)" 
          : "oklch(0.10 0.003 240 / 0.65)",
        boxShadow: isLit 
          ? "0 0 35px oklch(0.78 0.13 85 / 0.55), inset 0 0 20px oklch(0.78 0.13 85 / 0.08)"
          : "0 0 15px oklch(0.78 0.13 85 / 0.2), inset 0 0 10px oklch(0.78 0.13 85 / 0.04)",
        scale: isLit ? 1.12 : 1,
      }}
      transition={{ type: "spring", stiffness: 150, damping: 20 }}
    >
      <div className="w-full h-full flex items-center justify-center">
        <PartnerLogo name={partner.name} />
      </div>

      {/* Tooltip on hover */}
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-background border border-accent/30 text-accent font-mono text-[9px] whitespace-nowrap rounded opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.5)] z-30">
        {partner.name}
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
