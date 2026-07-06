"use client";

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import type {
  DashboardChartPoint,
  DashboardZonePoint,
} from "@/lib/dashboard-metrics";

const regionPalette = [
  "hsl(var(--primary))",
  "hsl(200 70% 50%)",
  "hsl(150 55% 42%)",
  "hsl(42 90% 50%)",
  "hsl(280 55% 55%)",
];

interface DashboardChartsProps {
  entriesOverTime: DashboardChartPoint[];
  entriesByZone: DashboardZonePoint[];
  activityChangePercent: number;
  loading?: boolean;
}

export default function DashboardCharts({
  entriesOverTime,
  entriesByZone,
  activityChangePercent,
  loading = false,
}: DashboardChartsProps) {
  const regionData = entriesByZone.map((item, index) => ({
    region: item.zone,
    entries: item.entries,
    fill: regionPalette[index % regionPalette.length],
  }));

  const changeTone =
    activityChangePercent > 0
      ? "success"
      : activityChangePercent < 0
        ? "danger"
        : "neutral";

  return (
    <section className="space-y-4">
      <h2 className="admin-section-title">Activity Trends</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold">
                Activities Over Time
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Zone entries for the last 7 days
              </p>
            </div>
            {!loading && (
              <AdminStatusBadge
                label={`${activityChangePercent > 0 ? "+" : ""}${activityChangePercent}%`}
                tone={changeTone}
              />
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[240px] w-full rounded-md" />
            ) : entriesOverTime.every((d) => d.entries === 0) ? (
              <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
                No zone activity recorded this week.
              </div>
            ) : (
              <ChartContainer
                config={{
                  entries: { label: "Activities", color: "hsl(var(--primary))" },
                }}
                className="h-[240px] w-full"
              >
                <BarChart
                  data={entriesOverTime}
                  margin={{ top: 8, left: 0, right: 8 }}
                >
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis tickLine={false} axisLine={false} width={32} />
                  <ChartTooltip
                    cursor={{ fill: "hsl(var(--muted))" }}
                    content={<ChartTooltipContent />}
                  />
                  <Bar
                    dataKey="entries"
                    fill="hsl(var(--primary))"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-base font-semibold">
              Activity by Zone
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Distribution across silent zones
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[240px] w-full rounded-md" />
            ) : regionData.length === 0 ? (
              <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
                No zone activity data yet.
              </div>
            ) : (
              <ChartContainer config={{}} className="h-[240px] w-full">
                <BarChart
                  data={regionData}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                >
                  <CartesianGrid
                    horizontal={false}
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis type="number" tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="region"
                    tickLine={false}
                    axisLine={false}
                    width={90}
                    tick={{ fontSize: 12 }}
                  />
                  <ChartTooltip
                    cursor={{ fill: "hsl(var(--muted))" }}
                    content={<ChartTooltipContent />}
                  />
                  <Bar dataKey="entries" radius={[0, 6, 6, 0]} maxBarSize={24}>
                    {regionData.map((entry) => (
                      <Cell key={entry.region} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
