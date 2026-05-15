"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { FeedbackStatus } from "@/lib/feedback-store";
import { cn } from "@/lib/utils";

const LABELS: Record<FeedbackStatus, string> = {
  open: "Aberto",
  queued: "Na fila",
  shipped: "Resolvido",
  wontfix: "Won't fix",
};

const STYLES: Record<FeedbackStatus, string> = {
  open: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  queued: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  shipped: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  wontfix: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
};

export function FeedbackStatusSelect({
  id,
  status,
}: {
  id: string;
  status: FeedbackStatus;
}) {
  const [current, setCurrent] = useState(status);
  const [pending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function change(next: FeedbackStatus) {
    if (next === current) return;
    setSaving(true);
    setCurrent(next);
    try {
      const res = await fetch("/api/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: next }),
      });
      if (!res.ok) {
        setCurrent(status);
      } else {
        startTransition(() => router.refresh());
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <select
        value={current}
        onChange={(e) => change(e.target.value as FeedbackStatus)}
        disabled={saving || pending}
        className={cn(
          "rounded-md border px-2 py-1 text-[11px] font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-primary/40",
          STYLES[current],
          saving && "opacity-60"
        )}
      >
        {(Object.keys(LABELS) as FeedbackStatus[]).map((s) => (
          <option key={s} value={s} className="bg-background text-foreground">
            {LABELS[s]}
          </option>
        ))}
      </select>
      {(saving || pending) && (
        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
      )}
    </div>
  );
}
