"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export interface ProjectionPoint {
  /** ISO date "YYYY-MM-DD" */
  date: string;
  /** Realizado (null em datas futuras). */
  actual: number | null;
  /** Projetado/meta (sempre presente). */
  target: number;
}

export function ProjectionChart({ data }: { data: ProjectionPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
            <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
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
            const v = typeof value === "number" ? value : null;
            return [
              v == null ? "—" : v.toLocaleString("pt-BR"),
              name === "actual" ? "Realizado" : "Projetado",
            ];
          }}
          labelFormatter={(label) => `Data: ${label}`}
        />
        <Legend
          formatter={(v: string) => (v === "actual" ? "Realizado" : "Projetado")}
          wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}
        />
        <Area
          type="monotone"
          dataKey="actual"
          stroke="hsl(var(--chart-1))"
          strokeWidth={2.5}
          fill="url(#actualFill)"
          connectNulls={false}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="target"
          stroke="hsl(var(--chart-4))"
          strokeWidth={2}
          strokeDasharray="6 4"
          dot={false}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
