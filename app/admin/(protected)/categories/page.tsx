"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/types/database";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function AdminCategories() {
  const [cats,    setCats]    = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy,    setBusy]    = useState<string | null>(null); // id of row being saved

  // new-category form
  const [addName, setAddName] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [adding,  setAdding]  = useState(false);

  // inline-edit state  { [id]: { name, description } }
  const [editing, setEditing] = useState<Record<string, { name: string; description: string }>>({});

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data } = await sb.from("categories").select("*").order("sort_order");
      setCats((data as Category[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const startEdit = (c: Category) =>
    setEditing((prev) => ({ ...prev, [c.id]: { name: c.name, description: c.description ?? "" } }));

  const cancelEdit = (id: string) =>
    setEditing((prev) => { const n = { ...prev }; delete n[id]; return n; });

  const saveEdit = async (c: Category) => {
    const draft = editing[c.id];
    if (!draft) return;
    setBusy(c.id);
    const sb = createClient();
    const { error } = await sb.from("categories")
      .update({ name: draft.name.trim(), slug: slugify(draft.name), description: draft.description.trim() || null })
      .eq("id", c.id);
    if (!error) {
      setCats((prev) => prev.map((x) => x.id === c.id ? { ...x, name: draft.name.trim(), slug: slugify(draft.name), description: draft.description.trim() || null } : x));
      cancelEdit(c.id);
    }
    setBusy(null);
  };

  const deleteCategory = async (c: Category) => {
    if (!confirm(`Delete "${c.name}"? Products using it will lose their category.`)) return;
    setBusy(c.id);
    const sb = createClient();
    const { error } = await sb.from("categories").delete().eq("id", c.id);
    if (!error) setCats((prev) => prev.filter((x) => x.id !== c.id));
    setBusy(null);
  };

  const addCategory = async () => {
    if (!addName.trim()) return;
    setAdding(true);
    const sb = createClient();
    const payload = {
      name: addName.trim(),
      slug: slugify(addName),
      description: addDesc.trim() || null,
      sort_order: cats.length + 1,
    };
    const { data, error } = await sb.from("categories").insert(payload).select().single();
    if (!error && data) {
      setCats((prev) => [...prev, data as Category]);
      setAddName("");
      setAddDesc("");
    }
    setAdding(false);
  };

  if (loading) return (
    <div className="font-mono text-[10px] text-foreground/30 tracking-[0.4em] pt-10">LOADING...</div>
  );

  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <div className="font-mono text-[10px] text-accent tracking-[0.45em] mb-2">[ ADMIN / CATEGORIES ]</div>
        <h1 className="font-display uppercase text-4xl md:text-5xl text-foreground">Categories</h1>
      </div>

      {/* Existing categories */}
      <div className="border border-foreground/10 divide-y divide-foreground/5 mb-10">
        {cats.length === 0 && (
          <div className="py-12 text-center font-mono text-sm text-foreground/30">No categories yet.</div>
        )}
        {cats.map((c) => {
          const isEditing = !!editing[c.id];
          const isBusy    = busy === c.id;
          const draft     = editing[c.id];

          return (
            <div key={c.id} className={`px-5 py-4 transition-colors ${isBusy ? "opacity-50 pointer-events-none" : ""}`}>
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    value={draft.name}
                    onChange={(e) => setEditing((p) => ({ ...p, [c.id]: { ...p[c.id], name: e.target.value } }))}
                    className="w-full bg-transparent border-b border-accent pb-1 font-body text-foreground focus:outline-none text-sm"
                    placeholder="Category name"
                  />
                  <input
                    value={draft.description}
                    onChange={(e) => setEditing((p) => ({ ...p, [c.id]: { ...p[c.id], description: e.target.value } }))}
                    className="w-full bg-transparent border-b border-foreground/20 pb-1 font-body text-foreground/60 focus:outline-none text-xs"
                    placeholder="Short description (optional)"
                  />
                  <div className="flex gap-3">
                    <button onClick={() => saveEdit(c)}   className="font-mono text-[9px] tracking-[0.25em] px-3 py-1.5 border border-accent/50 text-accent hover:bg-accent/10 transition-colors uppercase">SAVE</button>
                    <button onClick={() => cancelEdit(c.id)} className="font-mono text-[9px] tracking-[0.25em] px-3 py-1.5 border border-foreground/15 text-foreground/40 hover:border-foreground/30 transition-colors uppercase">CANCEL</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-body text-sm text-foreground font-medium">{c.name}</div>
                    <div className="font-mono text-[10px] text-foreground/35 mt-0.5">{c.slug} {c.description && <span className="ml-2 text-foreground/25">— {c.description}</span>}</div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <button onClick={() => startEdit(c)}    className="font-mono text-[10px] text-foreground/40 hover:text-accent transition-colors uppercase tracking-widest">EDIT</button>
                    <button onClick={() => deleteCategory(c)} className="font-mono text-[10px] text-foreground/25 hover:text-destructive transition-colors uppercase tracking-widest">DEL</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add new category */}
      <div className="border border-foreground/10 p-6">
        <div className="font-mono text-[9px] tracking-[0.35em] text-accent/70 uppercase mb-4">[ ADD NEW CATEGORY ]</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-mono text-[9px] tracking-[0.3em] text-foreground/40 uppercase mb-1.5">Name *</label>
            <input
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
              placeholder="e.g. Sensor Modules"
              className="w-full bg-transparent border-b border-foreground/20 pb-2 font-body text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-accent transition-colors"
            />
            {addName && (
              <div className="font-mono text-[9px] text-foreground/30 mt-1">slug: {slugify(addName)}</div>
            )}
          </div>
          <div>
            <label className="block font-mono text-[9px] tracking-[0.3em] text-foreground/40 uppercase mb-1.5">Description</label>
            <input
              value={addDesc}
              onChange={(e) => setAddDesc(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
              placeholder="Short description (optional)"
              className="w-full bg-transparent border-b border-foreground/20 pb-2 font-body text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>
        <button
          onClick={addCategory}
          disabled={adding || !addName.trim()}
          className="font-mono text-[10px] tracking-[0.35em] px-6 py-2.5 border border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground transition-colors uppercase disabled:opacity-40"
        >
          {adding ? "ADDING…" : "+ ADD CATEGORY"}
        </button>
      </div>
    </div>
  );
}
