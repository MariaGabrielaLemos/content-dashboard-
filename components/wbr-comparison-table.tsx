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
  // Bug #5: labels explícitos por coluna pra evitar leitura cross-comparison entre 7d/30d/90d.
  // Cada coluna é uma janela independente comparada à sua PRÓPRIA janela anterior — não comparar entre colunas.
  function columnHeaderLabel(p: Period): { main: string; sub: string } {
    if (p.kind === "rolling-7")
      return { main: "Últimos 7 dias", sub: "vs 7 dias anteriores" };
    if (p.kind === "rolling-30")
      return { main: "Últimos 30 dias", sub: "vs 30 dias anteriores" };
    if (p.kind === "rolling-90")
      return { main: "Últimos 90 dias", sub: "vs 90 dias anteriores" };
    if (p.kind === "quarter")
      return { main: p.label, sub: "vs trimestre anterior" };
    return { main: p.label, sub: "vs janela anterior" };
  }

  const isMultiColumn = columns.length > 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {isMultiColumn && (
          <p className="mt-2 rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-[11px] leading-snug text-amber-200/90">
            <strong className="font-semibold">Atenção:</strong> cada coluna é uma janela
            independente comparada à sua própria janela anterior. Os números entre
            colunas não são comparáveis (representam intervalos de tempo diferentes).
          </p>
        )}
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="overflow-x-auto">
          <table className="w-full text-[15px]">
            <thead>
              <tr className="border-b border-border/80 bg-muted/10">
                <th
                  scope="col"
                  className="px-6 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                >
                  Métrica
                </th>
                {columns.map((col) => {
                  const lbl = columnHeaderLabel(col.period);
                  return (
                    <th
                      key={col.period.id}
                      scope="col"
                      className="px-4 py-3.5 text-right"
                    >
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-[13px] font-semibold text-foreground">
                          {lbl.main}
                        </span>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                          {lbl.sub}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {WBR_METRICS.map((m, idx) => (
                <tr
                  key={m.key}
                  className={cn(
                    "group border-b border-border/30 last:border-0 transition-colors",
                    idx % 2 === 0 ? "bg-transparent" : "bg-muted/10",
                    "hover:bg-muted/30"
                  )}
                >
                  <td className="px-6 py-3 text-[14px] font-medium text-foreground/95">
                    {m.label}
                  </td>
                  {columns.map((col) => {
                    const cur = col.bag.current[m.key];
                    const prev = col.bag.previous[m.key];
                    const d = calcDelta(cur, prev);
                    return (
                      <td key={col.period.id} className="px-4 py-3">
                        <div className="flex items-baseline justify-end gap-2.5">
                          <DeltaBadge delta={d} size="sm" />
                          <span className="min-w-[4ch] text-right text-[16px] font-semibold tabular-nums text-foreground">
                            {formatMetric(cur, m.format)}
                          </span>
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
