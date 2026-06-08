"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client"; // kept for fallback fetch
import type { CarouselSlide } from "@/types/database";

/* ── Smooth ease-in-out — gentle start, gentle finish ── */
const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];
const DURATION = 0.78;
const DRAG_THRESHOLD = 40; // px to register as swipe

// slides prop: null = parent still fetching, array = ready (use it, skip own fetch)
export function Carousel({ slides: propSlides }: { slides?: CarouselSlide[] | null }) {
  const [slides,    setSlides]    = useState<CarouselSlide[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [current,   setCurrent]   = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [paused,    setPaused]    = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Use pre-fetched slides from parent (images already warming in cache) ── */
  useEffect(() => {
    if (propSlides !== null && propSlides !== undefined) {
      setSlides(propSlides);
      setLoading(false);
      return;
    }
    // Fallback: fetch ourselves if no prop provided
    const sb = createClient();
    sb.from("carousel_slides")
      .select("*")
      .eq("is_published", true)
      .order("sort_order")
      .then(({ data }) => {
        setSlides((data as CarouselSlide[]) ?? []);
        setLoading(false);
      });
  }, [propSlides]);

  /* ── Navigation helpers ── */
  const go = useCallback((idx: number, dir: 1 | -1) => {
    setDirection(dir);
    setCurrent(idx);
  }, []);

  const prev = useCallback(() => {
    setSlides((sl) => {
      go((current - 1 + sl.length) % sl.length, -1);
      return sl;
    });
  }, [current, go]);

  const next = useCallback(() => {
    setSlides((sl) => {
      go((current + 1) % sl.length, 1);
      return sl;
    });
  }, [current, go]);

  /* ── Auto-advance ── */
  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    timerRef.current = setInterval(() => {
      setCurrent((c) => {
        setDirection(1);
        return (c + 1) % slides.length;
      });
    }, 6000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slides.length, paused]);

  /* ── Keyboard nav ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next]);

  if (loading) return (
    <div className="h-[60vh] md:h-[75vh] w-full bg-card/40 animate-pulse" />
  );
  if (slides.length === 0) return null;

  const slide = slides[current];

  return (
    <section
      id="top"
      className="relative h-[60vh] md:h-[75vh] w-full overflow-hidden bg-background select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Slide layer (image + gradients) ── */}
      <AnimatePresence mode="sync" initial={false} custom={direction}>
        <motion.div
          key={slide.id}
          custom={direction}
          variants={{
            enter:  (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 1 }),
            center: { x: "0%",   opacity: 1 },
            exit:   (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 1 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: DURATION, ease: EASE }}
          /* ── Touch / drag swipe ── */
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.08}
          onDragEnd={(_e, info) => {
            if (info.offset.x < -DRAG_THRESHOLD) next();
            else if (info.offset.x > DRAG_THRESHOLD) prev();
          }}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
          {slide.image_url ? (
            <img
              src={slide.image_url}
              alt={slide.title}
              className="w-full h-full object-cover object-center"
              draggable={false}
            />
          ) : (
            /* Fallback: pure gradient when no image */
            <div className="w-full h-full bg-gradient-to-br from-card via-background to-card" />
          )}

          {/* Left-heavy dark gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/10" />
          {/* Bottom vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* ── Text content ── */}
      <div className="relative h-full flex flex-col justify-end pb-10 md:pb-16 px-5 md:px-14 max-w-[680px] pointer-events-none">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={slide.id + "-copy"}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, delay: 0.12, ease: "easeOut" }}
          >
            {/* Badge */}
            {slide.badge && (
              <div className="font-mono text-[8px] md:text-[10px] tracking-[0.45em] text-accent uppercase mb-3 md:mb-4">
                [ {slide.badge} ]
              </div>
            )}

            {/* Title */}
            <h2 className="font-display uppercase text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground font-light leading-[1.05] mb-3 md:mb-5">
              {slide.title}
            </h2>

            {/* Description — hidden on very small screens to save space */}
            {slide.description && (
              <p className="hidden sm:block font-body text-xs md:text-sm text-foreground/60 leading-relaxed max-w-[460px] mb-5 md:mb-7">
                {slide.description}
              </p>
            )}

            {/* CTA */}
            {slide.cta_label && slide.cta_url && (
              <Link
                href={slide.cta_url}
                className="pointer-events-auto inline-block font-mono text-[9px] md:text-[10px] tracking-[0.3em] uppercase px-5 py-2.5 md:px-6 md:py-3 border border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground transition-all"
              >
                {slide.cta_label} →
              </Link>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Arrows — desktop only (mobile uses drag) ── */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="flex absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-8 h-8 md:w-9 md:h-9 border border-foreground/25 text-foreground/50 hover:border-accent hover:text-accent items-center justify-center transition-all font-mono z-10"
          >
            ←
          </button>

          <button
            onClick={next}
            aria-label="Next slide"
            className="flex absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-8 h-8 md:w-9 md:h-9 border border-foreground/25 text-foreground/50 hover:border-accent hover:text-accent items-center justify-center transition-all font-mono z-10"
          >
            →
          </button>

          {/* Progress lines + counter */}
          <div className="absolute bottom-4 md:bottom-6 left-5 md:left-14 flex items-center gap-2 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => go(i, i > current ? 1 : -1)}
                className={`h-px transition-all duration-500 ${
                  i === current
                    ? "w-8 md:w-10 bg-accent"
                    : "w-3 md:w-4 bg-foreground/30 hover:bg-foreground/55"
                }`}
              />
            ))}
            <span className="ml-1 font-mono text-[8px] md:text-[9px] text-foreground/35 tracking-[0.2em]">
              {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
            </span>
          </div>

        </>
      )}
    </section>
  );
}
