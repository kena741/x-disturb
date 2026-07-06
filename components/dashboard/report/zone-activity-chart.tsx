"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { name: "Zone A", activity: 40, color: "hsl(160 60% 45%)" },
  { name: "Zone B", activity: 120, color: "hsl(var(--primary))" },
  { name: "Zone C", activity: 100, color: "hsl(210 70% 55%)" },
  { name: "Zone D", activity: 160, color: "hsl(45 90% 55%)" },
  { name: "Zone E", activity: 70, color: "hsl(270 50% 65%)" },
];

export default function ZoneActivityChart() {
  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Top zones by activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 30, bottom: 5 }}
          >
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
              }}
            />
            <Bar dataKey="activity" barSize={18} radius={[6, 6, 6, 6]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
