import { FileBarChart2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <FileBarChart2 className="h-5 w-5 text-primary/40" />
        </div>
        <div className="space-y-2">
          <div className="h-5 w-64 rounded bg-muted/40" />
          <div className="h-3 w-96 rounded bg-muted/30" />
        </div>
      </div>

      <div className="flex gap-3 border-b border-border/60 pb-4">
        <div className="h-7 w-24 rounded bg-muted/40" />
        <div className="h-7 w-24 rounded bg-muted/20" />
      </div>

      <div className="rounded-xl border border-border bg-card/50 p-5">
        <div className="h-4 w-48 rounded bg-muted/40 mb-3" />
        <div className="h-[260px] rounded bg-muted/20" />
      </div>

      <div className="space-y-3">
        <div className="h-3 w-48 rounded bg-muted/40" />
        <div className="grid gap-3 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card/50 p-5 space-y-2">
              <div className="h-3 w-32 rounded bg-muted/40" />
              <div className="h-8 w-24 rounded bg-muted/40" />
              <div className="h-3 w-40 rounded bg-muted/30" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
