"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CarouselSlide } from "@/types/database";

function slugifyFile(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
}

const EMPTY_FORM = {
  badge:       "",
  title:       "",
  description: "",
  cta_label:   "",
  cta_url:     "",
  is_published: true,
  image_url:   "",
};

type FormState = typeof EMPTY_FORM;

export default function AdminCarousel() {
  const [slides,     setSlides]     = useState<CarouselSlide[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [view,       setView]       = useState<"list" | "form">("list");
  const [editingId,  setEditingId]  = useState<string | null>(null); // null = new
  const [form,       setForm]       = useState<FormState>(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [busy,       setBusy]       = useState<string | null>(null);
  const [saveErr,    setSaveErr]    = useState("");
  const imgInputRef = useRef<HTMLInputElement>(null);

  /* ── Fetch ── */
  const fetchSlides = async () => {
    const sb = createClient();
    // Admin reads ALL (published + draft) — bypass public policy via admin session
    const { data } = await sb
      .from("carousel_slides")
      .select("*")
      .order("sort_order");
    setSlides((data as CarouselSlide[]) ?? []);
  };

  useEffect(() => {
    fetchSlides().finally(() => setLoading(false));
  }, []);

  /* ── Open form ── */
  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSaveErr("");
    setView("form");
  };

  const openEdit = (s: CarouselSlide) => {
    setEditingId(s.id);
    setForm({
      badge:        s.badge        ?? "",
      title:        s.title,
      description:  s.description  ?? "",
      cta_label:    s.cta_label    ?? "",
      cta_url:      s.cta_url      ?? "",
      is_published: s.is_published,
      image_url:    s.image_url    ?? "",
    });
    setSaveErr("");
    setView("form");
  };

  const cancelForm = () => { setView("list"); setSaveErr(""); };

  /* ── Image upload ── */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const sb   = createClient();
    const path = `carousel/${Date.now()}-${slugifyFile(file.name)}`;
    const { error } = await sb.storage.from("product-images").upload(path, file, { upsert: true });
    if (!error) {
      const { data: urlData } = sb.storage.from("product-images").getPublicUrl(path);
      setForm((p) => ({ ...p, image_url: urlData.publicUrl }));
    }
    setUploading(false);
    // reset so same file can be re-picked
    if (imgInputRef.current) imgInputRef.current.value = "";
  };

  /* ── Save (insert / update) ── */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setSaveErr("Title is required."); return; }
    setSaving(true);
    setSaveErr("");
    const sb = createClient();

    const payload = {
      badge:        form.badge.trim()       || null,
      title:        form.title.trim(),
      description:  form.description.trim() || null,
      cta_label:    form.cta_label.trim()   || null,
      cta_url:      form.cta_url.trim()     || null,
      is_published: form.is_published,
      image_url:    form.image_url          || null,
    };

    let error;
    if (editingId) {
      ({ error } = await sb.from("carousel_slides").update(payload).eq("id", editingId));
    } else {
      const nextOrder = slides.length > 0 ? Math.max(...slides.map((s) => s.sort_order)) + 1 : 1;
      ({ error } = await sb.from("carousel_slides").insert({ ...payload, sort_order: nextOrder }));
    }

    if (error) {
      setSaveErr(error.message);
    } else {
      await fetchSlides();
      setView("list");
    }
    setSaving(false);
  };

  /* ── Toggle publish ── */
  const togglePublish = async (s: CarouselSlide) => {
    setBusy(s.id);
    const sb = createClient();
    await sb.from("carousel_slides").update({ is_published: !s.is_published }).eq("id", s.id);
    setSlides((prev) => prev.map((x) => x.id === s.id ? { ...x, is_published: !x.is_published } : x));
    setBusy(null);
  };

  /* ── Delete ── */
  const handleDelete = async (s: CarouselSlide) => {
    if (!confirm(`Delete slide "${s.title}"? This cannot be undone.`)) return;
    setBusy(s.id);
    const sb = createClient();
    await sb.from("carousel_slides").delete().eq("id", s.id);
    setSlides((prev) => prev.filter((x) => x.id !== s.id));
    setBusy(null);
  };

  /* ── Sort: swap sort_order with adjacent slide ── */
  const move = async (s: CarouselSlide, dir: -1 | 1) => {
    const sorted = [...slides].sort((a, b) => a.sort_order - b.sort_order);
    const idx    = sorted.findIndex((x) => x.id === s.id);
    const target = sorted[idx + dir];
    if (!target) return;
    setBusy(s.id);
    const sb = createClient();
    await Promise.all([
      sb.from("carousel_slides").update({ sort_order: target.sort_order }).eq("id", s.id),
      sb.from("carousel_slides").update({ sort_order: s.sort_order }).eq("id", target.id),
    ]);
    setSlides((prev) =>
      prev.map((x) => {
        if (x.id === s.id)      return { ...x, sort_order: target.sort_order };
        if (x.id === target.id) return { ...x, sort_order: s.sort_order };
        return x;
      }),
    );
    setBusy(null);
  };

  const f = (k: keyof FormState, v: string | boolean) =>
    setForm((p) => ({ ...p, [k]: v }));

  /* ─────────────── RENDER ─────────────── */

  if (loading) return (
    <div className="font-mono text-[10px] text-foreground/30 tracking-[0.4em] pt-10">LOADING…</div>
  );

  /* ── Form view ── */
  if (view === "form") {
    return (
      <div className="max-w-2xl">
        <div className="mb-8">
          <div className="font-mono text-[10px] text-accent tracking-[0.45em] mb-2">
            [ ADMIN / CAROUSEL / {editingId ? "EDIT" : "NEW"} ]
          </div>
          <h1 className="font-display uppercase text-4xl md:text-5xl text-foreground">
            {editingId ? "Edit Slide" : "Add Slide"}
          </h1>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Image */}
          <div>
            <div className="font-mono text-[9px] tracking-[0.35em] text-foreground/40 uppercase mb-2">Slide Image</div>
            {form.image_url && (
              <div className="relative w-full aspect-[16/7] bg-card border border-foreground/10 overflow-hidden mb-3">
                <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => f("image_url", "")}
                  className="absolute top-2 right-2 font-mono text-[9px] px-2 py-1 bg-background/80 border border-foreground/20 text-foreground/50 hover:text-destructive transition-colors"
                >
                  REMOVE
                </button>
              </div>
            )}
            <input
              ref={imgInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="carousel-img"
            />
            <label
              htmlFor="carousel-img"
              className={`inline-block font-mono text-[9px] tracking-[0.3em] px-4 py-2 border cursor-pointer transition-colors uppercase ${
                uploading
                  ? "border-foreground/15 text-foreground/30"
                  : "border-foreground/25 text-foreground/50 hover:border-accent hover:text-accent"
              }`}
            >
              {uploading ? "UPLOADING…" : form.image_url ? "REPLACE IMAGE" : "+ UPLOAD IMAGE"}
            </label>
          </div>

          {/* Badge */}
          <div>
            <label className="block font-mono text-[9px] tracking-[0.35em] text-foreground/40 uppercase mb-1.5">
              Badge <span className="text-foreground/25 normal-case tracking-normal font-body text-[10px]">(optional — e.g. WHAT&apos;S NEW)</span>
            </label>
            <input
              value={form.badge}
              onChange={(e) => f("badge", e.target.value)}
              placeholder="WHAT'S NEW"
              className="w-full bg-transparent border-b border-foreground/20 pb-2 font-body text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block font-mono text-[9px] tracking-[0.35em] text-foreground/40 uppercase mb-1.5">
              Title *
            </label>
            <input
              required
              value={form.title}
              onChange={(e) => f("title", e.target.value)}
              placeholder="Main headline"
              className="w-full bg-transparent border-b border-foreground/20 pb-2 font-body text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-mono text-[9px] tracking-[0.35em] text-foreground/40 uppercase mb-1.5">
              Description <span className="text-foreground/25 normal-case tracking-normal font-body text-[10px]">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => f("description", e.target.value)}
              placeholder="Short supporting paragraph…"
              className="w-full bg-transparent border border-foreground/10 p-3 font-body text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-accent transition-colors resize-y"
            />
          </div>

          {/* CTA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[9px] tracking-[0.35em] text-foreground/40 uppercase mb-1.5">
                Button Label <span className="text-foreground/25 normal-case tracking-normal font-body text-[10px]">(optional)</span>
              </label>
              <input
                value={form.cta_label}
                onChange={(e) => f("cta_label", e.target.value)}
                placeholder="View Products"
                className="w-full bg-transparent border-b border-foreground/20 pb-2 font-body text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block font-mono text-[9px] tracking-[0.35em] text-foreground/40 uppercase mb-1.5">
                Button URL <span className="text-foreground/25 normal-case tracking-normal font-body text-[10px]">(optional)</span>
              </label>
              <input
                value={form.cta_url}
                onChange={(e) => f("cta_url", e.target.value)}
                placeholder="/products"
                className="w-full bg-transparent border-b border-foreground/20 pb-2 font-body text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          {/* Published toggle */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => f("is_published", !form.is_published)}
              className={`relative w-10 h-5 border transition-colors ${
                form.is_published ? "border-accent bg-accent/20" : "border-foreground/20 bg-transparent"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 transition-all ${
                  form.is_published ? "left-5 bg-accent" : "left-0.5 bg-foreground/30"
                }`}
              />
            </button>
            <span className="font-mono text-[10px] tracking-[0.3em] text-foreground/50 uppercase">
              {form.is_published ? "Published" : "Draft"}
            </span>
          </div>

          {saveErr && <p className="font-mono text-[9px] text-destructive">{saveErr}</p>}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="font-mono text-[10px] tracking-[0.35em] px-6 py-3 border border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground transition-all uppercase disabled:opacity-40"
            >
              {saving ? "SAVING…" : editingId ? "UPDATE SLIDE" : "ADD SLIDE"}
            </button>
            <button
              type="button"
              onClick={cancelForm}
              className="font-mono text-[10px] tracking-[0.3em] px-5 py-3 border border-foreground/15 text-foreground/35 hover:border-foreground/30 transition-colors uppercase"
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    );
  }

  /* ── List view ── */
  const sorted = [...slides].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] text-accent tracking-[0.45em] mb-2">[ ADMIN / CAROUSEL ]</div>
          <h1 className="font-display uppercase text-4xl md:text-5xl text-foreground">Carousel</h1>
          <p className="font-mono text-[10px] text-foreground/35 mt-1">
            Slides appear in order on the homepage. First slide = What&apos;s New.
          </p>
        </div>
        <button
          onClick={openNew}
          className="shrink-0 font-mono text-[10px] tracking-[0.35em] px-5 py-2.5 border border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground transition-all uppercase"
        >
          + ADD SLIDE
        </button>
      </div>

      {slides.length === 0 ? (
        <div className="py-20 text-center border border-foreground/10">
          <div className="font-mono text-sm text-foreground/30">No slides yet.</div>
          <button onClick={openNew} className="mt-4 font-mono text-[10px] tracking-[0.3em] text-accent hover:opacity-70 transition-opacity uppercase">
            + Add your first slide
          </button>
        </div>
      ) : (
        <div className="border border-foreground/10 divide-y divide-foreground/5">
          {/* Header row */}
          <div className="hidden md:grid grid-cols-[80px_1fr_5rem_4rem_7rem] gap-4 px-5 py-3 bg-card">
            {["IMAGE", "TITLE / BADGE", "ORDER", "STATUS", "ACTIONS"].map((h) => (
              <div key={h} className="font-mono text-[9px] tracking-[0.3em] text-foreground/35 uppercase">{h}</div>
            ))}
          </div>

          {sorted.map((s, idx) => {
            const isBusy = busy === s.id;
            return (
              <div
                key={s.id}
                className={`grid grid-cols-1 md:grid-cols-[80px_1fr_5rem_4rem_7rem] gap-4 items-center px-5 py-4 hover:bg-card/40 transition-colors ${isBusy ? "opacity-50 pointer-events-none" : ""}`}
              >
                {/* Thumbnail */}
                <div className="w-20 h-12 bg-card border border-foreground/10 overflow-hidden shrink-0">
                  {s.image_url
                    ? <img src={s.image_url} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center font-mono text-[9px] text-foreground/20">NO IMG</div>
                  }
                </div>

                {/* Title + badge */}
                <div className="min-w-0">
                  {s.badge && (
                    <div className="font-mono text-[9px] tracking-[0.3em] text-accent/70 mb-0.5">[{s.badge}]</div>
                  )}
                  <div className="font-display uppercase text-base text-foreground truncate">{s.title}</div>
                  {s.description && (
                    <div className="font-mono text-[10px] text-foreground/30 truncate mt-0.5">{s.description}</div>
                  )}
                </div>

                {/* Sort arrows */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => move(s, -1)}
                    disabled={idx === 0}
                    className="font-mono text-[11px] w-6 h-6 border border-foreground/15 text-foreground/40 hover:border-accent/40 hover:text-accent disabled:opacity-20 transition-colors flex items-center justify-center"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => move(s, 1)}
                    disabled={idx === sorted.length - 1}
                    className="font-mono text-[11px] w-6 h-6 border border-foreground/15 text-foreground/40 hover:border-accent/40 hover:text-accent disabled:opacity-20 transition-colors flex items-center justify-center"
                  >
                    ↓
                  </button>
                </div>

                {/* Status */}
                <button
                  onClick={() => togglePublish(s)}
                  className={`font-mono text-[9px] tracking-[0.25em] px-2 py-1 border whitespace-nowrap transition-colors ${
                    s.is_published
                      ? "border-accent/40 text-accent hover:bg-accent/10"
                      : "border-foreground/15 text-foreground/30 hover:border-foreground/30"
                  }`}
                >
                  {s.is_published ? "LIVE" : "DRAFT"}
                </button>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openEdit(s)}
                    className="font-mono text-[10px] text-foreground/50 hover:text-accent transition-colors"
                  >
                    EDIT
                  </button>
                  <button
                    onClick={() => handleDelete(s)}
                    className="font-mono text-[10px] text-foreground/25 hover:text-destructive transition-colors"
                  >
                    DEL
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-4 font-mono text-[9px] text-foreground/25 tracking-[0.3em]">
        TIP — Use ↑ ↓ to reorder. DRAFT slides are hidden from the site.
      </p>
    </div>
  );
}
