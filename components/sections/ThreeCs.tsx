"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";

/**
 * ThreeCs — Scroll-orbit reveal.
 * Sticky stage. Closed tetrahedron pyramid in center.
 * As scrollYProgress advances, pyramid spins and each face glows gold while
 * the matching card spirals around it.
 */

const BLOCKS = [
  {
    id: "connect",
    n: "01",
    title: "CONNECT",
    sub: "Network fabric",
    body: "We bridge hardware, firmware, and the network — making integration feel native. Standardized interfaces, documented protocols, connectivity stacks built for production.",
    metrics: ["BLE 5.4", "LoRaWAN", "MQTT", "TLS 1.3"],
  },
  {
    id: "control",
    n: "02",
    title: "CONTROL",
    sub: "Signal path",
    body: "Deterministic execution from sensor to actuator. Closed-loop pipelines, real-time scheduling, predictable IO behavior under load.",
    metrics: ["<1ms JITTER", "PID/FOC", "RTOS", "ISO 26262"],
  },
  {
    id: "caresure",
    n: "03",
    title: "CARESURE",
    sub: "Longevity",
    body: "Lifecycle support that ships with the silicon. Certification trails, traceable BOMs, engineering escalation that keeps the system alive in the field.",
    metrics: ["10YR SUPPLY", "BOM TRACE", "OTA", "RMA <72H"],
  },
];

// Tetrahedron face tilt — angle between each side face and the vertical Y axis.
const TILT_DEG = 32;

export function ThreeCs() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    // 360vh = 120vh per card — gives enough scroll time to see each one fully
    <section ref={ref} id="three-cs" className="relative h-[360vh] bg-background">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <Stage progress={scrollYProgress} />
      </div>
    </section>
  );
}

function Stage({ progress }: { progress: MotionValue<number> }) {
  const rotateY = useTransform(progress, [0, 1], [-10, 360]);
  const rotateX = useTransform(progress, [0, 0.5, 1], [-4, 0, -4]);

  return (
    <div className="relative h-full w-full flex items-center justify-center">
      {/* blueprint grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at 50% 55%, oklch(0.78 0.13 85 / 0.10), transparent 55%)",
          opacity: useTransform(progress, [0, 0.5, 1], [0.4, 1, 0.6]),
        }}
      />

      {/* progress rail (left) — hidden on mobile */}
      <div className="hidden md:block absolute left-10 top-1/2 -translate-y-1/2 h-[60vh] w-px bg-foreground/10">
        <motion.div
          className="absolute left-0 top-0 w-px bg-accent"
          style={{ height: useTransform(progress, [0, 1], ["0%", "100%"]) }}
        />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute -left-[3px] w-[7px] h-[7px] border border-accent/60 bg-background"
            style={{ top: `${(i / 2) * 100}%` }}
          />
        ))}
      </div>

      {/* Section title */}
      <div className="absolute top-10 md:top-16 left-1/2 -translate-x-1/2 text-center px-4 w-full">
        <div className="font-mono text-[10px] md:text-xs text-accent tracking-[0.4em] md:tracking-[0.5em] mb-2 md:mb-3">[ THE 3 Cs / SYSTEM-PILLARS ]</div>
        <div className="font-display uppercase text-foreground/40 text-xs md:text-sm tracking-[0.3em] md:tracking-[0.4em]">Connect &middot; Control &middot; CareSure</div>
      </div>

      {/* Pyramid — closed tetrahedron */}
      <div
        className="relative w-[320px] h-[320px] md:w-[520px] md:h-[520px] [--pyramid-offset-y:-5.4px] md:[--pyramid-offset-y:94.6px]"
        style={{ perspective: 1600 }}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",
            rotateY,
            rotateX,
          }}
        >
          <Pyramid3D progress={progress} />
          {/* Orbiting cards inside the 3D preserve-3d container */}
          {BLOCKS.map((b, i) => (
            <OrbitCard key={b.id} index={i} block={b} rotateY={rotateY} />
          ))}
        </motion.div>
      </div>

      {/* scroll prompt — animated line only, no text */}
      <motion.div
        className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        style={{ opacity: useTransform(progress, [0, 0.08], [1, 0]) }}
      >
        <motion.span
          className="block w-px h-7 bg-accent/50"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
        />
      </motion.div>

      <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 font-mono text-[9px] md:text-[10px] tracking-[0.4em] md:tracking-[0.5em] text-foreground/30 uppercase">
        #ConnectTogether
      </div>
    </div>
  );
}

function Pyramid3D({ progress }: { progress: MotionValue<number> }) {
  // Each face peaks exactly when its orbit card is held centre-screen
  const faceA = useTransform(progress, [0, 0.15, 0.30, 1], [0, 1, 0, 0]);
  const faceB = useTransform(progress, [0, 0.30, 0.48, 0.63, 1], [0, 0, 1, 0, 0]);
  const faceC = useTransform(progress, [0, 0.63, 0.81, 1], [0, 0, 1, 0]);

  const H = 260;
  const halfBase = 150;
  const tiltRad = (TILT_DEG * Math.PI) / 180;
  const baseY = H * Math.cos(tiltRad);
  const baseR = H * Math.sin(tiltRad);

  return (
    <div
      className="absolute inset-0"
      style={{ transformStyle: "preserve-3d", transform: "translateY(var(--pyramid-offset-y, 94.6px))" }}
    >
      {/* 3 side faces */}
      <Face glow={faceA} rotateY={0} H={H} halfBase={halfBase} tilt={TILT_DEG} />
      <Face glow={faceB} rotateY={120} H={H} halfBase={halfBase} tilt={TILT_DEG} />
      <Face glow={faceC} rotateY={240} H={H} halfBase={halfBase} tilt={TILT_DEG} />

      {/* Base ring */}
      <div
        className="absolute left-1/2 top-0"
        style={{
          transform: `translate(-50%, ${baseY}px) rotateX(90deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        <svg
          viewBox={`${-baseR * 1.4} ${-baseR * 1.4} ${baseR * 2.8} ${baseR * 2.8}`}
          width={baseR * 2.8}
          height={baseR * 2.8}
          style={{ marginLeft: -baseR * 1.4, marginTop: -baseR * 1.4 }}
        >
          {(() => {
            const Rc = baseR / Math.cos(Math.PI / 6);
            const pts = [0, 1, 2]
              .map((i) => {
                const a = (-Math.PI / 2) + (i * 2 * Math.PI) / 3;
                return `${Math.cos(a) * Rc},${Math.sin(a) * Rc}`;
              })
              .join(" ");
            return (
              <>
                <polygon points={pts} fill="none" stroke="var(--color-accent)" strokeWidth="1" opacity="0.5" />
                <circle cx="0" cy="0" r={Rc} fill="none" stroke="var(--color-foreground)" strokeWidth="0.5" opacity="0.1" />
                {[0, 1, 2].map((i) => {
                  const a = (-Math.PI / 2) + (i * 2 * Math.PI) / 3;
                  return <circle key={i} cx={Math.cos(a) * Rc} cy={Math.sin(a) * Rc} r="4" fill="var(--color-accent)" />;
                })}
              </>
            );
          })()}
        </svg>
      </div>

      {/* Apex glow dot */}
      <div
        className="absolute left-1/2 top-0"
        style={{ transform: "translate(-50%, -50%)" }}
      >
        <div
          className="w-2.5 h-2.5 rounded-full bg-accent-glow"
          style={{ boxShadow: "0 0 18px var(--color-accent-glow), 0 0 36px var(--color-accent)" }}
        />
      </div>
    </div>
  );
}

function Face({
  glow,
  rotateY,
  H,
  halfBase,
  tilt,
}: {
  glow: MotionValue<number>;
  rotateY: number;
  H: number;
  halfBase: number;
  tilt: number;
}) {
  const opacity = useTransform(glow, (v) => 0.3 + v * 0.55);
  const fillOpacity = useTransform(glow, (v) => 0.04 + v * 0.18);
  const stroke = useTransform(glow, (v) => (v > 0.4 ? "var(--color-accent-glow)" : "var(--color-accent)"));
  const filter = useTransform(glow, (v) =>
    v > 0.4 ? `drop-shadow(0 0 ${8 + v * 20}px var(--color-accent-glow))` : "none",
  );

  const pad = 40;
  const vbW = halfBase * 2 + pad * 2;
  const vbH = H + pad * 2;

  return (
    <div
      className="absolute left-1/2 top-0"
      style={{
        transform: `translate(-50%, 0) rotateY(${rotateY}deg) rotateX(${tilt}deg)`,
        transformStyle: "preserve-3d",
        transformOrigin: "50% 0",
        width: vbW,
        height: vbH,
        marginLeft: 0,
      }}
    >
      <motion.svg
        viewBox={`${-vbW / 2} ${-pad} ${vbW} ${vbH}`}
        width={vbW}
        height={vbH}
        style={{ opacity, filter, overflow: "visible", display: "block", marginLeft: -vbW / 2 + vbW / 2 }}
      >
        <motion.polygon
          points={`0,0 ${halfBase},${H} ${-halfBase},${H}`}
          fill="var(--color-accent)"
          style={{ fillOpacity }}
          stroke={stroke as never}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        {/* internal traces */}
        <line x1="0" y1="0" x2="0" y2={H} stroke="var(--color-accent)" strokeWidth="0.4" opacity="0.35" />
        <line x1={-halfBase} y1={H} x2={halfBase * 0.5} y2={H * 0.4} stroke="var(--color-accent)" strokeWidth="0.4" opacity="0.25" />
        <line x1={halfBase} y1={H} x2={-halfBase * 0.5} y2={H * 0.4} stroke="var(--color-accent)" strokeWidth="0.4" opacity="0.25" />
        <circle cx={-halfBase} cy={H} r="3" fill="var(--color-accent)" />
        <circle cx={halfBase} cy={H} r="3" fill="var(--color-accent)" />
      </motion.svg>
    </div>
  );
}

function OrbitCard({
  index,
  block,
  rotateY,
}: {
  index: number;
  block: (typeof BLOCKS)[number];
  rotateY: MotionValue<number>;
}) {
  const angle = index * -120;

  // Counter Y rotation so the cards always face the camera
  const transform = useTransform(rotateY, (rY) => {
    return `translate(-50%, -50%) rotateY(${angle}deg) translateZ(var(--card-r, 340px)) rotateY(${-angle - rY}deg) translateY(var(--card-y, 0px))`;
  });

  // Calculate opacity based on depth (cosine of world angle)
  // Back faces are transparent/dimmer, active face is fully opaque
  const opacity = useTransform(rotateY, (rY) => {
    const worldAngleRad = ((rY + angle) * Math.PI) / 180;
    const cosVal = Math.cos(worldAngleRad); // -1 to 1
    return 0.25 + 0.75 * (cosVal + 1) / 2;
  });

  // Calculate scale based on depth to create 3D distance perspective
  const scale = useTransform(rotateY, (rY) => {
    const worldAngleRad = ((rY + angle) * Math.PI) / 180;
    const cosVal = Math.cos(worldAngleRad); // -1 to 1
    return 0.82 + 0.18 * (cosVal + 1) / 2;
  });

  return (
    <>
      {/* Desktop */}
      <motion.div
        className="hidden md:block absolute left-1/2 top-1/2 [--card-r:340px] [--card-y:0px] pointer-events-auto z-10"
        style={{ transform, opacity, scale, transformStyle: "preserve-3d" }}
      >
        <CardBody block={block} wide />
      </motion.div>
      {/* Mobile */}
      <motion.div
        className="md:hidden absolute left-1/2 top-1/2 [--card-r:185px] [--card-y:170px] pointer-events-auto z-10"
        style={{ transform, opacity, scale, transformStyle: "preserve-3d" }}
      >
        <CardBody block={block} />
      </motion.div>
    </>
  );
}

function CardBody({ block, wide = false }: { block: (typeof BLOCKS)[number]; wide?: boolean }) {
  return (
    <div
      className={`relative ${wide ? "w-[360px] p-7" : "w-[280px] p-5"} bg-card/95 border border-accent/30`}
      style={{ boxShadow: "0 20px 60px -20px oklch(0.78 0.13 85 / 0.35)" }}
    >
      <span className="absolute -top-px -left-px w-4 h-4 border-t border-l border-accent" />
      <span className="absolute -top-px -right-px w-4 h-4 border-t border-r border-accent" />
      <span className="absolute -bottom-px -left-px w-4 h-4 border-b border-l border-accent" />
      <span className="absolute -bottom-px -right-px w-4 h-4 border-b border-r border-accent" />

      <div className="flex items-center justify-between mb-3">
        <div className="font-mono text-[10px] tracking-[0.4em] text-accent">[ {block.n} ]</div>
        <div className="font-mono text-[9px] md:text-[10px] tracking-[0.3em] text-foreground/40 uppercase">{block.sub}</div>
      </div>
      <h3 className={`font-display uppercase ${wide ? "text-5xl" : "text-3xl"} text-foreground font-light leading-none mb-3`}>
        {block.title}
      </h3>
      <p className={`font-body ${wide ? "text-sm" : "text-xs"} text-foreground/70 leading-relaxed mb-4`}>{block.body}</p>
      <div className="flex flex-wrap gap-1.5 pt-3 border-t border-foreground/10">
        {block.metrics.map((m) => (
          <span key={m} className="font-mono text-[9px] tracking-[0.2em] px-2 py-1 border border-accent/30 text-accent/90">
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}
