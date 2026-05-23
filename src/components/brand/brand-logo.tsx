import Image, { type StaticImageData } from "next/image";
import smartOrcaCompact from "../../assets/brand/smartorca-compact.png";
import smartOrcaHorizontal from "../../assets/brand/smartorca-horizontal.png";
import smartOrcaMark from "../../assets/brand/smartorca-mark.png";
import smartOrcaStacked from "../../assets/brand/smartorca-stacked.png";
import { cn } from "@/lib/utils";

type BrandLogoVariant = "mark" | "horizontal" | "compact" | "stacked";

const logoByVariant: Record<BrandLogoVariant, StaticImageData> = {
  mark: smartOrcaMark,
  horizontal: smartOrcaHorizontal,
  compact: smartOrcaCompact,
  stacked: smartOrcaStacked
};

export function BrandLogo({
  variant = "horizontal",
  className,
  priority = false
}: {
  variant?: BrandLogoVariant;
  className?: string;
  priority?: boolean;
}) {
  return <Image src={logoByVariant[variant]} alt="SmartOrça" priority={priority} className={cn("object-contain", className)} />;
}
