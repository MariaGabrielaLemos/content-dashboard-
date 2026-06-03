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
  /** null = nenhum post publicado nesse dia (vira lacuna no gráfico, não um zero). */
  reach: number | null;
  engagement: number | null;
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
  // Suavizar pico viral: um post de 160k de alcance achata os dias normais
  // (300-2k) numa linha rente ao zero. Quando ligado, o(s) dia(s) de pico viram
  // lacuna e o gráfico reescala nos dias normais — escala linear sempre (log +
  // área de 2 eixos gera path inválido no recharts). Pedido do Fernando (02/06):
  // o pico de 31/05 deformava o gráfico e fazia o resto do mês parecer zero.
  const [hidePeak, setHidePeak] = useState(false);

  const series = SERIES.map((s) => ({
    ...s,
    label: labels?.[s.key] ?? s.label,
  }));

  // Detecta picos de alcance ≥ 10x a mediana dos dias com post. Só então
  // mostramos o toggle (pra não poluir quando não há viral).
  const reachVals = data
    .map((d) => d.reach)
    .filter((v): v is number => v != null && v > 0)
    .sort((a, b) => a - b);
  const median = reachVals.length
    ? reachVals[Math.floor(reachVals.length / 2)]
    : 0;
  const peakThreshold = median * 10;
  const peakDays = median > 0
    ? data.filter((d) => d.reach != null && d.reach >= peakThreshold)
    : [];
  const hasViralPeak = peakDays.length > 0;

  // Dados exibidos: com o pico suavizado, os dias de pico viram null (lacuna),
  // então ambos os eixos reescalam nos dias normais.
  const peakDates = new Set(peakDays.map((d) => d.date));
  const chartData =
    hidePeak && hasViralPeak
      ? data.map((d) =>
          peakDates.has(d.date)
            ? { ...d, reach: null, engagement: null }
            : d
        )
      : data;

  function fmtShortDate(iso: string): string {
    const [, m, dd] = iso.split("-");
    return `${dd}/${m}`;
  }

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
        {hasViralPeak && (
          <button
            onClick={() => setHidePeak((v) => !v)}
            aria-pressed={hidePeak}
            title="Oculta o(s) dia(s) de pico viral pra enxergar a variação dos dias normais"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-all",
              hidePeak
                ? "border-primary/50 bg-primary/10 text-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-muted/40"
            )}
          >
            {hidePeak ? "Pico viral oculto" : "Suavizar pico viral"}
          </button>
        )}
        <span className="ml-auto text-[10px] text-muted-foreground/70">
          clique pra ocultar/mostrar
        </span>
      </div>

      {hidePeak && hasViralPeak && (
        <p className="text-[11px] text-muted-foreground/80">
          Ocultado pra não distorcer a escala:{" "}
          {peakDays
            .map(
              (d) =>
                `${fmtShortDate(d.date)} (${(d.reach ?? 0).toLocaleString(
                  "pt-BR"
                )} de alcance)`
            )
            .join(", ")}
          .
        </p>
      )}

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
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
          {/* Bug #3: dois eixos — reach (esquerda) e engagement (direita). Reach é
              tipicamente 10-100x maior que engagement, então um YAxis único achata
              a série de engagement. Cor do tick combina com a cor da série. */}
          <YAxis
            yAxisId="left"
            orientation="left"
            tick={{ fill: "hsl(var(--chart-1))", fontSize: 11 }}
            stroke="hsl(var(--chart-1))"
            width={48}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: "hsl(var(--chart-4))", fontSize: 11 }}
            stroke="hsl(var(--chart-4))"
            width={48}
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
              yAxisId="left"
              type="monotone"
              dataKey="reach"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              fill="url(#reachFill)"
              connectNulls={false}
              isAnimationActive={false}
            />
          )}
          {visible.engagement && (
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="engagement"
              stroke="hsl(var(--chart-4))"
              strokeWidth={2}
              fill="url(#engagementFill)"
              connectNulls={false}
              isAnimationActive={false}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
