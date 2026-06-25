import { SiteShell } from "@/components/SiteShell";
import { Footer } from "@/components/sections/Footer";
import { CATEGORIES, getCategoryBySlug, getProductsByCategory } from "@/lib/productsData";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateStaticParams() {
  return CATEGORIES.map((cat) => ({
    category: cat.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { category } = await params;
  const cat = getCategoryBySlug(category);
  if (!cat) return {};
  return {
    title: `${cat.name} — ELCS`,
    description: cat.description,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const cat = getCategoryBySlug(category);
  if (!cat) {
    notFound();
  }

  const products = getProductsByCategory(category);
  const isComingSoon = cat.comingSoon || products.length === 0;

  return (
    <SiteShell>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Banner Hero */}
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
                "radial-gradient(ellipse 70% 60% at 30% 60%, oklch(0.78 0.13 85 / 0.05), transparent 70%)",
            }}
          />
          
          <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 font-mono text-[9px] md:text-[10px] text-foreground/40 tracking-wider mb-4 uppercase">
                <Link href="/products" className="hover:text-accent transition-colors">
                  Products
                </Link>
                <span>/</span>
                <span className="text-accent">{cat.name}</span>
              </div>

              <h1 className="font-display uppercase text-4xl md:text-6xl text-foreground font-light">
                {cat.name}
              </h1>
              <p className="font-mono text-[10px] md:text-xs text-accent/80 tracking-[0.25em] mt-2 uppercase">
                {cat.tagline}
              </p>
            </div>
            
            <p className="font-body text-foreground/50 max-w-md text-xs md:text-sm leading-relaxed md:mb-1">
              {cat.description}
            </p>
          </div>
        </div>

        {/* Catalog Grid or Coming Soon */}
        <div className="flex-grow max-w-7xl mx-auto w-full px-6 md:px-12 py-16">
          {isComingSoon ? (
            <div className="py-24 flex flex-col items-center gap-4 text-center">
              <div className="font-mono text-[10px] tracking-[0.4em] text-accent">[ COMING SOON ]</div>
              <h2 className="font-display uppercase text-3xl text-foreground/30 font-light">
                Products are being added
              </h2>
              <p className="font-body text-xs text-foreground/45 max-w-sm leading-relaxed">
                We are currently certifying and documenting components for this category. Check back soon or contact us for custom requests.
              </p>
              <Link
                href="/#contact"
                className="mt-4 inline-block font-mono text-xs tracking-wider border border-accent/40 text-accent px-5 py-2.5 rounded-full hover:bg-accent hover:text-background transition-colors duration-300"
              >
                ENQUIRE NOW
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {products.map((prod) => (
                <Link
                  href={`/products/${category}/${prod.slug}`}
                  key={prod.slug}
                  className="group relative flex flex-col overflow-hidden border border-foreground/10 bg-card/45 backdrop-blur-sm transition-all duration-500 hover:border-accent/45 rounded-lg shadow hover:shadow-[0_0_25px_oklch(0.78_0.13_85_/_0.04)]"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-muted/20 border-b border-foreground/5 flex items-center justify-center p-6">
                    {prod.image ? (
                      <Image
                        src={prod.image}
                        alt={prod.name}
                        fill
                        className="object-contain p-6 transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-foreground/20">
                        <svg
                          className="w-12 h-12 stroke-[1.2]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                        <span className="font-mono text-[9px] tracking-widest uppercase">
                          No Image Available
                        </span>
                      </div>
                    )}
                    
                    <div className="absolute bottom-4 left-4 bg-background/90 border border-foreground/10 text-accent font-mono text-[9px] px-2 py-0.5 rounded shadow-sm">
                      {prod.sku}
                    </div>
                  </div>

                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-display text-lg font-light text-foreground group-hover:text-accent transition-colors duration-300">
                        {prod.name}
                      </h3>
                      <p className="font-body text-xs text-foreground/50 mt-2 leading-relaxed line-clamp-2">
                        {prod.shortDescription}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-foreground/5 flex items-center justify-between text-[10px] font-mono tracking-widest text-foreground/45 group-hover:text-accent transition-colors duration-300">
                      <span>[ VIEW DETAILS ]</span>
                      <span className="transform translate-x-0 group-hover:translate-x-1.5 transition-transform duration-300">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </SiteShell>
  );
}
