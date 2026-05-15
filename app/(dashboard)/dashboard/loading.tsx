import { Activity } from "lucide-react";

export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Activity className="h-5 w-5 text-primary/40" />
        </div>
        <div className="space-y-2">
          <div className="h-5 w-64 rounded bg-muted/40" />
          <div className="h-3 w-96 rounded bg-muted/30" />
        </div>
      </div>

      <div className="kpi-grid">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card/50 p-5 space-y-3"
          >
            <div className="h-3 w-24 rounded bg-muted/40" />
            <div className="h-9 w-32 rounded bg-muted/40" />
            <div className="h-3 w-40 rounded bg-muted/30" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card/50 p-5">
          <div className="h-4 w-48 rounded bg-muted/40 mb-3" />
          <div className="h-[260px] rounded bg-muted/20" />
        </div>
        <div className="rounded-xl border border-border bg-card/50 p-5 space-y-2">
          <div className="h-4 w-32 rounded bg-muted/40 mb-2" />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 rounded bg-muted/20" />
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground/60">
        Carregando dados da Meta API… (~60 chamadas paralelas na primeira vez,
        depois cacheia por 1h)
      </p>
    </div>
  );
}
