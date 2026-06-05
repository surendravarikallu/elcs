import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export function Preloader({ onComplete }: { onComplete?: () => void }) {
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<"count" | "logo" | "curtain" | "done">("count");

  // Lock scroll while preloader is visible, release the instant we're done.
  useEffect(() => {
    if (phase === "done") {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      return;
    }
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "count") return;
    const start = performance.now();
    const dur = 1400;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setCount(Math.floor(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setPhase("logo"), 150);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  useEffect(() => {
    if (phase === "logo") {
      const t = setTimeout(() => setPhase("curtain"), 1400);
      return () => clearTimeout(t);
    }
    if (phase === "curtain") {
      const t = setTimeout(() => { setPhase("done"); onComplete?.(); }, 700);
      return () => clearTimeout(t);
    }
  }, [phase, onComplete]);

  const stroke = "var(--color-accent)";

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-[100] bg-background flex items-center justify-center"
          initial={{ y: 0 }}
          animate={phase === "curtain" ? { y: "-100%" } : { y: 0 }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
            <AnimatePresence>
              {phase === "count" && (
                <motion.div
                  key="count"
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="font-mono text-foreground/90 text-4xl md:text-5xl tabular-nums"
                >
                  {String(count).padStart(3, "0")}
                </motion.div>
              )}
            </AnimatePresence>
            {phase !== "count" && (
              <motion.svg
                viewBox="0 0 100 100"
                className="absolute inset-0 w-full h-full"
                fill="none"
                stroke={stroke}
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Outer ring — draws first */}
                <motion.circle
                  cx="50" cy="50" r="46"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.9, ease: "easeInOut" }}
                />
                {/* Four traces stagger-draw */}
                {[
                  "M30 24 V40 H50",
                  "M50 36 V78",
                  "M64 36 V52 H50",
                  "M30 58 V70 H42",
                ].map((d, i) => (
                  <motion.path
                    key={d}
                    d={d}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.7, ease: "easeInOut", delay: 0.5 + i * 0.12 }}
                  />
                ))}
                {/* Terminal nodes fade in after traces */}
                {[
                  ["30", "22", "3.5"],
                  ["50", "34", "5"],
                  ["64", "34", "3.5"],
                  ["30", "56", "3.5"],
                ].map(([cx, cy, r], i) => (
                  <motion.circle
                    key={`${cx}-${cy}`}
                    cx={cx} cy={cy} r={r}
                    fill="none"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 1.15 + i * 0.08 }}
                    style={{ transformOrigin: `${cx}px ${cy}px` }}
                  />
                ))}
              </motion.svg>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
