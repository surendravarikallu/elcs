import logoAsset from "@/assets/elcs-logo.png.asset.json";

type Props = { className?: string };

/** The official ELCS circuit mark (PNG asset on CDN). */
export function ElcsLogo({ className }: Props) {
  return (
    <img
      src={logoAsset.url}
      alt="ELCS"
      className={className}
      width={120}
      height={120}
      loading="eager"
      decoding="async"
    />
  );
}

/** Animated SVG approximation of the mark — used by the Preloader so each
 *  trace can stroke-draw via `pathLength`. Stays visually close to the PNG. */
export function ElcsLogoSvgPaths() {
  return (
    <>
      {/* outer ring */}
      <circle cx="50" cy="50" r="46" />
      {/* top-left trace: down from node then right toward center */}
      <path d="M30 24 V40 H50" />
      {/* center vertical trace */}
      <path d="M50 36 V78" />
      {/* right diagonal trace */}
      <path d="M64 36 V52 H50" />
      {/* bottom-left bent trace */}
      <path d="M30 58 V70 H42" />
      {/* nodes (small rings) */}
      <circle cx="30" cy="22" r="3.5" />
      <circle cx="50" cy="34" r="5" />
      <circle cx="64" cy="34" r="3.5" />
      <circle cx="30" cy="56" r="3.5" />
    </>
  );
}
