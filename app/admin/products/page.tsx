import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminProductsClient } from "./AdminProductsClient";
import type { Product, Category } from "@/types/database";

export default async function AdminProducts() {
  let products: Product[] = [];
  let categories: Category[] = [];

  try {
    const supabase = await createClient();
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from("products").select("*, category:categories(*)").order("sort_order").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("sort_order"),
    ]);
    products   = (p as Product[])   ?? [];
    categories = (c as Category[]) ?? [];
  } catch {}

  return (
    <div className="max-w-6xl">
      <div className="flex items-start justify-between mb-10">
        <div>
          <div className="font-mono text-[10px] text-accent tracking-[0.45em] mb-2">[ ADMIN / PRODUCTS ]</div>
          <h1 className="font-display uppercase text-4xl md:text-5xl text-foreground">Products</h1>
        </div>
        <Link
          href="/admin/products/new"
          className="font-mono text-[10px] tracking-[0.3em] px-6 py-3 border border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground transition-colors uppercase self-end"
        >
          + Add Product
        </Link>
      </div>

      <AdminProductsClient products={products} categories={categories} />
    </div>
  );
}
