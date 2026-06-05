import Image from "next/image";
import logoImg from "../public/images/ELCS_final_logo.png";

export function ElcsLogo({ className }: { className?: string }) {
  return (
    <Image
      src={logoImg}
      alt="ELCS"
      className={className}
      priority
    />
  );
}
