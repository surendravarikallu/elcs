"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ElcsLogo } from "./ElcsLogo";

const LINKS = [
  { label: "Home",     href: "/"         },
  { label: "iT Talk",  href: "/ittalk"  },
  { label: "Products", href: "/products" },
  { label: "Progress", href: "/progress" },
];

export function NavBar({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const spring = { type: "spring" as const, stiffness: 220, damping: 14 };

  const [visible, setVisible] = useState(true);
  const [atTop, setAtTop]     = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let accumulatedDistance = 0;

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setAtTop(currentScrollY < 8);

      const deltaY = currentScrollY - lastScrollY;

      if (currentScrollY < 8) {
        setVisible(true);
        accumulatedDistance = 0;
      } else {
        if (pathname === "/") {
          setVisible(true);
          accumulatedDistance = 0;
        } else {
          if ((deltaY > 0 && accumulatedDistance < 0) || (deltaY < 0 && accumulatedDistance > 0)) {
            accumulatedDistance = 0;
          }
          accumulatedDistance += deltaY;

          if (accumulatedDistance > 30) {
            setVisible(false);
            accumulatedDistance = 0;
          } else if (accumulatedDistance < -15) {
            setVisible(true);
            accumulatedDistance = 0;
          }
        }
      }

      lastScrollY = currentScrollY;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const headerAnimate = isDesktop
    ? {
        y: visible || open ? 0 : -120,
        width: atTop ? "100%" : "calc(100% - 3rem)",
        maxWidth: atTop ? "100%" : "896px",
        borderRadius: atTop ? "0px" : "9999px",
        top: atTop ? "0px" : "24px",
        paddingTop: atTop ? "20px" : "12px",
        paddingBottom: atTop ? "20px" : "12px",
        paddingLeft: atTop ? "40px" : "32px",
        paddingRight: atTop ? "40px" : "32px",
        backgroundColor: atTop
          ? "oklch(0 0 0 / 0)"
          : "oklch(0.08 0.003 240 / 0.8)",
        borderColor: atTop
          ? "oklch(0 0 0 / 0)"
          : "oklch(0.85 0.012 70 / 0.08)",
      }
    : {
        y: visible || open ? "0%" : "-100%",
        width: "100%",
        maxWidth: "100%",
        borderRadius: "0px",
        top: "0px",
        paddingTop: "20px",
        paddingBottom: "20px",
        paddingLeft: "24px",
        paddingRight: "24px",
        backgroundColor: atTop
          ? "oklch(0 0 0 / 0)"
          : "oklch(0.08 0.003 240 / 0.92)",
        borderColor: atTop
          ? "oklch(0 0 0 / 0)"
          : "oklch(0.85 0.012 70 / 0.08)",
      };

  return (
    <motion.header
      className="fixed left-1/2 -translate-x-1/2 z-[60] flex items-center justify-between transition-all duration-300"
      animate={headerAnimate}
      transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
      style={{
        borderWidth: "1px",
        borderStyle: "solid",
        backdropFilter: atTop ? "none" : "blur(16px)",
        WebkitBackdropFilter: atTop ? "none" : "blur(16px)",
      }}
    >
      {/* Logo */}
      <motion.div
        animate={{ opacity: open ? 0 : 1, pointerEvents: open ? "none" : "auto" }}
        transition={{ duration: 0.2 }}
      >
        <Link href="/">
          <ElcsLogo className="h-16 md:h-20 w-auto object-contain" />
        </Link>
      </motion.div>

      {/* Desktop Links (Centered in the Pill) */}
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-10 font-sans text-[14px] font-semibold tracking-[0.18em] uppercase">
        {LINKS.map((l) => {
          const isActive = l.href === "/" ? pathname === "/" : pathname?.startsWith(l.href);
          return (
            <Link
              key={l.label}
              href={l.href}
              className={`transition-colors duration-300 relative py-1 ${
                isActive
                  ? "text-accent-glow"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              {l.label}
              {isActive && (
                <motion.span
                  layoutId="nav-active-dot"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-glow"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Hamburger → X (Mobile only) */}
      <button
        onClick={onToggle}
        aria-label={open ? "Close menu" : "Open menu"}
        className="md:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-[6px] cursor-pointer rounded-sm transition-colors duration-200 hover:bg-foreground/5"
      >
        <motion.span
          className="block h-px w-7 bg-foreground"
          animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
          transition={spring}
        />
        <motion.span
          className="block h-px w-7 bg-foreground origin-center"
          animate={open ? { scaleX: 0, opacity: 0 } : { scaleX: 1, opacity: 1 }}
          transition={spring}
        />
        <motion.span
          className="block h-px w-7 bg-foreground"
          animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
          transition={spring}
        />
      </button>

      {/* Desktop Right side spacing/CTA placeholder to balance layout */}
      <div className="hidden md:block w-10" />
    </motion.header>
  );
}
