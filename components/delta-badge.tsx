import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DeltaInfo } from "@/lib/wbr";

interface Props {
  delta: DeltaInfo;
  /** Quando false, "down" vira positivo (ex.: CPA). Default: true. */
  higherIsBetter?: boolean;
  size?: "sm" | "md";
  showAbsolute?: boolean;
}

export function DeltaBadge({
  delta,
  higherIsBetter = true,
  size = "sm",
  showAbsolute = false,
}: Props) {
  const { direction, pct, value } = delta;

  const isPositive =
    direction === "flat"
      ? null
      : higherIsBetter
      ? direction === "up"
      : direction === "down";

  const tone =
    isPositive === null
      ? "text-muted-foreground bg-muted/40 border-border"
      : isPositive
      ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/30"
      : "text-rose-300 bg-rose-500/10 border-rose-500/30";

  const Icon =
    direction === "flat"
      ? Minus
      : direction === "up"
      ? ArrowUpRight
      : ArrowDownRight;

  const formatPct =
    direction === "flat"
      ? "—"
      : `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md border font-medium tabular-nums",
        tone,
        size === "sm" ? "px-1.5 py-0.5 text-[11px]" : "px-2 py-1 text-xs"
      )}
    >
      <Icon className={cn("shrink-0", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
      <span>{formatPct}</span>
      {showAbsolute && direction !== "flat" && (
        <span className="text-muted-foreground/80 ml-1 font-normal">
          ({value > 0 ? "+" : ""}
          {value.toLocaleString("pt-BR")})
        </span>
      )}
    </span>
  );
}
