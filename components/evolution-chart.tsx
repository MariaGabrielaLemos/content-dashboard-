"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export interface DailyMetric {
  /** YYYY-MM-DD */
  date: string;
  reach: number;
  engagement: number;
}

export function EvolutionChart({ data }: { data: DailyMetric[] }) {
  return (
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
            return [
              v.toLocaleString("pt-BR"),
              name === "reach" ? "Alcance" : "Engajamento",
            ];
          }}
        />
        <Legend
          formatter={(v: string) => (v === "reach" ? "Alcance" : "Engajamento")}
          wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}
        />
        <Area
          type="monotone"
          dataKey="reach"
          stroke="hsl(var(--chart-1))"
          strokeWidth={2}
          fill="url(#reachFill)"
          isAnimationActive={false}
        />
        <Area
          type="monotone"
          dataKey="engagement"
          stroke="hsl(var(--chart-4))"
          strokeWidth={2}
          fill="url(#engagementFill)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
