"use client";

import { useState } from "react";
import { AdminNav } from "./AdminNav";

interface Props {
  children: React.ReactNode;
  email: string;
  name: string | null;
}

export function AdminShell({ children, email, name }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Mobile top bar ── */}
      <header className="md:hidden fixed top-0 inset-x-0 z-[70] h-14 bg-background/95 backdrop-blur-sm border-b border-foreground/10 flex items-center gap-4 px-4">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation"
          className="flex flex-col gap-[5px] p-2 -ml-2"
        >
          <span className="block w-5 h-px bg-foreground" />
          <span className="block w-5 h-px bg-foreground" />
          <span className="block w-5 h-px bg-foreground" />
        </button>
        <div className="font-mono text-[9px] tracking-[0.4em] text-accent">[ ADMIN / ELCS ]</div>
      </header>

      {/* ── Backdrop ── */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-[75] bg-background/70 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── Body ── */}
      <div className="flex">
        <AdminNav
          email={email}
          name={name}
          drawerOpen={drawerOpen}
          onDrawerClose={() => setDrawerOpen(false)}
        />

        {/* Main — offset by mobile top bar height, not by sidebar */}
        <main className="flex-1 min-w-0 overflow-x-hidden pt-14 md:pt-0 p-4 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
