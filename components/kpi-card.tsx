import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DeltaBadge } from "@/components/delta-badge";
import type { DeltaInfo } from "@/lib/wbr";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  hint?: string;
  delta?: DeltaInfo;
  /** Valor absoluto do período anterior (renderiza "vs X" abaixo). */
  compareValue?: string;
  /** Rótulo do período comparado. Default: "7d anteriores". */
  compareLabel?: string;
  icon?: LucideIcon;
  /**
   * Visual tier:
   *  - "hero"   → KPI primário (Seguidores, Alcance, Engajamento, Taxa). Maior, accent stripe.
   *  - "signal" → KPI estratégico secundário (Views, Saves, Shares, Posts). Mais sutil.
   *  - default  → mesmo que "hero" sem stripe.
   */
  tier?: "hero" | "signal";
  /** Aplica destaque de accent (borda primary + gradiente). Use no card "anchor" da linha. */
  accent?: boolean;
}

export function KpiCard({
  label,
  value,
  hint,
  delta,
  compareValue,
  compareLabel = "7d anteriores",
  icon: Icon,
  tier = "hero",
  accent = false,
}: Props) {
  const isHero = tier === "hero";

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-colors",
        accent
          ? "border-primary/50 bg-gradient-to-br from-primary/8 via-card to-card"
          : "hover:border-border/70",
        !isHero && "bg-card/60"
      )}
    >
      {/* Stripe lateral de accent — distingue tier hero do signal */}
      {accent && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-primary"
        />
      )}

      <CardContent className={cn("space-y-3", isHero ? "p-5" : "p-4")}>
        <div className="flex items-center justify-between gap-2">
          <p className="eyebrow truncate">{label}</p>
          {Icon && (
            <Icon
              className={cn(
                "shrink-0",
                isHero ? "h-4 w-4 text-muted-foreground" : "h-3.5 w-3.5 text-muted-foreground/70"
              )}
            />
          )}
        </div>

        <div className="flex items-end justify-between gap-2">
          <span
            className={cn(
              "font-semibold tracking-tight tabular-nums leading-[1.05]",
              isHero ? "kpi-hero-value" : "text-2xl"
            )}
          >
            {value}
          </span>
          {delta && <DeltaBadge delta={delta} size="sm" />}
        </div>

        {(compareValue || hint) && (
          <div className="space-y-0.5 border-t border-border/40 pt-2">
            {compareValue && (
              <p className="text-[12px] tabular-nums text-muted-strong">
                vs <span className="font-semibold text-foreground/90">{compareValue}</span>{" "}
                <span className="text-muted-foreground/70">({compareLabel})</span>
              </p>
            )}
            {hint && (
              <p className="text-[12px] leading-snug text-muted-foreground/85">{hint}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
