"use client";

import { useState } from "react";
import { ElcsLogo } from "../ElcsLogo";

export function Footer() {
  const [focus, setFocus] = useState<string | null>(null);

  return (
    <footer className="bg-background border-t border-foreground/5">
      {/* Top tier */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 px-6 md:px-12 py-16 md:py-24 max-w-7xl mx-auto">
        <div>
          <ElcsLogo className="w-16 h-16 mb-6 object-contain" />
          <div className="font-mono text-sm tracking-[0.3em] text-foreground/60 uppercase">
            #ConnectTogether
          </div>
        </div>

        <form
          className="space-y-6"
          onSubmit={(e) => { e.preventDefault(); }}
        >
          <div className="font-mono text-xs tracking-[0.3em] text-accent uppercase mb-2">[ QUICK MESSAGE ]</div>
          {(["name", "email", "message"] as const).map((field) => (
            <div key={field} className="relative">
              <input
                type={field === "email" ? "email" : "text"}
                placeholder={field === "name" ? "Your Name" : field === "email" ? "Your Email" : "Message"}
                onFocus={() => setFocus(field)}
                onBlur={() => setFocus(null)}
                className="w-full bg-transparent border-0 border-b border-foreground/20 py-3 font-body text-foreground placeholder:text-foreground/40 focus:outline-none"
              />
              <span
                className={`absolute bottom-0 left-0 h-[1px] bg-accent transition-all duration-500 ${focus === field ? "w-full" : "w-0"}`}
              />
            </div>
          ))}
          <button
            type="submit"
            className="group relative overflow-hidden rounded-full border border-foreground px-8 py-3 font-mono text-xs tracking-[0.3em] uppercase cursor-pointer"
          >
            <span className="absolute inset-0 bg-foreground translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]" />
            <span className="relative text-foreground group-hover:text-background transition-colors duration-500">
              Send Message
            </span>
          </button>
        </form>
      </div>

      {/* Bottom tier */}
      <div className="border-t border-foreground/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-6 md:px-12 py-10 max-w-7xl mx-auto font-mono text-xs text-foreground/60">
          <div>
            <div className="text-accent tracking-[0.3em] mb-3">[ ADDRESS ]</div>
            <p>ELCS Embedded Labs<br />Engineering Sector 7</p>
          </div>
          <div>
            <div className="text-accent tracking-[0.3em] mb-3">[ WHATSAPP ]</div>
            <a href="#" className="hover:text-accent transition-colors">+00 0000 000 000</a>
          </div>
          <div>
            <div className="text-accent tracking-[0.3em] mb-3">[ SOCIAL ]</div>
            <a href="#" className="block hover:text-accent transition-colors">LinkedIn</a>
            <a href="#" className="block hover:text-accent transition-colors">Instagram</a>
          </div>
          <div className="flex md:justify-end items-start">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="text-accent tracking-[0.3em] hover:text-accent-glow transition-colors cursor-pointer"
            >
              ↑ TOP
            </button>
          </div>
        </div>
        <div className="px-6 md:px-12 pb-8 max-w-7xl mx-auto font-mono text-[10px] text-foreground/30 tracking-widest">
          © {new Date().getFullYear()} ELCS — ALL SYSTEMS NOMINAL
        </div>
      </div>
    </footer>
  );
}
