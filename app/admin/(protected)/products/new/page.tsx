import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "../ProductForm";
import type { Category } from "@/types/database";

export default async function NewProduct() {
  let categories: Category[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    categories = (data as Category[]) ?? [];
  } catch {}

  return (
    <div className="max-w-5xl">
      <div className="font-mono text-[10px] text-accent tracking-[0.45em] mb-2">[ ADMIN / PRODUCTS / NEW ]</div>
      <h1 className="font-display uppercase text-4xl md:text-5xl text-foreground mb-10">Add Product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
