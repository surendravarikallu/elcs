"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Enquiry, EnquiryStatus } from "@/types/database";

const STATUSES: EnquiryStatus[] = ["new", "reviewing", "replied", "closed"];

const STATUS_STYLE: Record<EnquiryStatus, string> = {
  new:       "border-accent/50 text-accent bg-accent/5",
  reviewing: "border-foreground/30 text-foreground/60",
  replied:   "border-foreground/15 text-foreground/40",
  closed:    "border-foreground/8  text-foreground/25",
};

export default function AdminEnquiries() {
  const [enquiries,  setEnquiries]  = useState<Enquiry[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState<EnquiryStatus | "all">("all");
  const [expanded,   setExpanded]   = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [saving,     setSaving]     = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false });
      setEnquiries((data as Enquiry[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = filter === "all" ? enquiries : enquiries.filter((e) => e.status === filter);

  const updateStatus = async (e: Enquiry, status: EnquiryStatus) => {
    setSaving(e.id);
    const supabase = createClient();
    await supabase.from("enquiries").update({ status }).eq("id", e.id);
    setEnquiries((prev) => prev.map((x) => x.id === e.id ? { ...x, status } : x));
    setSaving(null);
  };

  const saveNotes = async (e: Enquiry) => {
    setSaving(e.id);
    const supabase = createClient();
    const notes = notesDraft[e.id] ?? e.admin_notes ?? "";
    await supabase.from("enquiries").update({ admin_notes: notes }).eq("id", e.id);
    setEnquiries((prev) => prev.map((x) => x.id === e.id ? { ...x, admin_notes: notes } : x));
    setSaving(null);
  };

  if (loading) return (
    <div className="font-mono text-[10px] text-foreground/30 tracking-[0.4em] pt-10">LOADING...</div>
  );

  return (
    <div className="max-w-5xl">
      <div className="mb-10">
        <div className="font-mono text-[10px] text-accent tracking-[0.45em] mb-2">[ ADMIN / ENQUIRIES ]</div>
        <h1 className="font-display uppercase text-4xl md:text-5xl text-foreground">Enquiries</h1>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        {(["all", ...STATUSES] as const).map((f) => {
          const count = f === "all" ? enquiries.length : enquiries.filter((e) => e.status === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`font-mono text-[10px] tracking-[0.3em] uppercase px-4 py-2 border transition-colors ${
                filter === f ? "border-accent text-accent" : "border-foreground/15 text-foreground/35 hover:border-foreground/30"
              }`}
            >
              {f} <span className="opacity-50 ml-1">{count}</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center font-mono text-sm text-foreground/30">No enquiries.</div>
      ) : (
        <div className="border border-foreground/10 divide-y divide-foreground/5">
          {filtered.map((e) => (
            <div key={e.id}>
              {/* Row */}
              <div
                className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer hover:bg-card/50 transition-colors"
                onClick={() => setExpanded((prev) => prev === e.id ? null : e.id)}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-0.5">
                    <span className="font-body text-sm text-foreground font-medium">{e.customer_name}</span>
                    {e.company && <span className="font-mono text-[10px] text-foreground/35">{e.company}</span>}
                  </div>
                  <div className="font-mono text-[10px] text-foreground/35">{e.customer_email}</div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {/* Items count */}
                  {e.items.length > 0 && (
                    <span className="font-mono text-[10px] text-foreground/30">
                      {e.items.length} item{e.items.length > 1 ? "s" : ""}
                    </span>
                  )}

                  <span className={`font-mono text-[9px] tracking-[0.25em] px-2.5 py-1 border uppercase ${STATUS_STYLE[e.status]}`}>
                    {e.status}
                  </span>

                  <span className="font-mono text-[10px] text-foreground/25 whitespace-nowrap">
                    {new Date(e.created_at).toLocaleDateString("en-IN")}
                  </span>

                  <span className="font-mono text-[10px] text-foreground/25">{expanded === e.id ? "▲" : "▼"}</span>
                </div>
              </div>

              {/* Expanded detail */}
              {expanded === e.id && (
                <div className="px-5 py-6 bg-card/30 border-t border-foreground/5 space-y-6">
                  {/* Customer info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      ["EMAIL",   e.customer_email],
                      ["PHONE",   e.customer_phone ?? "—"],
                      ["COMPANY", e.company        ?? "—"],
                      ["DATE",    new Date(e.created_at).toLocaleString("en-IN")],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <div className="font-mono text-[9px] tracking-[0.3em] text-foreground/30 mb-1">{k}</div>
                        <div className="font-body text-sm text-foreground/70 truncate">{v}</div>
                      </div>
                    ))}
                  </div>

                  {/* Message */}
                  {e.message && (
                    <div>
                      <div className="font-mono text-[9px] tracking-[0.3em] text-foreground/30 mb-2">MESSAGE</div>
                      <p className="font-body text-sm text-foreground/60 leading-relaxed whitespace-pre-wrap bg-background/50 p-4 border border-foreground/8">
                        {e.message}
                      </p>
                    </div>
                  )}

                  {/* Items */}
                  {e.items.length > 0 && (
                    <div>
                      <div className="font-mono text-[9px] tracking-[0.3em] text-foreground/30 mb-2">ITEMS</div>
                      <div className="space-y-1">
                        {e.items.map((item, i) => (
                          <div key={i} className="flex justify-between font-mono text-xs text-foreground/60">
                            <span>{item.product_name}</span>
                            <span className="text-foreground/35">×{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status change */}
                  <div>
                    <div className="font-mono text-[9px] tracking-[0.3em] text-foreground/30 mb-2">CHANGE STATUS</div>
                    <div className="flex flex-wrap gap-2">
                      {STATUSES.map((s) => (
                        <button
                          key={s}
                          disabled={e.status === s || saving === e.id}
                          onClick={() => updateStatus(e, s)}
                          className={`font-mono text-[9px] tracking-[0.25em] uppercase px-3 py-1.5 border transition-colors disabled:opacity-40 ${
                            e.status === s ? "border-accent text-accent" : "border-foreground/15 text-foreground/40 hover:border-foreground/35"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Admin notes */}
                  <div>
                    <div className="font-mono text-[9px] tracking-[0.3em] text-foreground/30 mb-2">ADMIN NOTES</div>
                    <textarea
                      rows={3}
                      defaultValue={e.admin_notes ?? ""}
                      onChange={(ev) => setNotesDraft((d) => ({ ...d, [e.id]: ev.target.value }))}
                      placeholder="Internal notes..."
                      className="w-full bg-background border border-foreground/10 p-3 font-body text-sm text-foreground/60 placeholder:text-foreground/20 focus:outline-none focus:border-accent transition-colors resize-y"
                    />
                    <button
                      disabled={saving === e.id}
                      onClick={() => saveNotes(e)}
                      className="mt-2 font-mono text-[9px] tracking-[0.3em] px-4 py-2 border border-foreground/15 text-foreground/40 hover:border-accent/40 hover:text-accent transition-colors uppercase disabled:opacity-40"
                    >
                      {saving === e.id ? "SAVING..." : "SAVE NOTES"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
