import type { Product } from "@/types/database";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const priceLabel = product.price != null
    ? `₹${product.price.toLocaleString("en-IN")}`
    : "Contact for Price";

  return (
    <div
      className="relative flex flex-col bg-card border border-foreground/8 group hover:border-accent/40 transition-colors duration-300"
      style={{ boxShadow: "0 8px 40px -12px oklch(0 0 0 / 0.6)" }}
    >
      {/* Corner ticks */}
      <span className="absolute -top-px -left-px w-4 h-4 border-t border-l border-accent/0 group-hover:border-accent/70 transition-colors duration-300" />
      <span className="absolute -top-px -right-px w-4 h-4 border-t border-r border-accent/0 group-hover:border-accent/70 transition-colors duration-300" />
      <span className="absolute -bottom-px -left-px w-4 h-4 border-b border-l border-accent/0 group-hover:border-accent/70 transition-colors duration-300" />
      <span className="absolute -bottom-px -right-px w-4 h-4 border-b border-r border-accent/0 group-hover:border-accent/70 transition-colors duration-300" />

      {/* Image */}
      <div className="relative aspect-video bg-secondary overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 80 60" className="w-16 h-12 opacity-20" fill="none" stroke="var(--color-accent)" strokeWidth="0.8">
              <rect x="10" y="8" width="60" height="44" rx="2" />
              <line x1="20" y1="20" x2="60" y2="20" /><line x1="20" y1="30" x2="50" y2="30" />
              <circle cx="55" cy="38" r="6" /><circle cx="55" cy="38" r="2" />
            </svg>
          </div>
        )}
        {product.is_featured && (
          <div className="absolute top-3 left-3 font-mono text-[9px] tracking-[0.3em] bg-accent text-accent-foreground px-2 py-0.5">
            FEATURED
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-6">
        {/* Category */}
        {product.category && (
          <div className="font-mono text-[10px] tracking-[0.3em] text-accent mb-3">
            [ {product.category.name.toUpperCase()} ]
          </div>
        )}

        {/* Name */}
        <h3 className="font-display uppercase text-xl md:text-2xl text-foreground leading-tight mb-2">
          {product.name}
        </h3>

        {/* Short description */}
        {product.short_description && (
          <p className="font-body text-sm text-foreground/60 leading-relaxed mb-4 flex-1">
            {product.short_description}
          </p>
        )}

        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {product.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="font-mono text-[9px] tracking-[0.15em] px-2 py-0.5 border border-foreground/15 text-foreground/50">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Price + CTAs */}
        <div className="mt-auto pt-4 border-t border-foreground/8">
          <div className="font-mono text-xs text-foreground/50 mb-3">{priceLabel}</div>
          <div className="flex gap-3">
            {product.manual_url && (
              <a
                href={product.manual_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] tracking-[0.25em] px-4 py-2 border border-foreground/20 text-foreground/60 hover:border-accent/50 hover:text-accent transition-colors uppercase"
              >
                Datasheet
              </a>
            )}
            <a
              href={`mailto:info@elcs.in?subject=Quote Request — ${encodeURIComponent(product.name)}`}
              className="flex-1 text-center font-mono text-[10px] tracking-[0.25em] px-4 py-2 border border-accent/40 text-accent hover:bg-accent hover:text-accent-foreground transition-colors uppercase"
            >
              Request Quote
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
