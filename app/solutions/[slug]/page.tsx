import { SiteShell } from "@/components/SiteShell";
import { Footer } from "@/components/sections/Footer";
import { SOLUTIONS, getSolutionBySlug, getProductBySlug } from "@/lib/productsData";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return SOLUTIONS.map((sol) => ({
    slug: sol.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const sol = getSolutionBySlug(slug);
  if (!sol) return {};
  return {
    title: `${sol.title} — ELCS`,
    description: sol.description,
  };
}

export default async function SolutionDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const sol = getSolutionBySlug(slug);

  if (!sol) {
    notFound();
  }

  // Resolve related products
  const relatedProducts = sol.relatedProductSlugs
    .map((productSlug) => getProductBySlug(productSlug))
    .filter((p) => p !== undefined);

  return (
    <SiteShell>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Hero Section */}
        <div className="relative pt-32 pb-16 md:pt-40 md:pb-24 px-6 md:px-12 overflow-hidden border-b border-foreground/5 bg-card/10">
          {/* Blueprint grid */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.04]"
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
                "radial-gradient(circle 800px at 70% 30%, oklch(0.78 0.13 85 / 0.05), transparent)",
            }}
          />

          <div className="relative max-w-7xl mx-auto">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 font-mono text-[9px] md:text-[10px] text-foreground/45 tracking-wider uppercase mb-6">
              <Link href="/products" className="hover:text-accent transition-colors">
                Products & Solutions
              </Link>
              <span>/</span>
              <span className="text-accent">{sol.title}</span>
            </div>

            <div className="max-w-3xl">
              <span className="inline-block font-mono text-[9px] md:text-[10px] text-accent tracking-[0.25em] border border-accent/25 px-2.5 py-1 rounded uppercase mb-4">
                {sol.tagline}
              </span>
              <h1 className="font-display text-4xl md:text-6xl font-light text-foreground mb-6 leading-[1.1]">
                {sol.title}
              </h1>
              <p className="font-body text-sm md:text-base text-foreground/60 leading-relaxed">
                {sol.description}
              </p>
            </div>
          </div>
        </div>

        {/* Details and Features */}
        <div className="flex-grow max-w-7xl mx-auto w-full px-6 md:px-12 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Features List (7 cols) */}
            <div className="lg:col-span-7">
              <h2 className="font-mono text-xs text-accent tracking-[0.3em] uppercase mb-6 pb-2 border-b border-foreground/5">
                ● KEY FEATURES & FUNCTIONS ●
              </h2>
              
              <ul className="space-y-4">
                {sol.features.map((feat, idx) => (
                  <li
                    key={idx}
                    className="flex gap-4 p-4 border border-foreground/5 bg-card/15 rounded-lg hover:border-accent/15 transition-colors duration-300"
                  >
                    <span className="shrink-0 w-6 h-6 rounded-full bg-accent/10 border border-accent/25 flex items-center justify-center font-mono text-[10px] font-bold text-accent">
                      {idx + 1}
                    </span>
                    <span className="font-body text-xs md:text-sm text-foreground/70 leading-relaxed">
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Specifications Table & Related Products (5 cols) */}
            <div className="lg:col-span-5 space-y-12">
              {/* Technical Specifications */}
              <div>
                <h2 className="font-mono text-xs text-accent tracking-[0.3em] uppercase mb-6 pb-2 border-b border-foreground/5">
                  ● TECHNICAL METRICS ●
                </h2>
                <div className="border border-foreground/10 rounded overflow-hidden">
                  <table className="w-full text-left font-mono text-xs border-collapse">
                    <tbody>
                      {Object.entries(sol.specs).map(([key, val], idx) => (
                        <tr
                          key={key}
                          className={`border-b border-foreground/5 last:border-0 ${
                            idx % 2 === 0 ? "bg-card/25" : "bg-transparent"
                          }`}
                        >
                          <td className="p-3 text-foreground/45 border-r border-foreground/5 font-medium w-2/5">
                            {key}
                          </td>
                          <td className="p-3 text-foreground/80 w-3/5">
                            {val}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Related Products */}
              {relatedProducts.length > 0 && (
                <div>
                  <h2 className="font-mono text-xs text-accent tracking-[0.3em] uppercase mb-6 pb-2 border-b border-foreground/5">
                    ● CORE HARDWARE USED ●
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {relatedProducts.map((prod) => (
                      <Link
                        href={`/products/${prod.categorySlug}/${prod.slug}`}
                        key={prod.slug}
                        className="group flex items-center gap-3 p-3 border border-foreground/10 bg-card/20 rounded hover:border-accent/30 transition-all duration-300"
                      >
                        <div className="relative w-12 h-12 bg-muted/20 border border-foreground/5 rounded flex items-center justify-center shrink-0 overflow-hidden">
                          {prod.image ? (
                            <Image
                              src={prod.image}
                              alt={prod.name}
                              fill
                              className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                              sizes="48px"
                            />
                          ) : (
                            <svg
                              className="w-5 h-5 text-foreground/20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.2"
                            >
                              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-display text-[11px] font-medium text-foreground group-hover:text-accent transition-colors line-clamp-1">
                            {prod.name}
                          </div>
                          <div className="font-mono text-[9px] text-foreground/40 mt-0.5">
                            {prod.sku}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact/CTA */}
              <div className="border border-accent/20 bg-accent/5 p-6 rounded-lg text-center space-y-4">
                <h4 className="font-display text-lg font-light text-foreground">
                  Need a Customized Implementation?
                </h4>
                <p className="font-body text-xs text-foreground/50 leading-relaxed">
                  We customize agricultural, industrial, and automotive solutions to match your project specifications exactly.
                </p>
                <Link
                  href="/#contact"
                  className="inline-flex items-center justify-center font-mono text-[10px] tracking-widest font-bold bg-accent text-background px-6 py-3 rounded hover:bg-accent-glow hover:shadow-[0_0_20px_oklch(0.78_0.13_85_/_0.3)] transition-all duration-300"
                >
                  REQUEST WORKFLOW BRIEF
                </Link>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </SiteShell>
  );
}
