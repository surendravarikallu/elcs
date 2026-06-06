"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SiteSetting } from "@/types/database";

// Keys where a textarea makes more sense than a single-line input
const MULTILINE_KEYS = new Set(["footer_address"]);
// Keys that are URLs — show hint
const URL_KEYS = new Set(["footer_whatsapp_url", "footer_linkedin_url", "footer_instagram_url"]);

export default function AdminFooter() {
  const [settings, setSettings]   = useState<SiteSetting[]>([]);
  const [drafts,   setDrafts]     = useState<Record<string, string>>({});
  const [loading,  setLoading]    = useState(true);
  const [saving,   setSaving]     = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data } = await sb
        .from("site_settings")
        .select("*")
        .order("sort_order");
      const rows = (data as SiteSetting[]) ?? [];
      setSettings(rows);
      const d: Record<string, string> = {};
      rows.forEach((r) => { d[r.key] = r.value; });
      setDrafts(d);
      setLoading(false);
    })();
  }, []);

  const isDirty = (key: string) =>
    drafts[key] !== (settings.find((s) => s.key === key)?.value ?? "");

  const save = async (key: string) => {
    setSaving(key);
    const sb = createClient();
    const { error } = await sb
      .from("site_settings")
      .update({ value: drafts[key] ?? "" })
      .eq("key", key);
    if (!error) {
      setSettings((prev) =>
        prev.map((s) => s.key === key ? { ...s, value: drafts[key] ?? "" } : s),
      );
      setJustSaved((p) => ({ ...p, [key]: true }));
      setTimeout(() => setJustSaved((p) => ({ ...p, [key]: false })), 2000);
    }
    setSaving(null);
  };

  const reset = (key: string) => {
    const original = settings.find((s) => s.key === key)?.value ?? "";
    setDrafts((p) => ({ ...p, [key]: original }));
  };

  if (loading) return (
    <div className="font-mono text-[10px] text-foreground/30 tracking-[0.4em] pt-10">LOADING…</div>
  );

  const footerSettings = settings.filter((s) => s.key.startsWith("footer_"));

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-10">
        <div className="font-mono text-[10px] text-accent tracking-[0.45em] mb-2">[ ADMIN / FOOTER ]</div>
        <h1 className="font-display uppercase text-4xl md:text-5xl text-foreground mb-2">Footer</h1>
        <p className="font-mono text-[10px] text-foreground/35">
          Edit values below — changes go live on the site immediately after saving.
        </p>
      </div>

      {/* Fields */}
      <div className="space-y-px border border-foreground/10 divide-y divide-foreground/5">
        {footerSettings.map((s) => {
          const dirty = isDirty(s.key);
          const busy  = saving === s.key;
          const ok    = justSaved[s.key];

          return (
            <div key={s.key} className={`px-5 py-5 transition-colors ${busy ? "opacity-60 pointer-events-none" : ""}`}>
              {/* Label row */}
              <div className="flex items-center justify-between mb-2">
                <label className="font-mono text-[9px] tracking-[0.35em] text-foreground/45 uppercase">
                  {s.label}
                </label>
                {URL_KEYS.has(s.key) && (
                  <span className="font-mono text-[9px] text-foreground/25">URL</span>
                )}
              </div>

              {/* Input */}
              {MULTILINE_KEYS.has(s.key) ? (
                <textarea
                  rows={3}
                  value={drafts[s.key] ?? ""}
                  onChange={(e) => setDrafts((p) => ({ ...p, [s.key]: e.target.value }))}
                  className="w-full bg-transparent border-b border-foreground/20 pb-2 font-body text-sm text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-accent transition-colors resize-y"
                />
              ) : (
                <input
                  type="text"
                  value={drafts[s.key] ?? ""}
                  onChange={(e) => setDrafts((p) => ({ ...p, [s.key]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && dirty && save(s.key)}
                  className="w-full bg-transparent border-b border-foreground/20 pb-2 font-body text-sm text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-accent transition-colors"
                />
              )}

              {/* Action row */}
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={() => save(s.key)}
                  disabled={!dirty || busy}
                  className="font-mono text-[9px] tracking-[0.3em] px-4 py-1.5 border border-accent/50 text-accent hover:bg-accent/10 transition-colors uppercase disabled:opacity-30"
                >
                  {busy ? "SAVING…" : ok ? "✓ SAVED" : "SAVE"}
                </button>
                {dirty && (
                  <button
                    onClick={() => reset(s.key)}
                    className="font-mono text-[9px] tracking-[0.25em] text-foreground/30 hover:text-foreground/60 transition-colors uppercase"
                  >
                    RESET
                  </button>
                )}
                {!dirty && ok && (
                  <span className="font-mono text-[9px] text-accent/60">✓ Saved</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview hint */}
      <div className="mt-6 font-mono text-[9px] text-foreground/25 tracking-[0.3em]">
        TIP — ENTER key saves single-line fields. Address supports multi-line (Shift+Enter for new line).
      </div>
    </div>
  );
}
