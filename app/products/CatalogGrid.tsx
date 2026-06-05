"use client";

import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { Category, Product } from "@/types/database";

export function CatalogGrid({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const filtered =
    activeSlug === null
      ? products
      : products.filter((p) => p.category?.slug === activeSlug);

  return (
    <div>
      {/* ── Category filter tabs ── */}
      <div className="flex flex-wrap gap-3 mb-10 border-b border-foreground/10 pb-8">
        <FilterTab
          label="All"
          active={activeSlug === null}
          onClick={() => setActiveSlug(null)}
          count={products.length}
        />
        {categories.map((cat) => {
          const n = products.filter((p) => p.category_id === cat.id).length;
          if (n === 0) return null;
          return (
            <FilterTab
              key={cat.slug}
              label={cat.name}
              active={activeSlug === cat.slug}
              onClick={() => setActiveSlug(activeSlug === cat.slug ? null : cat.slug)}
              count={n}
            />
          );
        })}
      </div>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center font-mono text-sm text-foreground/30">
          No products in this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterTab({
  label,
  active,
  onClick,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`font-mono text-[10px] tracking-[0.3em] uppercase px-4 py-2 border transition-all duration-200 ${
        active
          ? "border-accent text-accent bg-accent/5"
          : "border-foreground/15 text-foreground/50 hover:border-foreground/30 hover:text-foreground/70"
      }`}
    >
      {label}
      <span className="ml-2 opacity-50">{count}</span>
    </button>
  );
}
