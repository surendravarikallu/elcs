"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/admin",              label: "DASHBOARD",  tag: "[OVERVIEW]"  },
  { href: "/admin/products",     label: "PRODUCTS",   tag: "[CATALOG]"   },
  { href: "/admin/categories",   label: "CATEGORIES", tag: "[TAXONOMY]"  },
  { href: "/admin/enquiries",    label: "ENQUIRIES",  tag: "[INBOX]"     },
  { href: "/admin/carousel",     label: "CAROUSEL",   tag: "[SLIDES]"    },
  { href: "/admin/footer",       label: "FOOTER",     tag: "[SETTINGS]"  },
];

export function AdminNav({
  email,
  name,
  drawerOpen,
  onDrawerClose,
}: {
  email: string;
  name: string | null;
  drawerOpen?: boolean;
  onDrawerClose?: () => void;
}) {
  const pathname = usePathname();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-[80] w-60 bg-background border-r border-foreground/10 flex flex-col p-6 transition-transform duration-300 md:translate-x-0 md:static md:min-h-screen md:flex
        ${drawerOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {/* Mobile close button */}
      <button
        className="md:hidden absolute top-4 right-4 p-2 flex flex-col gap-[5px] items-center justify-center"
        onClick={onDrawerClose}
        aria-label="Close navigation"
      >
        <span className="block w-4 h-px bg-foreground rotate-45 translate-y-[3px]" />
        <span className="block w-4 h-px bg-foreground -rotate-45 -translate-y-[3px]" />
      </button>

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
                  onClick={onDrawerClose}
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
          onClick={() => setConfirmOpen(true)}
          className="mt-4 font-mono text-[9px] tracking-[0.3em] text-destructive hover:opacity-70 uppercase transition-opacity"
        >
          ↩ SIGN OUT
        </button>
      </div>

      {/* Sign-out confirmation */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-background border border-foreground/15 p-8 w-72 space-y-5">
            <div className="font-mono text-[9px] tracking-[0.4em] text-accent">[ CONFIRM ]</div>
            <p className="font-body text-sm text-foreground/70">Sign out of the admin panel?</p>
            <div className="flex gap-3">
              <button
                onClick={handleLogout}
                className="flex-1 font-mono text-[9px] tracking-[0.3em] py-2.5 border border-destructive/50 text-destructive hover:bg-destructive/10 transition-colors uppercase"
              >
                SIGN OUT
              </button>
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 font-mono text-[9px] tracking-[0.3em] py-2.5 border border-foreground/15 text-foreground/40 hover:border-foreground/30 transition-colors uppercase"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
