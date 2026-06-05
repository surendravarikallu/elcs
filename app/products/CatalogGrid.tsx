"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ProductDetailsDrawer } from "@/components/ProductDetailsDrawer";
import { TactileAudio } from "@/components/ittalk/TactileAudio";
import type { Category, Product } from "@/types/database";

export function CatalogGrid({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const isProgrammaticScroll = useRef<boolean>(false);

  // ── Filter pipeline: category → search ──
  const categoryFiltered =
    activeSlug === null
      ? products
      : products.filter((p) => p.category?.slug === activeSlug);

  const q = searchQuery.trim().toLowerCase();
  const filtered = q
    ? categoryFiltered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.category?.name || "").toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q)) ||
          (p.short_description || "").toLowerCase().includes(q)
      )
    : categoryFiltered;

  const N = filtered.length;

  // Reset carousel position when category or search changes
  useEffect(() => {
    setActiveIndex(0);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [activeSlug, searchQuery]);

  const handleCategorySelect = (slug: string | null) => {
    TactileAudio.playClick();
    setActiveSlug(slug);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchClear = () => {
    TactileAudio.playClick();
    setSearchQuery("");
  };

  // Detect which card is currently active based on scroll position
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollLeft = container.scrollLeft;
    const children = Array.from(container.children) as HTMLElement[];
    if (children.length === 0) return;

    // Don't override index during programmatic (button/click) scrolls
    if (isProgrammaticScroll.current) return;

    let closestIndex = 0;
    let minDistance = Infinity;

    children.forEach((child, index) => {
      // Use center-to-center distance so snap-center alignment is accounted for
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const viewCenter = scrollLeft + container.offsetWidth / 2;
      const distance = Math.abs(childCenter - viewCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
    }
  }, [activeIndex]);

  // Handle binding of scroll event
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  // Desktop Mouse Drag-to-Scroll Mechanism
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      isDraggingRef.current = false;
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
      container.style.cursor = "grabbing";
    };

    const onMouseLeave = () => {
      isDown = false;
      container.style.cursor = "grab";
    };

    const onMouseUp = () => {
      isDown = false;
      container.style.cursor = "grab";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.4; // drag speed multiplier
      
      if (Math.abs(x - startX) > 8) {
        isDraggingRef.current = true;
      }
      container.scrollLeft = scrollLeft - walk;
    };

    container.addEventListener("mousedown", onMouseDown);
    container.addEventListener("mouseleave", onMouseLeave);
    container.addEventListener("mouseup", onMouseUp);
    container.addEventListener("mousemove", onMouseMove);

    // Initial cursor style
    container.style.cursor = "grab";

    return () => {
      container.removeEventListener("mousedown", onMouseDown);
      container.removeEventListener("mouseleave", onMouseLeave);
      container.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("mousemove", onMouseMove);
    };
  }, [filtered]);


  const handleOpenDrawer = (product: Product) => {
    TactileAudio.playClick();
    TactileAudio.playOpen();
    setSelectedProduct(product);
  };

  const handleCardClick = (idx: number, product: Product) => {
    if (isDraggingRef.current) {
      // It was a drag action, ignore click
      return;
    }
    
    if (idx === activeIndex) {
      handleOpenDrawer(product);
    } else {
      if (!scrollRef.current) return;
      const container = scrollRef.current;
      const children = Array.from(container.children) as HTMLElement[];
      const targetChild = children[idx];
      if (targetChild) {
        TactileAudio.playClick();
        isProgrammaticScroll.current = true;
        // Scroll so the target card is centered in the viewport
        const scrollTarget =
          targetChild.offsetLeft - (container.offsetWidth - targetChild.offsetWidth) / 2;
        container.scrollTo({
          left: scrollTarget,
          behavior: "smooth",
        });
        setActiveIndex(idx);
        // Re-enable scroll-tracking after animation settles
        setTimeout(() => { isProgrammaticScroll.current = false; }, 600);
      }
    }
  };

  // Compile categories count list
  const catItems = [
    { slug: null, name: "All", count: products.length },
    ...categories
      .map((cat) => {
        const count = products.filter((p) => p.category_id === cat.id).length;
        return { slug: cat.slug, name: cat.name, count };
      })
      .filter((cat) => cat.count > 0),
  ];

  const activeProduct = N > 0 ? filtered[activeIndex] : null;

  return (
    <div className="space-y-8">
      {/* ── Category filter switchboard panel ── */}
      <div className="flex flex-wrap gap-2 border-b border-foreground/10 pb-6 relative">
        {catItems.map((cat) => {
          const isActive = activeSlug === cat.slug;
          return (
            <button
              key={cat.slug ?? "all"}
              onClick={() => handleCategorySelect(cat.slug)}
              className={`relative px-4 py-2 font-mono text-[9px] tracking-[0.25em] uppercase cursor-pointer transition-colors duration-300 ${
                isActive ? "text-accent-glow font-medium" : "text-foreground/50 hover:text-foreground/80"
              }`}
            >
              {/* Sliding active glow capsule indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeCategoryCapsule"
                  className="absolute inset-0 border border-accent bg-accent/5"
                  transition={{ type: "spring", stiffness: 220, damping: 20 }}
                />
              )}
              <span className="relative z-10">{cat.name}</span>
              <span className="relative z-10 ml-2 opacity-50">({cat.count})</span>
            </button>
          );
        })}
      </div>

      {/* ── Search Bar ── */}
      <div className="relative">
        {/* Corner brackets */}
        <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-accent/50 pointer-events-none" />
        <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-accent/50 pointer-events-none" />
        <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-accent/50 pointer-events-none" />
        <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-accent/50 pointer-events-none" />

        <div className="flex items-center gap-3 border border-foreground/10 bg-card/60 px-4 py-3 focus-within:border-accent/40 transition-colors duration-300">
          {/* Search icon */}
          <svg
            className="w-3.5 h-3.5 text-accent/60 shrink-0"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="6.5" cy="6.5" r="5" />
            <line x1="10.5" y1="10.5" x2="14" y2="14" />
          </svg>

          <input
            type="search"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => TactileAudio.playHover()}
            placeholder="SEARCH MODULES, TAGS, CATEGORY…"
            className="flex-1 bg-transparent font-mono text-[10px] tracking-[0.2em] text-foreground/80 placeholder:text-foreground/25 outline-none appearance-none [&::-webkit-search-cancel-button]:hidden"
          />

          {/* Result count */}
          <span className="font-mono text-[9px] tracking-[0.2em] text-foreground/30 shrink-0">
            {N}/{products.length}
          </span>

          {/* Clear button */}
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                onClick={handleSearchClear}
                className="w-5 h-5 flex items-center justify-center border border-foreground/20 hover:border-accent hover:text-accent text-foreground/40 text-[10px] cursor-pointer transition-colors shrink-0"
              >
                ✕
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Scrollable Horizontal Carousel Deck ── */}
      {N === 0 ? (
        <div className="py-24 text-center font-mono text-xs text-foreground/35 border border-dashed border-border/30">
          {searchQuery
            ? `No modules matching "${searchQuery}" in this registry.`
            : "No hardware modules found in this channel registry."}
        </div>
      ) : (
        <div className="space-y-10">
          {/* Scroll Container */}
          <div
            ref={scrollRef}
            className="relative flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-6 md:gap-8 pb-4 scroll-smooth w-full select-none"
            style={{
              WebkitOverflowScrolling: "touch",
            }}
          >
            {filtered.map((product, idx) => {
              const isActive = idx === activeIndex;

              return (
                <div
                  key={product.id}
                  className="snap-center shrink-0 w-[280px] md:w-[420px] aspect-[4/5] flex items-center justify-center"
                >
                  <div
                    onClick={() => handleCardClick(idx, product)}
                    onMouseEnter={() => !isActive && TactileAudio.playHover()}
                    className={`relative w-full h-full cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] origin-center ${
                      isActive ? "scale-100 opacity-100" : "scale-90 opacity-50 hover:opacity-75"
                    }`}
                  >
                    <div className="w-full h-full bg-card rounded-[2.5rem] rounded-br-[7.5rem] overflow-hidden border border-border/20 shadow-lg relative group">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          draggable={false}
                          className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 transition-all duration-700 select-none pointer-events-none"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-background/25 opacity-20 select-none pointer-events-none">
                          <svg viewBox="0 0 80 60" className="w-12 h-10" fill="none" stroke="var(--color-accent)" strokeWidth="0.8">
                            <rect x="10" y="8" width="60" height="44" rx="2" />
                            <circle cx="55" cy="38" r="6" />
                          </svg>
                        </div>
                      )}

                      {/* Featured mini-indicator */}
                      {product.is_featured && isActive && (
                        <div className="absolute top-4 left-4 font-mono text-[7px] tracking-[0.35em] bg-accent text-accent-foreground px-2.5 py-1 rounded-sm shadow-md select-none pointer-events-none">
                          FEATURED
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Active Product Matter Text ── */}
          {activeProduct && (
            <div className="pt-8 border-t border-foreground/10 space-y-3">
              <div className="font-mono text-[9px] tracking-[0.3em] text-accent uppercase">
                [ {activeProduct.category?.name || "MODULE"} MODULE ]
              </div>
              
              <h1 className="font-display uppercase text-3xl md:text-5xl lg:text-6xl leading-none text-foreground font-light tracking-wide">
                {activeProduct.name}
              </h1>

              <p className="font-body text-xs md:text-sm text-foreground/55 leading-relaxed max-w-2xl">
                {activeProduct.short_description}
              </p>

              <div className="pt-2">
                <button
                  onClick={() => handleOpenDrawer(activeProduct)}
                  onMouseEnter={() => TactileAudio.playHover()}
                  className="group font-mono text-[9px] tracking-[0.25em] uppercase text-accent hover:text-accent-glow underline underline-offset-4 decoration-accent/40 cursor-pointer inline-flex items-center gap-2 transition-colors duration-300"
                >
                  SYSTEM SPECS &amp; INTEGRATION GUIDE
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">➔</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Technical Specs Slide-Out Drawer ── */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailsDrawer
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
