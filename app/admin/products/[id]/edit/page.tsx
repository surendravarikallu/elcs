import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "../../ProductForm";
import type { Category, Product } from "@/types/database";

export default async function EditProduct({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let product: Product | null = null;
  let categories: Category[] = [];

  try {
    const supabase = await createClient();
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from("products").select("*, category:categories(*)").eq("id", id).single(),
      supabase.from("categories").select("*").order("sort_order"),
    ]);
    product    = p as Product;
    categories = (c as Category[]) ?? [];
  } catch {}

  if (!product) notFound();

  return (
    <div className="max-w-2xl">
      <div className="font-mono text-[10px] text-accent tracking-[0.45em] mb-2">[ ADMIN / PRODUCTS / EDIT ]</div>
      <h1 className="font-display uppercase text-4xl md:text-5xl text-foreground mb-2">Edit Product</h1>
      <p className="font-mono text-[10px] text-foreground/35 mb-10">{product.slug}</p>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
