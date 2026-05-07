import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  delta as calcDelta,
  formatMetric,
  isMetricImproving,
  WBR_METRICS,
  type BagWithPrev,
  type MetricBag,
} from "@/lib/wbr";
import { cn } from "@/lib/utils";

/** Resumo "Métricas que melhoraram / pioraram" inspirado no Drop Tracker do Gustavo. */
export function WeeklySummary({ bag }: { bag: BagWithPrev }) {
  const rows = WBR_METRICS.map((m) => {
    const cur = bag.current[m.key as keyof MetricBag];
    const prev = bag.previous[m.key as keyof MetricBag];
    const d = calcDelta(cur, prev);
    return { ...m, cur, prev, d, improving: isMetricImproving(m.key as keyof MetricBag, d) };
  });

  const improved = rows.filter((r) => r.improving === true);
  const worsened = rows.filter((r) => r.improving === false);
  const flat = rows.filter((r) => r.improving === null);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ArrowUpRight className="h-4 w-4 text-emerald-300" />
            Melhoraram
            <span className="text-xs font-normal text-muted-foreground">
              ({improved.length})
            </span>
          </CardTitle>
          <CardDescription>vs período anterior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {improved.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nada melhorou no período.</p>
          ) : (
            improved.map((r) => <SummaryRow key={r.key} row={r} positive />)
          )}
        </CardContent>
      </Card>

      <Card className="border-rose-500/30 bg-rose-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ArrowDownRight className="h-4 w-4 text-rose-300" />
            Pioraram
            <span className="text-xs font-normal text-muted-foreground">
              ({worsened.length})
            </span>
          </CardTitle>
          <CardDescription>atenção pra próxima semana</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {worsened.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nada piorou no período.</p>
          ) : (
            worsened.map((r) => <SummaryRow key={r.key} row={r} positive={false} />)
          )}
        </CardContent>
      </Card>

      {flat.length > 0 && (
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Minus className="h-3.5 w-3.5" />
              Sem mudança significativa ({flat.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {flat.map((r) => (
                <span
                  key={r.key}
                  className="rounded-md border border-border bg-card/50 px-2 py-1 text-[11px] text-muted-foreground"
                >
                  {r.label}: {formatMetric(r.cur, r.format)}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface RowData {
  key: string;
  label: string;
  format: "int" | "pct" | "compact";
  cur: number;
  prev: number;
  d: ReturnType<typeof calcDelta>;
}

function SummaryRow({ row, positive }: { row: RowData; positive: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-background/60 px-3 py-2">
      <div className="min-w-0">
        <p className="text-sm font-medium">{row.label}</p>
        <p className="text-[11px] text-muted-foreground">
          {formatMetric(row.prev, row.format)} → {formatMetric(row.cur, row.format)}
        </p>
      </div>
      <span
        className={cn(
          "shrink-0 text-sm font-semibold tabular-nums",
          positive ? "text-emerald-300" : "text-rose-300"
        )}
      >
        {row.d.pct > 0 ? "+" : ""}
        {row.d.pct.toFixed(1)}%
      </span>
    </div>
  );
}
