import Image from "next/image";
import logoImg from "../public/images/elcs_logo_full.png";

export function ElcsLogo({ className }: { className?: string }) {
  return (
    <Image
      src={logoImg}
      alt="Embedded Labs &amp; Control Systems"
      className={className}
      priority
    />
  );
}
