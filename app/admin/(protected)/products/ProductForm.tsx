"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Category, Product } from "@/types/database";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** If a slug collision occurs, append -2, -3 … until unique */
async function resolveSlug(base: string, currentId?: string): Promise<string> {
  const supabase = createClient();
  let candidate = base;
  let n = 2;
  while (true) {
    const query = supabase.from("products").select("id").eq("slug", candidate);
    const { data } = await query;
    const clash = (data ?? []).find((r: { id: string }) => r.id !== currentId);
    if (!clash) return candidate;
    candidate = `${base}-${n++}`;
  }
}

interface Props {
  categories: Category[];
  product?: Product;
}

export function ProductForm({ categories, product }: Props) {
  const router = useRouter();
  const isEdit = !!product;
  const imageInputRef = useRef<HTMLInputElement>(null);
  const manualInputRef = useRef<HTMLInputElement>(null);

  const [name,        setName]        = useState(product?.name ?? "");
  const [slug,        setSlug]        = useState(product?.slug ?? "");
  const [categoryId,  setCategoryId]  = useState(product?.category_id ?? "");
  const [shortDesc,   setShortDesc]   = useState(product?.short_description ?? "");
  const [desc,        setDesc]        = useState(product?.description ?? "");
  const [price,       setPrice]       = useState(product?.price?.toString() ?? "");
  const [imageUrl,    setImageUrl]    = useState(product?.image_url ?? "");
  const [manualUrl,   setManualUrl]   = useState(product?.manual_url ?? "");
  const [tagsRaw,     setTagsRaw]     = useState(product?.tags.join(", ") ?? "");
  const [isPublished, setIsPublished] = useState(product?.is_published ?? true);
  const [isFeatured,  setIsFeatured]  = useState(product?.is_featured ?? false);
  const [specsRaw,    setSpecsRaw]    = useState(
    Object.entries(product?.specs ?? {}).map(([k, v]) => `${k}: ${v}`).join("\n")
  );

  const [saving,       setSaving]       = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [errorMsg,     setErrorMsg]     = useState("");

  const handleNameChange = (v: string) => {
    setName(v);
    if (!isEdit) setSlug(slugify(v));
  };

  /* ── Image upload to Supabase storage ── */
  const handleImageUpload = async (file: File) => {
    setUploadingImg(true);
    setErrorMsg("");
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `products/${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
    if (error) { setErrorMsg(`Image upload failed: ${error.message}`); setUploadingImg(false); return; }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setImageUrl(data.publicUrl);
    setUploadingImg(false);
  };

  /* ── PDF / datasheet upload ── */
  const handleManualUpload = async (file: File) => {
    setUploadingPdf(true);
    setErrorMsg("");
    const supabase = createClient();
    const path = `datasheets/${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}.pdf`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true, contentType: "application/pdf" });
    if (error) { setErrorMsg(`PDF upload failed: ${error.message}`); setUploadingPdf(false); return; }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setManualUrl(data.publicUrl);
    setUploadingPdf(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSaving(true);

    // Parse specs
    const specs: Record<string, string> = {};
    specsRaw.split("\n").forEach((line) => {
      const [k, ...rest] = line.split(":");
      if (k?.trim() && rest.length) specs[k.trim()] = rest.join(":").trim();
    });

    // Auto-resolve slug — never let a collision reach the DB
    const baseSlug = slug.trim() || slugify(name);
    const resolvedSlug = await resolveSlug(baseSlug, isEdit ? product!.id : undefined);

    const payload = {
      name:              name.trim(),
      slug:              resolvedSlug,
      category_id:       categoryId || null,
      short_description: shortDesc.trim() || null,
      description:       desc.trim() || null,
      price:             price ? parseFloat(price) : null,
      image_url:         imageUrl.trim() || null,
      manual_url:        manualUrl.trim() || null,
      tags:              tagsRaw.split(",").map((t) => t.trim()).filter(Boolean),
      specs,
      is_published:      isPublished,
      is_featured:       isFeatured,
    };

    const supabase = createClient();
    let error;

    if (isEdit) {
      ({ error } = await supabase.from("products").update(payload).eq("id", product!.id));
    } else {
      ({ error } = await supabase.from("products").insert(payload));
    }

    setSaving(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    // Update slug field so user sees the resolved one
    setSlug(resolvedSlug);
    router.push("/admin/products");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Name + Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Product Name *">
          <input
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            placeholder="e.g. ESP32 Core Module"
            className="w-full bg-transparent border-0 border-b border-foreground/20 pb-2 font-body text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-accent transition-colors"
          />
        </Field>
        <Field label="Slug (auto-generated, collision-safe)">
          <input
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            required
            placeholder="auto-generated"
            className="w-full bg-transparent border-0 border-b border-foreground/20 pb-2 font-mono text-sm text-foreground/60 placeholder:text-foreground/25 focus:outline-none focus:border-accent transition-colors"
          />
        </Field>
      </div>

      {/* Category + Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Category">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full bg-background border-0 border-b border-foreground/20 pb-2 font-body text-foreground focus:outline-none focus:border-accent transition-colors"
          >
            <option value="">— None —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Price (₹) — blank = Contact for Price">
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 2499"
            className="w-full bg-transparent border-0 border-b border-foreground/20 pb-2 font-body text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-accent transition-colors"
          />
        </Field>
      </div>

      {/* Short description */}
      <Field label="Short Description (shown on catalog card)">
        <input
          value={shortDesc}
          onChange={(e) => setShortDesc(e.target.value)}
          placeholder="One-liner describing the product"
          className="w-full bg-transparent border-0 border-b border-foreground/20 pb-2 font-body text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-accent transition-colors"
        />
      </Field>

      {/* Long description */}
      <Field label="Full Description">
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={4}
          placeholder="Detailed product description..."
          className="w-full bg-transparent border border-foreground/10 p-3 font-body text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-accent transition-colors resize-y"
        />
      </Field>

      {/* Image */}
      <Field label="Product Image">
        {/* Hidden file input */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }}
        />
        <div className="flex items-center gap-3 mb-3">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://... or upload below"
            className="flex-1 bg-transparent border-0 border-b border-foreground/20 pb-2 font-body text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-accent transition-colors"
          />
          <button
            type="button"
            disabled={uploadingImg}
            onClick={() => imageInputRef.current?.click()}
            className="shrink-0 font-mono text-[9px] tracking-[0.25em] uppercase px-3 py-1.5 border border-foreground/20 text-foreground/50 hover:border-accent hover:text-accent transition-colors disabled:opacity-40"
          >
            {uploadingImg ? "UPLOADING…" : "↑ UPLOAD"}
          </button>
        </div>
        {imageUrl && (
          <div className="relative inline-block">
            <img src={imageUrl} alt="preview" className="h-24 w-auto border border-foreground/10 object-contain bg-card" />
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="absolute -top-2 -right-2 w-5 h-5 bg-background border border-foreground/20 text-foreground/50 hover:text-destructive text-[10px] flex items-center justify-center transition-colors"
            >✕</button>
          </div>
        )}
      </Field>

      {/* Datasheet / Manual PDF */}
      <Field label="Datasheet / Manual (PDF)">
        <input
          ref={manualInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleManualUpload(f); }}
        />
        <div className="flex items-center gap-3">
          <input
            type="url"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://... or upload PDF"
            className="flex-1 bg-transparent border-0 border-b border-foreground/20 pb-2 font-body text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-accent transition-colors"
          />
          <button
            type="button"
            disabled={uploadingPdf}
            onClick={() => manualInputRef.current?.click()}
            className="shrink-0 font-mono text-[9px] tracking-[0.25em] uppercase px-3 py-1.5 border border-foreground/20 text-foreground/50 hover:border-accent hover:text-accent transition-colors disabled:opacity-40"
          >
            {uploadingPdf ? "UPLOADING…" : "↑ UPLOAD"}
          </button>
        </div>
        {manualUrl && (
          <div className="flex items-center gap-2 mt-2">
            <span className="font-mono text-[9px] text-foreground/40">PDF linked</span>
            <a href={manualUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-[9px] text-accent hover:underline">preview ↗</a>
            <button type="button" onClick={() => setManualUrl("")} className="font-mono text-[9px] text-foreground/30 hover:text-destructive transition-colors">remove</button>
          </div>
        )}
      </Field>

      {/* Tags */}
      <Field label="Tags (comma separated)">
        <input
          value={tagsRaw}
          onChange={(e) => setTagsRaw(e.target.value)}
          placeholder="ESP32, WiFi, BLE, Arduino-compatible"
          className="w-full bg-transparent border-0 border-b border-foreground/20 pb-2 font-body text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-accent transition-colors"
        />
      </Field>

      {/* Specs */}
      <Field label='Specs (one "Key: Value" per line)'>
        <textarea
          value={specsRaw}
          onChange={(e) => setSpecsRaw(e.target.value)}
          rows={5}
          placeholder={"MCU: ESP32-S3\nFlash: 8MB\nInterface: SPI, I2C, UART\nVoltage: 3.3V"}
          className="w-full bg-transparent border border-foreground/10 p-3 font-mono text-xs text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-accent transition-colors resize-y leading-relaxed"
        />
      </Field>

      {/* Toggles */}
      <div className="flex gap-8">
        <Toggle label="Published" value={isPublished} onChange={setIsPublished} />
        <Toggle label="Featured"  value={isFeatured}  onChange={setIsFeatured}  />
      </div>

      {errorMsg && (
        <p className="font-mono text-[10px] text-destructive">{errorMsg}</p>
      )}

      {/* Actions */}
      <div className="flex gap-4 pt-4 border-t border-foreground/10">
        <button
          type="submit"
          disabled={saving || uploadingImg || uploadingPdf}
          className="font-mono text-[10px] tracking-[0.35em] px-8 py-3 border border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground transition-colors uppercase disabled:opacity-50"
        >
          {saving ? "SAVING..." : isEdit ? "UPDATE PRODUCT" : "CREATE PRODUCT"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="font-mono text-[10px] tracking-[0.35em] px-6 py-3 border border-foreground/15 text-foreground/40 hover:border-foreground/30 transition-colors uppercase"
        >
          CANCEL
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-mono text-[9px] tracking-[0.35em] text-accent/70 uppercase mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!value)}
        className={`relative w-10 h-5 border transition-colors ${value ? "border-accent bg-accent/20" : "border-foreground/20 bg-transparent"}`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 transition-all duration-200 ${value ? "left-5 bg-accent" : "left-0.5 bg-foreground/30"}`}
        />
      </div>
      <span className="font-mono text-[10px] tracking-[0.3em] text-foreground/50 uppercase">{label}</span>
    </label>
  );
}
