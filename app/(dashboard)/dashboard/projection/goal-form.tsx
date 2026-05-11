"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function GoalForm({ currentFollowers }: { currentFollowers: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [metric, setMetric] = useState<"followers" | "reach" | "engagement">("followers");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [baseline, setBaseline] = useState(String(currentFollowers || 0));
  const [note, setNote] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metric,
          target: Number(target),
          deadline,
          baseline: Number(baseline),
          baselineDate: today,
          note: note || undefined,
        }),
      });
      if (res.ok) {
        setTarget("");
        setDeadline("");
        setNote("");
        setOpen(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Nova meta
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Nova meta</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Métrica">
            <select
              value={metric}
              onChange={(e) =>
                setMetric(e.target.value as "followers" | "reach" | "engagement")
              }
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="followers">Seguidores</option>
              <option value="reach">Alcance acumulado</option>
              <option value="engagement">Engajamento acumulado</option>
            </select>
          </Field>

          <Field label="Meta (valor final)">
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Ex: 5000"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Baseline (valor de partida)">
            <input
              type="number"
              value={baseline}
              onChange={(e) => setBaseline(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Prazo">
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={today}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Anotação (opcional)" full>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: lançamento Polaris para C-Levels"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </Field>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={submit}
            disabled={loading || !target || !deadline || !baseline}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar meta"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
