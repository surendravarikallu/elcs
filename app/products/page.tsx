import { createClient } from "@/lib/supabase/server";
import { SiteShell } from "@/components/SiteShell";
import { Footer } from "@/components/sections/Footer";
import { ProductCard } from "@/components/ProductCard";
import type { Category, Product } from "@/types/database";

export const metadata = {
  title: "Products — ELCS",
  description: "Embedded modules, custom PCBs, IoT devices, control systems and firmware solutions.",
};

// Revalidate every 60 s so the catalog stays fresh without a full rebuild
export const revalidate = 60;

async function getProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as Product[]) ?? [];
  } catch {
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    return (data as Category[]) ?? [];
  } catch {
    return [];
  }
}

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <SiteShell>
      <div className="min-h-screen bg-background text-foreground">
        {/* ── Hero header ── */}
        <div className="relative pt-32 pb-16 md:pt-40 md:pb-20 px-6 md:px-12 overflow-hidden">
          {/* Blueprint grid */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />
          <div aria-hidden className="absolute inset-0" style={{
            background: "radial-gradient(ellipse 70% 60% at 30% 60%, oklch(0.78 0.13 85 / 0.07), transparent 70%)",
          }} />

          <div className="relative max-w-7xl mx-auto">
            <div className="font-mono text-[10px] md:text-xs text-accent tracking-[0.5em] mb-4">
              [ PRODUCTS / CATALOG ]
            </div>
            <h1 className="font-display uppercase text-5xl md:text-7xl lg:text-8xl leading-[0.9] text-foreground font-light">
              Our Product<br />Range
            </h1>
            <p className="font-body text-foreground/55 mt-6 max-w-xl text-sm md:text-base">
              Precision-engineered embedded modules, control systems, and connectivity devices — certified, documented, and ready to ship.
            </p>
          </div>
        </div>

        {/* ── Catalog ── */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
          {products.length === 0 ? (
            <EmptyState />
          ) : (
            <CatalogGrid products={products} categories={categories} />
          )}
        </div>

        <Footer />
      </div>
    </SiteShell>
  );
}

// Client component for category filtering
import { CatalogGrid } from "./CatalogGrid";

function EmptyState() {
  return (
    <div className="py-32 flex flex-col items-center gap-4 text-center">
      <div className="font-mono text-[10px] tracking-[0.4em] text-accent">[ CATALOG EMPTY ]</div>
      <p className="font-display uppercase text-3xl text-foreground/30">No products yet</p>
      <p className="font-body text-sm text-foreground/40">Products will appear here once added via the admin panel.</p>
    </div>
  );
}
