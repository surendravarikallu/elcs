"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Product, Category } from "@/types/database";

const FILTERS = ["all", "published", "draft"] as const;

export function AdminProductsClient({
  products: initial,
}: {
  products: Product[];
  categories: Category[];
}) {
  const [products, setProducts] = useState(initial);
  const [filter, setFilter]     = useState<(typeof FILTERS)[number]>("all");
  const [busy, setBusy]         = useState<string | null>(null);

  const filtered = products.filter((p) =>
    filter === "all" ? true : filter === "published" ? p.is_published : !p.is_published
  );

  const togglePublish = async (p: Product) => {
    setBusy(p.id);
    const supabase = createClient();
    const { error } = await supabase.from("products").update({ is_published: !p.is_published }).eq("id", p.id);
    if (!error) setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, is_published: !x.is_published } : x));
    setBusy(null);
  };

  const deleteProduct = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    setBusy(p.id);
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (!error) setProducts((prev) => prev.filter((x) => x.id !== p.id));
    setBusy(null);
  };

  return (
    <div>
      {/* Filter bar */}
      <div className="flex gap-3 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`font-mono text-[10px] tracking-[0.3em] uppercase px-4 py-2 border transition-colors ${
              filter === f ? "border-accent text-accent" : "border-foreground/15 text-foreground/40 hover:border-foreground/30"
            }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto font-mono text-[10px] text-foreground/30 self-center">{filtered.length} items</span>
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center font-mono text-sm text-foreground/30">No products found.</div>
      ) : (
        <div className="border border-foreground/10 divide-y divide-foreground/5">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[3rem_1fr_7rem_3rem_6rem_8rem] gap-4 px-5 py-3 bg-card">
            {["IMG", "NAME / CATEGORY", "PRICE", "★", "STATUS", "ACTIONS"].map((h) => (
              <div key={h} className="font-mono text-[9px] tracking-[0.3em] text-foreground/35 uppercase">{h}</div>
            ))}
          </div>

          {filtered.map((p) => (
            <div
              key={p.id}
              className={`hover:bg-card/50 transition-colors ${busy === p.id ? "opacity-50 pointer-events-none" : ""}`}
            >
              {/* ── Mobile card ── */}
              <div className="md:hidden flex items-start gap-3 px-4 py-3">
                <div className="w-10 h-9 bg-secondary border border-foreground/10 overflow-hidden shrink-0 mt-0.5">
                  {p.image_url
                    ? <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-foreground/20 text-xs">—</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-display uppercase text-sm text-foreground truncate leading-tight">
                      {p.name}
                      {p.is_featured && <span className="ml-1.5 text-accent text-[10px]">★</span>}
                    </div>
                    <button
                      onClick={() => togglePublish(p)}
                      className={`shrink-0 font-mono text-[9px] tracking-[0.2em] px-2 py-0.5 border whitespace-nowrap transition-colors ${
                        p.is_published ? "border-accent/40 text-accent" : "border-foreground/15 text-foreground/30"
                      }`}
                    >
                      {p.is_published ? "LIVE" : "DRAFT"}
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="font-mono text-[10px] text-foreground/35 truncate">
                      {p.category?.name ?? "—"}
                      {p.price != null && <span className="ml-2 text-foreground/45">₹{p.price.toLocaleString("en-IN")}</span>}
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      <Link href={`/admin/products/${p.id}/edit`} className="font-mono text-[10px] text-foreground/45 hover:text-accent transition-colors">EDIT</Link>
                      <button onClick={() => deleteProduct(p)} className="font-mono text-[10px] text-foreground/25 hover:text-destructive transition-colors">DEL</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Desktop table row ── */}
              <div className="hidden md:grid grid-cols-[3rem_1fr_7rem_3rem_6rem_8rem] gap-4 items-center px-5 py-4">
                {/* Thumbnail */}
                <div className="w-12 h-10 bg-secondary border border-foreground/10 overflow-hidden shrink-0">
                  {p.image_url
                    ? <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-foreground/20 text-xs">—</div>
                  }
                </div>
                {/* Name + Category */}
                <div className="min-w-0">
                  <div className="font-display uppercase text-base text-foreground truncate">{p.name}</div>
                  <div className="font-mono text-[10px] text-foreground/35">{p.category?.name ?? "—"}</div>
                </div>
                {/* Price */}
                <div className="font-mono text-xs text-foreground/50 whitespace-nowrap">
                  {p.price != null ? `₹${p.price.toLocaleString("en-IN")}` : "—"}
                </div>
                {/* Featured */}
                <div className="font-mono text-[10px] text-foreground/30">{p.is_featured ? "★" : ""}</div>
                {/* Status toggle */}
                <button
                  onClick={() => togglePublish(p)}
                  className={`font-mono text-[9px] tracking-[0.25em] px-3 py-1 border whitespace-nowrap transition-colors ${
                    p.is_published ? "border-accent/40 text-accent hover:bg-accent/10" : "border-foreground/15 text-foreground/30 hover:border-foreground/30"
                  }`}
                >
                  {p.is_published ? "LIVE" : "DRAFT"}
                </button>
                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Link href={`/admin/products/${p.id}/edit`} className="font-mono text-[10px] text-foreground/50 hover:text-accent transition-colors">EDIT</Link>
                  <button onClick={() => deleteProduct(p)} className="font-mono text-[10px] text-foreground/30 hover:text-destructive transition-colors">DEL</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
