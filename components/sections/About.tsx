"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

/**
 * AboutBento — Obsidian micro-workshop.
 * Background = a live PCB. Cursor drags a "solder iron" glow across the board;
 * the nearest 6 nodes light up sequentially (wire-traces fill toward cursor),
 * pads pulse, and an ambient grid breathes under it all.
 */
export function AboutBento() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(-500);
  const my = useMotionValue(-500);
  const sx = useSpring(mx, { stiffness: 120, damping: 18, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 120, damping: 18, mass: 0.4 });

  const [active, setActive] = useState<number[]>([]);
  const [coords, setCoords] = useState({ x: -500, y: -500 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      mx.set(x);
      my.set(y);
      setCoords({ x, y });
      // light the 5 closest nodes
      const dists = NODES.map((n, i) => ({
        i,
        d: Math.hypot(n.x - (x / r.width) * 1200, n.y - (y / r.height) * 800),
      }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 6)
        .filter((n) => n.d < 320)
        .map((n) => n.i);
      setActive(dists);
    };
    const onLeave = () => {
      mx.set(-500);
      my.set(-500);
      setActive([]);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [mx, my]);

  // Glow halo
  const haloBg = useTransform(
    [sx, sy] as any,
    ([x, y]: number[]) =>
      `radial-gradient(180px circle at ${x}px ${y}px, oklch(0.78 0.13 85 / 0.18), transparent 70%)`,
  );

  return (
    <section id="about" className="relative bg-background">
      <div
        ref={wrapRef}
        className="relative overflow-hidden border-y border-foreground/5"
      >
        {/* Layer 1: ambient breathing grid */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        {/* Layer 2: PCB board SVG (1200x800 viewBox, scales) */}
        <svg
          aria-hidden
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 w-full h-full"
        >
          {/* base traces, low-opacity */}
          {TRACES.map((d, i) => (
            <path
              key={`base-${i}`}
              d={d}
              stroke="var(--color-accent)"
              strokeWidth="0.6"
              fill="none"
              opacity="0.18"
            />
          ))}
          {/* base pads */}
          {NODES.map((n, i) => (
            <g key={`bp-${i}`}>
              <circle cx={n.x} cy={n.y} r={n.r} stroke="var(--color-accent)" strokeWidth="0.6" fill="none" opacity="0.35" />
              <circle cx={n.x} cy={n.y} r={n.r - 2} fill="var(--color-background)" />
            </g>
          ))}
          {/* IC chips */}
          {CHIPS.map((c, i) => (
            <g key={`c-${i}`} opacity="0.5">
              <rect x={c.x} y={c.y} width={c.w} height={c.h} stroke="var(--color-accent)" strokeWidth="0.8" fill="oklch(0.10 0.004 240)" rx="2" />
              <text x={c.x + c.w / 2} y={c.y + c.h / 2 + 3} textAnchor="middle" fill="var(--color-accent)" fontSize="7" fontFamily="JetBrains Mono" opacity="0.7">{c.label}</text>
            </g>
          ))}

          {/* active highlight pass — animated traces & glowing pads */}
          {TRACES.map((d, i) => {
            const lit = active.some((a) => TRACE_NODES[i]?.includes(a));
            return (
              <motion.path
                key={`hl-${i}`}
                d={d}
                stroke="var(--color-accent-glow)"
                strokeWidth="1.2"
                fill="none"
                strokeLinecap="round"
                initial={false}
                animate={{ opacity: lit ? 1 : 0, pathLength: lit ? 1 : 0 }}
                transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
                style={{ pathLength: lit ? 1 : 0, filter: lit ? "drop-shadow(0 0 4px var(--color-accent))" : "none" }}
              />
            );
          })}
          {NODES.map((n, i) => {
            const lit = active.includes(i);
            return (
              <motion.circle
                key={`np-${i}`}
                cx={n.x}
                cy={n.y}
                r={n.r}
                fill="var(--color-accent)"
                initial={false}
                animate={{ opacity: lit ? 1 : 0, scale: lit ? 1 : 0.4 }}
                transition={{ duration: 0.35 }}
                style={{ transformOrigin: `${n.x}px ${n.y}px`, filter: lit ? "drop-shadow(0 0 6px var(--color-accent-glow))" : "none" }}
              />
            );
          })}

          {/* crosshair following cursor */}
          {coords.x > 0 && (
            <g style={{ transform: `translate(${(coords.x / (wrapRef.current?.clientWidth || 1)) * 1200}px, ${(coords.y / (wrapRef.current?.clientHeight || 1)) * 800}px)` }}>
              <circle r="14" stroke="var(--color-accent)" strokeWidth="0.6" fill="none" opacity="0.6" />
              <circle r="2" fill="var(--color-accent-glow)" />
              <line x1="-22" y1="0" x2="-16" y2="0" stroke="var(--color-accent)" strokeWidth="0.6" />
              <line x1="16" y1="0" x2="22" y2="0" stroke="var(--color-accent)" strokeWidth="0.6" />
              <line x1="0" y1="-22" x2="0" y2="-16" stroke="var(--color-accent)" strokeWidth="0.6" />
              <line x1="0" y1="16" x2="0" y2="22" stroke="var(--color-accent)" strokeWidth="0.6" />
            </g>
          )}
        </svg>

        {/* Layer 3: soldering iron halo */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden md:block"
          style={{ background: haloBg as any, mixBlendMode: "screen" }}
        />

        {/* Vignette */}
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{
          background: "radial-gradient(ellipse at center, transparent 30%, var(--color-background) 95%)",
        }} />

        {/* Content card */}
        <div className="relative px-6 md:px-12 py-28 md:py-44 max-w-5xl mx-auto">
          <div className="relative">
            {/* corner ticks */}
            <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />

            <div className="px-6 md:px-14 py-10 md:py-16">
              <div className="font-mono text-xs text-accent tracking-[0.4em] mb-8">
                [ ABOUT / NODE.001 ]
              </div>
              <h2 className="font-display uppercase text-4xl md:text-6xl lg:text-7xl leading-[0.95] text-foreground font-light">
                We build the <span className="text-accent italic font-serif">silent</span> hardware<br />
                behind loud ideas.
              </h2>
              <p className="font-serif text-lg md:text-2xl text-foreground/75 leading-relaxed mt-8 max-w-3xl">
                ELCS designs and manufactures future-ready embedded modules, control systems, and connectivity devices — precision-engineered, certified to standard, and ready to ship.
              </p>
              <p className="font-body text-foreground/55 mt-6 max-w-2xl">
                Plug-and-play modules, production-grade PCBs, and custom embedded solutions for engineers, makers, and industries that move fast.
              </p>

              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 border-t border-foreground/10 pt-10">
                {STATS.map((s) => (
                  <div key={s.k}>
                    <div className="font-display text-3xl md:text-4xl text-accent">{s.v}</div>
                    <div className="font-mono text-[10px] tracking-[0.25em] text-foreground/50 uppercase mt-2">{s.k}</div>
                  </div>
                ))}
              </div>

              <div className="font-mono text-[10px] tracking-[0.3em] text-foreground/40 uppercase mt-12 flex items-center gap-3">
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                MOVE CURSOR — TRACE THE BOARD
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const map = {
    tl: "top-0 left-0 border-t border-l",
    tr: "top-0 right-0 border-t border-r",
    bl: "bottom-0 left-0 border-b border-l",
    br: "bottom-0 right-0 border-b border-r",
  };
  return <span className={`absolute w-5 h-5 border-accent ${map[pos]}`} aria-hidden />;
}

const STATS = [
  { k: "MODULES SHIPPED", v: "12K+" },
  { k: "DESIGN ITERATIONS", v: "350" },
  { k: "COMPLIANCE", v: "RoHS" },
  { k: "UPTIME TARGET", v: "99.9" },
];

// PCB board geometry — coordinates in 1200x800 viewBox
const NODES = [
  { x: 120, y: 120, r: 5 }, { x: 320, y: 90, r: 5 }, { x: 540, y: 140, r: 5 },
  { x: 760, y: 110, r: 5 }, { x: 980, y: 150, r: 5 }, { x: 1100, y: 280, r: 5 },
  { x: 1080, y: 480, r: 5 }, { x: 940, y: 620, r: 5 }, { x: 720, y: 680, r: 5 },
  { x: 500, y: 640, r: 5 }, { x: 280, y: 700, r: 5 }, { x: 110, y: 560, r: 5 },
  { x: 90, y: 340, r: 5 }, { x: 380, y: 320, r: 5 }, { x: 640, y: 400, r: 5 },
  { x: 860, y: 350, r: 5 }, { x: 600, y: 240, r: 4 }, { x: 460, y: 500, r: 4 },
];

const TRACES = [
  "M120 120 L120 200 L320 200 L320 90",
  "M320 90 L540 90 L540 140",
  "M540 140 L640 140 L640 400",
  "M760 110 L760 200 L980 200 L980 150",
  "M980 150 L1100 150 L1100 280",
  "M1100 280 L1100 480 L1080 480",
  "M1080 480 L1080 580 L940 580 L940 620",
  "M940 620 L720 620 L720 680",
  "M720 680 L500 680 L500 640",
  "M500 640 L280 640 L280 700",
  "M280 700 L110 700 L110 560",
  "M110 560 L110 340 L90 340",
  "M90 340 L380 340 L380 320",
  "M380 320 L600 320 L600 240",
  "M640 400 L860 400 L860 350",
  "M460 500 L640 500 L640 400",
];

// Which node indices each trace connects (for highlight gating)
const TRACE_NODES = [
  [0, 1], [1, 2], [2, 14], [3, 4], [4, 5], [5, 6], [6, 7],
  [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 13],
  [13, 16], [14, 15], [17, 14],
];

const CHIPS = [
  { x: 420, y: 220, w: 90, h: 50, label: "MCU-32" },
  { x: 800, y: 460, w: 110, h: 60, label: "RF-MOD" },
  { x: 180, y: 420, w: 70, h: 40, label: "PMIC" },
];
