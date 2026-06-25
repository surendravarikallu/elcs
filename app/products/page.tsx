import { SiteShell } from "@/components/SiteShell";
import { Footer } from "@/components/sections/Footer";
import { CATEGORIES, SOLUTIONS } from "@/lib/productsData";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Products & Solutions — ELCS",
  description: "Precision-engineered embedded modules, breakout boards, power supplies, and custom firmware solutions.",
};

export default function ProductsPage() {
  return (
    <SiteShell>
      <div className="min-h-screen bg-background text-foreground">
        {/* ── Hero header ── */}
        <div className="relative pt-32 pb-16 md:pt-40 md:pb-20 px-6 md:px-12 overflow-hidden border-b border-foreground/5">
          {/* Blueprint grid */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 30% 60%, oklch(0.78 0.13 85 / 0.07), transparent 70%)",
            }}
          />

          <div className="relative max-w-7xl mx-auto">
            <div className="font-mono text-[10px] md:text-xs text-accent tracking-[0.5em] mb-4">
              [ PRODUCTS / CATALOG ]
            </div>
            <h1 className="font-display uppercase text-5xl md:text-7xl lg:text-8xl leading-[0.9] text-foreground font-light">
              Products &<br />Solutions
            </h1>
            <p className="font-body text-foreground/55 mt-6 max-w-xl text-sm md:text-base leading-relaxed">
              Precision-engineered hardware building blocks, breakout boards, stable power rails, and tailored industrial solutions.
            </p>
          </div>
        </div>

        {/* ── Categories Section ── */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-20">
          <div className="flex flex-col mb-12">
            <div className="font-mono text-[10px] text-accent tracking-[0.4em] mb-3">
              ● HARDWARE CATALOG ●
            </div>
            <h2 className="font-display uppercase text-3xl md:text-4xl font-light text-foreground">
              Browse Categories
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {CATEGORIES.map((cat) => (
              <Link
                href={`/products/${cat.slug}`}
                key={cat.slug}
                className="group relative block overflow-hidden border border-foreground/10 bg-card/40 backdrop-blur-sm transition-all duration-500 hover:border-accent/40 rounded-lg shadow-lg hover:shadow-[0_0_30px_oklch(0.78_0.13_85_/_0.05)]"
              >
                {/* Image Container with zoom */}
                <div className="relative aspect-[16/10] overflow-hidden w-full bg-muted/35 border-b border-foreground/5">
                  <Image
                    src={cat.coverImage}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-90" />
                  
                  {cat.comingSoon ? (
                    <div className="absolute top-4 right-4 bg-accent/15 border border-accent/35 text-accent font-mono text-[9px] tracking-widest uppercase px-2 py-1 rounded shadow-sm">
                      Coming Soon
                    </div>
                  ) : (
                    <div className="absolute top-4 right-4 bg-background/85 border border-foreground/10 text-foreground/75 font-mono text-[9px] tracking-widest uppercase px-2.5 py-1 rounded-full shadow-sm">
                      {cat.productCount} {cat.productCount === 1 ? "Product" : "Products"}
                    </div>
                  )}
                </div>

                <div className="p-6 relative">
                  <h3 className="font-display text-xl font-light text-foreground group-hover:text-accent transition-colors duration-300">
                    {cat.name}
                  </h3>
                  <p className="font-mono text-[9px] text-accent/60 tracking-wider mt-1 uppercase">
                    {cat.tagline}
                  </p>
                  <p className="font-body text-xs text-foreground/50 mt-3 leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>

                  <div className="mt-5 pt-4 border-t border-foreground/5 flex items-center justify-between text-[10px] font-mono tracking-widest text-foreground/45 group-hover:text-accent transition-colors duration-300">
                    <span>[ VIEW CATEGORY ]</span>
                    <span className="transform translate-x-0 group-hover:translate-x-1.5 transition-transform duration-300">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Solutions Section ── */}
        <div className="relative border-t border-foreground/5 bg-card/10 overflow-hidden py-24">
          {/* Blueprint grid background */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle 600px at 50% 50%, oklch(0.78 0.13 85 / 0.04), transparent)",
            }}
          />

          <div className="relative max-w-7xl mx-auto px-6 md:px-12">
            <div className="flex flex-col text-center mb-16">
              <div className="font-mono text-[10px] text-accent tracking-[0.4em] mb-3">
                ● SOLUTIONS ●
              </div>
              <h2 className="font-display uppercase text-3xl md:text-5xl font-light text-foreground">
                Solutions We Offer
              </h2>
              <p className="font-body text-sm text-foreground/50 mt-4 max-w-lg mx-auto leading-relaxed">
                Integrated electronic and telemetry systems built to solve complex agricultural, industrial, and automotive challenges.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
              {SOLUTIONS.map((sol) => (
                <Link
                  href={`/solutions/${sol.slug}`}
                  key={sol.slug}
                  className="group relative flex flex-col p-6 border border-foreground/10 bg-background/50 backdrop-blur-sm transition-all duration-500 hover:border-accent/40 rounded-lg shadow-md hover:shadow-[0_0_30px_oklch(0.78_0.13_85_/_0.03)]"
                >
                  <div className="font-mono text-[9px] text-accent/80 tracking-[0.25em] uppercase mb-3">
                    {sol.tagline}
                  </div>
                  <h3 className="font-display text-2xl font-light text-foreground group-hover:text-accent transition-colors duration-300 mb-3">
                    {sol.title}
                  </h3>
                  <p className="font-body text-xs text-foreground/50 leading-relaxed mb-6">
                    {sol.coverDescription}
                  </p>

                  {/* Key features preview */}
                  <ul className="space-y-2.5 border-t border-foreground/5 pt-5 mb-8">
                    {sol.features.slice(0, 3).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 font-body text-[11px] text-foreground/45">
                        <span className="text-accent mt-0.5 text-xs">•</span>
                        <span className="line-clamp-1 leading-normal">{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto flex items-center justify-between font-mono text-[10px] tracking-widest text-foreground/45 group-hover:text-accent transition-colors duration-300">
                    <span>[ LEARN MORE ]</span>
                    <span className="transform translate-x-0 group-hover:translate-x-1.5 transition-transform duration-300">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </SiteShell>
  );
}
