"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

export interface DailyMetric {
  /** YYYY-MM-DD */
  date: string;
  reach: number;
  engagement: number;
}

type SeriesKey = "reach" | "engagement";

interface SeriesMeta {
  key: SeriesKey;
  label: string;
  color: string;
  fillId: string;
}

const SERIES: SeriesMeta[] = [
  { key: "reach", label: "Alcance", color: "hsl(var(--chart-1))", fillId: "reachFill" },
  { key: "engagement", label: "Engajamento", color: "hsl(var(--chart-4))", fillId: "engagementFill" },
];

export function EvolutionChart({
  data,
  labels,
}: {
  data: DailyMetric[];
  /** Sobrescreve labels (ex: "Plays" no lugar de "Alcance" pra página de Reels). */
  labels?: Partial<Record<SeriesKey, string>>;
}) {
  const [visible, setVisible] = useState<Record<SeriesKey, boolean>>({
    reach: true,
    engagement: true,
  });

  const series = SERIES.map((s) => ({
    ...s,
    label: labels?.[s.key] ?? s.label,
  }));

  function toggle(key: SeriesKey) {
    setVisible((v) => {
      const next = { ...v, [key]: !v[key] };
      // Não permitir esconder ambas — manter pelo menos 1 visível
      if (!next.reach && !next.engagement) return v;
      return next;
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {series.map((s) => {
          const isOn = visible[s.key];
          return (
            <button
              key={s.key}
              onClick={() => toggle(s.key)}
              aria-pressed={isOn}
              className={cn(
                "inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-medium transition-all",
                isOn
                  ? "border-border bg-card text-foreground hover:bg-muted/40"
                  : "border-border/40 bg-card/30 text-muted-foreground/60 line-through hover:text-muted-foreground"
              )}
            >
              <span
                className="h-2.5 w-2.5 rounded-full transition-opacity"
                style={{
                  backgroundColor: s.color,
                  opacity: isOn ? 1 : 0.3,
                }}
              />
              {s.label}
            </button>
          );
        })}
        <span className="ml-auto text-[10px] text-muted-foreground/70">
          clique pra ocultar/mostrar
        </span>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="reachFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.5} />
              <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="engagementFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--chart-4))" stopOpacity={0.4} />
              <stop offset="100%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            tickFormatter={(v: string) => {
              const [, m, d] = v.split("-");
              return `${d}/${m}`;
            }}
            stroke="hsl(var(--border))"
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            stroke="hsl(var(--border))"
            width={44}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value, name) => {
              const v = typeof value === "number" ? value : Number(value ?? 0);
              const meta = series.find((s) => s.key === name);
              return [v.toLocaleString("pt-BR"), meta?.label ?? String(name)];
            }}
          />
          {visible.reach && (
            <Area
              type="monotone"
              dataKey="reach"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              fill="url(#reachFill)"
              isAnimationActive={false}
            />
          )}
          {visible.engagement && (
            <Area
              type="monotone"
              dataKey="engagement"
              stroke="hsl(var(--chart-4))"
              strokeWidth={2}
              fill="url(#engagementFill)"
              isAnimationActive={false}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
