import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DeltaBadge } from "@/components/delta-badge";
import {
  delta as calcDelta,
  formatMetric,
  WBR_METRICS,
  type BagWithPrev,
  type Period,
} from "@/lib/wbr";
import { cn } from "@/lib/utils";

interface Props {
  /** Cada coluna: período + agregados (current/previous). */
  columns: { period: Period; bag: BagWithPrev }[];
  title?: string;
  description?: string;
}

export function WbrComparisonTable({
  columns,
  title = "Comparativo de períodos",
  description,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3 text-left font-semibold">Métrica</th>
                {columns.map((col) => (
                  <th key={col.period.id} className="px-4 py-3 text-right font-semibold">
                    <div className="flex flex-col items-end">
                      <span className="text-foreground/90">{col.period.label}</span>
                      <span className="text-[10px] font-normal normal-case text-muted-foreground">
                        vs período anterior
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WBR_METRICS.map((m, idx) => (
                <tr
                  key={m.key}
                  className={cn(
                    "border-b border-border/50 last:border-0 transition-colors",
                    idx % 2 === 0 ? "bg-transparent" : "bg-muted/20",
                    "hover:bg-muted/40"
                  )}
                >
                  <td className="px-6 py-3 font-medium text-foreground/90">{m.label}</td>
                  {columns.map((col) => {
                    const cur = col.bag.current[m.key];
                    const prev = col.bag.previous[m.key];
                    const d = calcDelta(cur, prev);
                    return (
                      <td key={col.period.id} className="px-4 py-3">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-base font-semibold tabular-nums">
                            {formatMetric(cur, m.format)}
                          </span>
                          <DeltaBadge delta={d} size="sm" />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
