import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

async function getStats() {
  try {
    const supabase = await createClient();
    const [
      { count: totalProducts },
      { count: publishedProducts },
      { count: totalEnquiries },
      { count: newEnquiries },
      { data: recentEnquiries },
    ] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("is_published", true),
      supabase.from("enquiries").select("*", { count: "exact", head: true }),
      supabase.from("enquiries").select("*", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("enquiries").select("id,customer_name,company,status,created_at").order("created_at", { ascending: false }).limit(6),
    ]);
    return { totalProducts, publishedProducts, totalEnquiries, newEnquiries, recentEnquiries };
  } catch {
    return { totalProducts: 0, publishedProducts: 0, totalEnquiries: 0, newEnquiries: 0, recentEnquiries: [] };
  }
}

const STATUS_STYLE: Record<string, string> = {
  new:       "text-accent border-accent/40",
  reviewing: "text-foreground/70 border-foreground/20",
  replied:   "text-foreground/50 border-foreground/15",
  closed:    "text-foreground/30 border-foreground/10",
};

export default async function AdminDashboard() {
  const { totalProducts, publishedProducts, totalEnquiries, newEnquiries, recentEnquiries } = await getStats();

  const stats = [
    { label: "TOTAL PRODUCTS",     value: totalProducts     ?? 0 },
    { label: "PUBLISHED",          value: publishedProducts  ?? 0 },
    { label: "TOTAL ENQUIRIES",    value: totalEnquiries    ?? 0 },
    { label: "NEW ENQUIRIES",      value: newEnquiries      ?? 0, highlight: true },
  ];

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-10">
        <div className="font-mono text-[10px] text-accent tracking-[0.45em] mb-2">[ ADMIN / DASHBOARD ]</div>
        <h1 className="font-display uppercase text-4xl md:text-5xl text-foreground">Overview</h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`relative border p-6 ${s.highlight && (s.value as number) > 0 ? "border-accent/40 bg-accent/5" : "border-foreground/10 bg-card"}`}
          >
            <div className={`font-display text-4xl mb-2 ${s.highlight && (s.value as number) > 0 ? "text-accent" : "text-foreground"}`}>
              {s.value}
            </div>
            <div className="font-mono text-[9px] tracking-[0.3em] text-foreground/40 uppercase">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-4 mb-12">
        <Link
          href="/admin/products/new"
          className="font-mono text-[10px] tracking-[0.3em] px-6 py-3 border border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground transition-colors uppercase"
        >
          + Add Product
        </Link>
        <Link
          href="/admin/enquiries"
          className="font-mono text-[10px] tracking-[0.3em] px-6 py-3 border border-foreground/20 text-foreground/60 hover:border-foreground/40 hover:text-foreground transition-colors uppercase"
        >
          View Enquiries
        </Link>
      </div>

      {/* Recent enquiries */}
      {recentEnquiries && recentEnquiries.length > 0 && (
        <div>
          <div className="font-mono text-[10px] tracking-[0.4em] text-foreground/40 uppercase mb-4">
            [ RECENT ENQUIRIES ]
          </div>
          <div className="border border-foreground/10 divide-y divide-foreground/5">
            {(recentEnquiries as { id: string; customer_name: string; company: string | null; status: string; created_at: string }[]).map((e) => (
              <div key={e.id} className="flex items-center justify-between px-5 py-4 hover:bg-card transition-colors">
                <div>
                  <div className="font-body text-sm text-foreground">{e.customer_name}</div>
                  {e.company && <div className="font-mono text-[10px] text-foreground/40">{e.company}</div>}
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-mono text-[9px] tracking-[0.25em] px-2 py-0.5 border uppercase ${STATUS_STYLE[e.status] ?? ""}`}>
                    {e.status}
                  </span>
                  <span className="font-mono text-[10px] text-foreground/30">
                    {new Date(e.created_at).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Link href="/admin/enquiries" className="block mt-3 font-mono text-[10px] tracking-[0.3em] text-foreground/40 hover:text-accent transition-colors">
            VIEW ALL →
          </Link>
        </div>
      )}
    </div>
  );
}
