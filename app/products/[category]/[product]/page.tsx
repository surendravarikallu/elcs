import { SiteShell } from "@/components/SiteShell";
import { Footer } from "@/components/sections/Footer";
import { PRODUCTS, getCategoryBySlug, getProductBySlug } from "@/lib/productsData";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    category: string;
    product: string;
  }>;
}

export async function generateStaticParams() {
  return PRODUCTS.map((prod) => ({
    category: prod.categorySlug,
    product: prod.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { product } = await params;
  const prod = getProductBySlug(product);
  if (!prod) return {};
  return {
    title: `${prod.name} — ELCS`,
    description: prod.description,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { category, product } = await params;
  const prod = getProductBySlug(product);
  const cat = getCategoryBySlug(category);

  if (!prod || !cat || prod.categorySlug !== category) {
    notFound();
  }

  return (
    <SiteShell>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Breadcrumbs & Simple Hero Header */}
        <div className="relative pt-32 pb-8 md:pt-40 md:pb-12 px-6 md:px-12 overflow-hidden border-b border-foreground/5">
          {/* Blueprint grid */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />

          <div className="relative max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 font-mono text-[9px] md:text-[10px] text-foreground/45 tracking-wider uppercase">
              <Link href="/products" className="hover:text-accent transition-colors">
                Products
              </Link>
              <span>/</span>
              <Link href={`/products/${cat.slug}`} className="hover:text-accent transition-colors">
                {cat.name}
              </Link>
              <span>/</span>
              <span className="text-accent">{prod.name}</span>
            </div>
          </div>
        </div>

        {/* Product Layout */}
        <div className="flex-grow max-w-7xl mx-auto w-full px-6 md:px-12 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Left Column: Product Image Frame (60% equivalent → 7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="relative aspect-square w-full overflow-hidden border border-foreground/10 bg-card/30 backdrop-blur-sm rounded-lg flex items-center justify-center p-8 group shadow-lg">
                {/* Glow ring on hover */}
                <div className="absolute inset-0 border border-accent/0 group-hover:border-accent/15 rounded-lg transition-colors duration-500 pointer-events-none" />
                
                {prod.image ? (
                  <Image
                    src={prod.image}
                    alt={prod.name}
                    fill
                    className="object-contain p-8 transition-transform duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    priority
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-foreground/20">
                    <svg
                      className="w-16 h-16 stroke-[1.2]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                    <span className="font-mono text-xs tracking-widest uppercase">
                      No Image Available
                    </span>
                  </div>
                )}

                <div className="absolute bottom-4 left-4 bg-background/95 border border-foreground/10 text-accent font-mono text-[10px] px-3 py-1 rounded shadow-sm">
                  {prod.sku}
                </div>
              </div>
            </div>

            {/* Right Column: Specifications & Actions (40% equivalent → 5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <span className="inline-block font-mono text-[9px] text-accent tracking-[0.2em] border border-accent/20 px-2 py-0.5 rounded uppercase mb-4">
                  {cat.name}
                </span>
                
                <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-light text-foreground mb-4">
                  {prod.name}
                </h1>
                
                <p className="font-body text-xs md:text-sm text-foreground/60 leading-relaxed mb-8">
                  {prod.description}
                </p>

                {/* Technical Specifications */}
                <div className="mb-8">
                  <h3 className="font-mono text-[10px] text-accent tracking-[0.3em] uppercase mb-4 border-b border-foreground/5 pb-2">
                    ● TECHNICAL SPECIFICATIONS ●
                  </h3>
                  <div className="border border-foreground/10 rounded overflow-hidden">
                    <table className="w-full text-left font-mono text-xs border-collapse">
                      <tbody>
                        {Object.entries(prod.specs).map(([key, val], idx) => (
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

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-10">
                  {prod.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-[9px] text-foreground/40 bg-card/40 border border-foreground/5 px-2 py-0.5 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action and Download Area */}
              <div className="border-t border-foreground/5 pt-8 space-y-4">
                {/* Download Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {prod.datasheetUrl ? (
                    <a
                      href={prod.datasheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2.5 px-5 py-3.5 bg-accent text-background font-mono text-[10px] font-bold tracking-widest rounded transition-all duration-300 hover:bg-accent-glow hover:shadow-[0_0_20px_oklch(0.78_0.13_85_/_0.3)] text-center"
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="12" y1="18" x2="12" y2="12" />
                        <polyline points="9 15 12 18 15 15" />
                      </svg>
                      VIEW DATASHEET
                    </a>
                  ) : (
                    <button
                      disabled
                      className="flex items-center justify-center gap-2.5 px-5 py-3.5 border border-foreground/10 bg-card/30 text-foreground/35 font-mono text-[10px] font-bold tracking-widest rounded cursor-not-allowed text-center"
                    >
                      <svg
                        className="w-4 h-4 opacity-50"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      NO DATASHEET
                    </button>
                  )}

                  {prod.stepFileUrl ? (
                    <a
                      href={prod.stepFileUrl}
                      download
                      className="flex items-center justify-center gap-2.5 px-5 py-3.5 bg-accent/15 border border-accent/40 text-accent font-mono text-[10px] font-bold tracking-widest rounded transition-all duration-300 hover:bg-accent hover:text-background hover:shadow-[0_0_20px_oklch(0.78_0.13_85_/_0.2)] text-center"
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                        <line x1="12" y1="22.08" x2="12" y2="12" />
                      </svg>
                      DOWNLOAD 3D STEP
                    </a>
                  ) : (
                    <button
                      disabled
                      className="flex items-center justify-center gap-2.5 px-5 py-3.5 border border-foreground/10 bg-card/30 text-foreground/35 font-mono text-[10px] font-bold tracking-widest rounded cursor-not-allowed text-center"
                    >
                      <svg
                        className="w-4 h-4 opacity-50"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      </svg>
                      NO 3D STEP FILE
                    </button>
                  )}
                </div>

                <Link
                  href="/#contact"
                  className="flex items-center justify-center gap-2 px-5 py-3.5 border border-foreground/15 text-foreground/80 font-mono text-[10px] font-bold tracking-widest rounded hover:border-foreground/30 transition-all duration-300 w-full text-center"
                >
                  REQUEST A QUOTE OR CUSTOM CONFIGURATION →
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
