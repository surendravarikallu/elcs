"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/admin",              label: "DASHBOARD",  tag: "[OVERVIEW]"  },
  { href: "/admin/products",   label: "PRODUCTS",   tag: "[CATALOG]"   },
  { href: "/admin/categories", label: "CATEGORIES", tag: "[TAXONOMY]"  },
  { href: "/admin/enquiries",  label: "ENQUIRIES",  tag: "[INBOX]"     },
];

export function AdminNav({ email, name }: { email: string; name: string | null }) {
  const pathname = usePathname();
  const router   = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="w-60 shrink-0 min-h-screen border-r border-foreground/10 flex flex-col p-6 bg-background">
      {/* Brand */}
      <div className="mb-10">
        <Link href="/" className="block">
          <div className="font-mono text-[9px] text-accent tracking-[0.45em] mb-0.5">[ ADMIN ]</div>
          <div className="font-display text-3xl uppercase text-foreground leading-none">ELCS</div>
        </Link>
        <div className="font-mono text-[9px] text-foreground/30 mt-1 tracking-[0.3em]">CONTROL PANEL</div>
      </div>

      {/* Nav links */}
      <nav className="flex-1">
        <ul className="space-y-1">
          {NAV.map(({ href, label, tag }) => {
            // exact match for /admin, prefix match for children
            const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex flex-col px-4 py-3 border-l-2 transition-all duration-200 ${
                    active
                      ? "border-accent bg-accent/5 text-foreground"
                      : "border-transparent text-foreground/45 hover:text-foreground/80 hover:border-accent/40"
                  }`}
                >
                  <span className="font-display uppercase text-lg leading-none">{label}</span>
                  <span className="font-mono text-[9px] text-foreground/35 mt-0.5">{tag}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User + sign out */}
      <div className="border-t border-foreground/10 pt-5">
        <div className="font-mono text-[9px] text-foreground/30 tracking-[0.3em] mb-1">LOGGED IN AS</div>
        <div className="font-body text-sm text-foreground/60 truncate">{name ?? email}</div>
        <button
          onClick={handleLogout}
          className="mt-4 font-mono text-[9px] tracking-[0.3em] text-destructive hover:opacity-70 uppercase transition-opacity"
        >
          ↩ SIGN OUT
        </button>
      </div>
    </aside>
  );
}
