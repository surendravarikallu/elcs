"use client";

import { useState } from "react";
import { ElcsLogo } from "../ElcsLogo";

export function Footer() {
  const [focus, setFocus] = useState<string | null>(null);

  return (
    <footer className="bg-background border-t border-foreground/5 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        
        {/* Left Column: Branding & Info */}
        <div className="flex flex-col justify-between space-y-10">
          <div>
            <ElcsLogo className="h-10 w-auto mb-4 object-contain" />
            <div className="font-mono text-xs tracking-[0.3em] text-foreground/40 uppercase">
              #ConnectTogether
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-[11px] leading-relaxed text-foreground/60">
            <div>
              <div className="text-accent text-[9px] tracking-[0.25em] uppercase mb-2">[ ADDRESS ]</div>
              <p className="font-light">ELCS Embedded Labs<br />Engineering Sector 7</p>
            </div>
            <div>
              <div className="text-accent text-[9px] tracking-[0.25em] uppercase mb-2">[ WHATSAPP ]</div>
              <a href="#" className="hover:text-accent transition-colors font-light">+00 0000 000 000</a>
            </div>
            <div>
              <div className="text-accent text-[9px] tracking-[0.25em] uppercase mb-2">[ SOCIAL ]</div>
              <a href="#" className="block hover:text-accent transition-colors font-light">LinkedIn</a>
              <a href="#" className="block hover:text-accent transition-colors font-light">Instagram</a>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <form
          className="space-y-5 border border-foreground/5 bg-card/25 p-6 md:p-8"
          onSubmit={(e) => { e.preventDefault(); }}
        >
          <div className="font-mono text-[10px] tracking-[0.3em] text-accent uppercase mb-2">[ QUICK MESSAGE ]</div>
          {(["name", "email", "message"] as const).map((field) => (
            <div key={field} className="relative">
              <input
                type={field === "email" ? "email" : "text"}
                placeholder={field === "name" ? "Your Name" : field === "email" ? "Your Email" : "Message"}
                onFocus={() => setFocus(field)}
                onBlur={() => setFocus(null)}
                className="w-full bg-transparent border-0 border-b border-foreground/20 py-2.5 font-body text-xs text-foreground placeholder:text-foreground/45 focus:outline-none"
              />
              <span
                className={`absolute bottom-0 left-0 h-[1px] bg-accent transition-all duration-500 ${focus === field ? "w-full" : "w-0"}`}
              />
            </div>
          ))}
          <div className="pt-2">
            <button
              type="submit"
              className="group relative overflow-hidden rounded-full border border-foreground/30 px-6 py-2.5 font-mono text-[10px] tracking-[0.3em] uppercase cursor-pointer"
            >
              <span className="absolute inset-0 bg-foreground translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]" />
              <span className="relative text-foreground group-hover:text-background transition-colors duration-500">
                Send Message
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Bottom Bar: Copyright & Top */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-12 pt-6 border-t border-foreground/5 flex flex-col sm:flex-row justify-between items-center gap-4 font-mono text-[9px] text-foreground/35 tracking-widest">
        <div>© {new Date().getFullYear()} ELCS — ALL SYSTEMS NOMINAL</div>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="text-accent hover:text-accent-glow transition-colors cursor-pointer uppercase tracking-[0.3em]"
        >
          ↑ TOP
        </button>
      </div>
    </footer>
  );
}
