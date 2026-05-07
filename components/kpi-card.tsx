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
  icon?: LucideIcon;
  accent?: boolean;
}

export function KpiCard({ label, value, hint, delta, icon: Icon, accent = false }: Props) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-colors",
        accent ? "border-primary/40 bg-gradient-to-br from-primary/5 to-transparent" : ""
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            {label}
          </p>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </div>
        <div className="mt-3 flex items-end justify-between gap-3">
          <span className="text-3xl font-semibold tracking-tight tabular-nums">{value}</span>
          {delta && <DeltaBadge delta={delta} />}
        </div>
        {hint && (
          <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
        )}
      </CardContent>
    </Card>
  );
}
