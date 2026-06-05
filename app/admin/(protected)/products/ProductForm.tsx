"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { Category, Product } from "@/types/database";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function resolveSlug(base: string, currentId?: string): Promise<string> {
  const sb = createClient();
  let candidate = base;
  let n = 2;
  while (true) {
    const { data } = await sb.from("products").select("id").eq("slug", candidate);
    const clash = (data ?? []).find((r: { id: string }) => r.id !== currentId);
    if (!clash) return candidate;
    candidate = `${base}-${n++}`;
  }
}

/** Real-time specs parse — returns {valid, key, val} per non-empty line */
function parseSpecLines(raw: string) {
  return raw.split("\n").map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return { raw: line, skip: true, valid: false, key: "", val: "" };
    const idx = trimmed.indexOf(":");
    if (idx < 1) return { raw: line, skip: false, valid: false, key: trimmed, val: "" };
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    if (!key || !val) return { raw: line, skip: false, valid: false, key, val };
    return { raw: line, skip: false, valid: true, key, val };
  });
}

interface Props { categories: Category[]; product?: Product; }

export function ProductForm({ categories, product }: Props) {
  const router  = useRouter();
  const isEdit  = !!product;
  const imageInputRef  = useRef<HTMLInputElement>(null);
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
  const [catOpen,      setCatOpen]      = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  // Close cat dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedCatName = categories.find((c) => c.id === categoryId)?.name ?? "— None —";

  // Specs validation
  const specLines   = parseSpecLines(specsRaw);
  const invalidCount = specLines.filter((l) => !l.skip && !l.valid).length;
  const validCount   = specLines.filter((l) => l.valid).length;

  const handleNameChange = (v: string) => {
    setName(v);
    if (!isEdit) setSlug(slugify(v));
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImg(true);
    setErrorMsg("");
    const sb = createClient();
    const ext  = file.name.split(".").pop();
    const path = `products/${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}.${ext}`;
    const { error } = await sb.storage.from("product-images").upload(path, file, { upsert: true });
    if (error) { setErrorMsg(`Image upload failed: ${error.message}`); setUploadingImg(false); return; }
    const { data } = sb.storage.from("product-images").getPublicUrl(path);
    setImageUrl(data.publicUrl);
    setUploadingImg(false);
  };

  const handleManualUpload = async (file: File) => {
    setUploadingPdf(true);
    setErrorMsg("");
    const sb = createClient();
    const path = `datasheets/${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}.pdf`;
    const { error } = await sb.storage.from("product-images").upload(path, file, { upsert: true, contentType: "application/pdf" });
    if (error) { setErrorMsg(`PDF upload failed: ${error.message}`); setUploadingPdf(false); return; }
    const { data } = sb.storage.from("product-images").getPublicUrl(path);
    setManualUrl(data.publicUrl);
    setUploadingPdf(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSaving(true);

    const specs: Record<string, string> = {};
    specLines.filter((l) => l.valid).forEach((l) => { specs[l.key] = l.val; });

    const baseSlug     = slug.trim() || slugify(name);
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

    const sb = createClient();
    let error;
    if (isEdit) {
      ({ error } = await sb.from("products").update(payload).eq("id", product!.id));
    } else {
      ({ error } = await sb.from("products").insert(payload));
    }

    setSaving(false);
    if (error) { setErrorMsg(error.message); return; }
    setSlug(resolvedSlug);
    router.push("/admin/products");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ── 2-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-x-12 gap-y-8">

        {/* ═══ LEFT COLUMN ═══ */}
        <div className="space-y-7">

          {/* Name + Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Product Name *">
              <input value={name} onChange={(e) => handleNameChange(e.target.value)} required
                placeholder="e.g. ESP32 Core Module"
                className={INPUT} />
            </Field>
            <Field label="Slug">
              <input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} required
                placeholder="auto-generated"
                className={`${INPUT} font-mono text-sm text-foreground/60`} />
            </Field>
          </div>

          {/* Short description */}
          <Field label="Short Description (shown on catalog card)">
            <input value={shortDesc} onChange={(e) => setShortDesc(e.target.value)}
              placeholder="One-liner describing the product"
              className={INPUT} />
          </Field>

          {/* Long description */}
          <Field label="Full Description">
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4}
              placeholder="Detailed product description..."
              className="w-full bg-transparent border border-foreground/10 p-3 font-body text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-accent transition-colors resize-y" />
          </Field>

          {/* Image */}
          <Field label="Product Image">
            <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
            <div className="flex items-center gap-3 mb-3">
              <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://... or use ↑ UPLOAD"
                className={`flex-1 ${INPUT}`} />
              <button type="button" disabled={uploadingImg} onClick={() => imageInputRef.current?.click()}
                className={UPLOAD_BTN}>
                {uploadingImg ? "UPLOADING…" : "↑ UPLOAD"}
              </button>
            </div>
            {imageUrl && (
              <div className="relative w-32 h-24 border border-foreground/10 bg-card">
                <Image
                  src={imageUrl}
                  alt="preview"
                  fill
                  sizes="128px"
                  className="object-contain"
                />
                <button type="button" onClick={() => setImageUrl("")}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-background border border-foreground/20 text-foreground/50 hover:text-destructive text-[10px] flex items-center justify-center transition-colors z-10">✕</button>
              </div>
            )}
          </Field>

          {/* Datasheet PDF */}
          <Field label="Datasheet / Manual (PDF)">
            <input ref={manualInputRef} type="file" accept="application/pdf" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleManualUpload(f); }} />
            <div className="flex items-center gap-3">
              <input type="url" value={manualUrl} onChange={(e) => setManualUrl(e.target.value)}
                placeholder="https://... or upload PDF"
                className={`flex-1 ${INPUT}`} />
              <button type="button" disabled={uploadingPdf} onClick={() => manualInputRef.current?.click()}
                className={UPLOAD_BTN}>
                {uploadingPdf ? "UPLOADING…" : "↑ UPLOAD"}
              </button>
            </div>
            {manualUrl && (
              <div className="flex items-center gap-3 mt-2 font-mono text-[9px]">
                <span className="text-foreground/40">PDF linked</span>
                <a href={manualUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">preview ↗</a>
                <button type="button" onClick={() => setManualUrl("")} className="text-foreground/30 hover:text-destructive transition-colors">remove</button>
              </div>
            )}
          </Field>
        </div>

        {/* ═══ RIGHT COLUMN ═══ */}
        <div className="space-y-7">

          {/* Custom category dropdown */}
          <Field label={<span className="flex items-center justify-between w-full">Category <Link href="/admin/categories" className="text-foreground/30 hover:text-accent transition-colors normal-case tracking-normal font-mono text-[9px]">manage ↗</Link></span>}>
            <div ref={catRef} className="relative">
              <button type="button" onClick={() => setCatOpen((v) => !v)}
                className="w-full flex items-center justify-between border-b border-foreground/20 pb-2 text-left font-body text-sm text-foreground focus:outline-none hover:border-accent transition-colors">
                <span>{selectedCatName}</span>
                <span className={`font-mono text-[9px] text-foreground/40 transition-transform duration-200 ${catOpen ? "rotate-180" : ""}`}>▼</span>
              </button>
              {catOpen && (
                <div className="absolute top-full left-0 right-0 z-50 bg-card border border-foreground/15 mt-1 max-h-52 overflow-y-auto shadow-xl">
                  <button type="button" onClick={() => { setCategoryId(""); setCatOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 font-body text-sm transition-colors ${!categoryId ? "text-accent bg-accent/5" : "text-foreground/40 hover:bg-foreground/5"}`}>
                    — None —
                  </button>
                  {categories.map((c) => (
                    <button key={c.id} type="button" onClick={() => { setCategoryId(c.id); setCatOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 font-body text-sm transition-colors flex items-center gap-2 ${categoryId === c.id ? "text-accent bg-accent/5" : "text-foreground hover:bg-foreground/5"}`}>
                      {categoryId === c.id && <span className="text-accent text-[10px]">✓</span>}
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Field>

          {/* Price */}
          <Field label="Price (₹) — blank = Contact for Price">
            <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 2499"
              className={INPUT} />
          </Field>

          {/* Tags */}
          <Field label="Tags (comma separated)">
            <input value={tagsRaw} onChange={(e) => setTagsRaw(e.target.value)}
              placeholder="ESP32, WiFi, BLE, Arduino"
              className={INPUT} />
          </Field>

          {/* Specs */}
          <Field label={
            <span className="flex items-center justify-between w-full">
              Specs — one <code className="font-mono text-[8px] bg-foreground/10 px-1 py-0.5 mx-1">Key: Value</code> per line
              {specsRaw.trim() && (
                <span className={`font-mono text-[9px] ${invalidCount > 0 ? "text-amber-500" : "text-foreground/30"}`}>
                  {validCount} valid{invalidCount > 0 ? `, ${invalidCount} ignored` : ""}
                </span>
              )}
            </span>
          }>
            <textarea value={specsRaw} onChange={(e) => setSpecsRaw(e.target.value)} rows={8}
              placeholder={"MCU: ESP32-S3\nFlash: 8MB\nInterface: SPI, I2C, UART\nVoltage: 3.3V"}
              className="w-full bg-transparent border border-foreground/10 p-3 font-mono text-xs text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-accent transition-colors resize-y leading-relaxed" />
            {/* Show which lines are invalid */}
            {invalidCount > 0 && (
              <div className="mt-1.5 space-y-0.5">
                {specLines.filter((l) => !l.skip && !l.valid).map((l, i) => (
                  <div key={i} className="font-mono text-[9px] text-amber-500/80 flex gap-2">
                    <span>⚠</span>
                    <span className="opacity-70">Line &quot;{l.raw.trim()}&quot; — needs format <code>Key: Value</code>, will be skipped</span>
                  </div>
                ))}
              </div>
            )}
          </Field>

          {/* Toggles */}
          <div className="flex gap-8 pt-1">
            <Toggle label="Published" value={isPublished} onChange={setIsPublished} />
            <Toggle label="Featured"  value={isFeatured}  onChange={setIsFeatured}  />
          </div>
        </div>
      </div>

      {/* ── Actions (full width) ── */}
      <div className="mt-10 pt-6 border-t border-foreground/10">
        {errorMsg && (
          <p className="font-mono text-[10px] text-destructive mb-4">{errorMsg}</p>
        )}
        <div className="flex gap-4">
          <button type="submit" disabled={saving || uploadingImg || uploadingPdf}
            className="font-mono text-[10px] tracking-[0.35em] px-8 py-3 border border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground transition-colors uppercase disabled:opacity-50">
            {saving ? "SAVING..." : isEdit ? "UPDATE PRODUCT" : "CREATE PRODUCT"}
          </button>
          <button type="button" onClick={() => router.push("/admin/products")}
            className="font-mono text-[10px] tracking-[0.35em] px-6 py-3 border border-foreground/15 text-foreground/40 hover:border-foreground/30 transition-colors uppercase">
            CANCEL
          </button>
        </div>
      </div>
    </form>
  );
}

// ── Shared style constants ──
const INPUT = "w-full bg-transparent border-0 border-b border-foreground/20 pb-2 font-body text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-accent transition-colors text-sm";
const UPLOAD_BTN = "shrink-0 font-mono text-[9px] tracking-[0.25em] uppercase px-3 py-1.5 border border-foreground/20 text-foreground/50 hover:border-accent hover:text-accent transition-colors disabled:opacity-40";

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex font-mono text-[9px] tracking-[0.35em] text-accent/70 uppercase mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div onClick={() => onChange(!value)}
        className={`relative w-10 h-5 border transition-colors ${value ? "border-accent bg-accent/20" : "border-foreground/20 bg-transparent"}`}>
        <div className={`absolute top-0.5 w-4 h-4 transition-all duration-200 ${value ? "left-5 bg-accent" : "left-0.5 bg-foreground/30"}`} />
      </div>
      <span className="font-mono text-[10px] tracking-[0.3em] text-foreground/50 uppercase">{label}</span>
    </label>
  );
}
