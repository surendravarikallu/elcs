"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ElcsLogo } from "@/components/ElcsLogo";

export default function AdminLogin() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      {/* Blueprint grid */}
      <div
        aria-hidden
        className="fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <ElcsLogo className="w-14 h-14 object-contain" />
        </div>

        {/* Card */}
        <div className="relative border border-foreground/10 p-10 bg-card/50 backdrop-blur-sm">
          <span className="absolute -top-px -left-px w-4 h-4 border-t border-l border-accent" />
          <span className="absolute -top-px -right-px w-4 h-4 border-t border-r border-accent" />
          <span className="absolute -bottom-px -left-px w-4 h-4 border-b border-l border-accent" />
          <span className="absolute -bottom-px -right-px w-4 h-4 border-b border-r border-accent" />

          <div className="font-mono text-[10px] text-accent tracking-[0.45em] mb-2">[ ADMIN ACCESS ]</div>
          <h1 className="font-display uppercase text-4xl text-foreground mb-8">SIGN IN</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {[
              { id: "email",    label: "EMAIL",    type: "email",    val: email,    set: setEmail    },
              { id: "password", label: "PASSWORD", type: "password", val: password, set: setPassword },
            ].map(({ id, label, type, val, set }) => (
              <div key={id} className="relative">
                <label htmlFor={id} className="block font-mono text-[9px] tracking-[0.35em] text-foreground/40 uppercase mb-2">
                  {label}
                </label>
                <input
                  id={id}
                  type={type}
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  required
                  className="w-full bg-transparent border-0 border-b border-foreground/20 pb-2 font-body text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            ))}

            {error && (
              <p className="font-mono text-[10px] text-destructive tracking-wide">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full group relative overflow-hidden border border-accent/50 py-3 font-mono text-[10px] tracking-[0.4em] uppercase text-accent hover:text-accent-foreground transition-colors duration-300 disabled:opacity-50"
            >
              <span className="absolute inset-0 bg-accent translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]" />
              <span className="relative">{loading ? "AUTHENTICATING..." : "ENTER PANEL"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
