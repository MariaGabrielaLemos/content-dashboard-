"use client";

import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";

export function Sparkline({
  data,
  color = "hsl(var(--primary))",
}: {
  data: { value: number }[];
  color?: string;
}) {
  if (data.length === 0) return <div className="h-12" />;
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <YAxis hide domain={["dataMin", "dataMax"]} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
