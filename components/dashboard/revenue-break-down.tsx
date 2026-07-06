"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Pie,
  PieChart,
  Cell,
} from "recharts";
import { formatAdminAmount } from "@/lib/admin-display";
import type {
  DashboardRevenueCategory,
  DashboardRevenueTrendPoint,
} from "@/lib/dashboard-metrics";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(200 70% 50%)",
  "hsl(150 55% 42%)",
  "hsl(42 90% 50%)",
  "hsl(280 55% 55%)",
];

interface RevenueBreakdownProps {
  revenueByPlan: DashboardRevenueCategory[];
  revenueTrend: DashboardRevenueTrendPoint[];
  totalRevenue: number;
  currency: string;
  loading?: boolean;
}

export default function RevenueBreakdown({
  revenueByPlan,
  revenueTrend,
  totalRevenue,
  currency,
  loading = false,
}: RevenueBreakdownProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="admin-section-title">Revenue Overview</h2>
          <p className="admin-section-desc">
            From completed Telebirr transactions
          </p>
        </div>
        {!loading && (
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {formatAdminAmount(totalRevenue, currency)}
          </p>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border shadow-sm lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">By Plan</CardTitle>
            <CardDescription>Revenue share per subscription plan</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="mx-auto h-[220px] w-[220px] rounded-full" />
            ) : revenueByPlan.length === 0 ? (
              <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
                No completed transactions yet
              </div>
            ) : (
              <>
                <ChartContainer config={{}} className="mx-auto h-[220px] w-full">
                  <PieChart>
                    <Pie
                      data={revenueByPlan}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                    >
                      {revenueByPlan.map((_, index) => (
                        <Cell
                          key={`slice-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
                <div className="mt-2 space-y-1.5">
                  {revenueByPlan.map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{
                            backgroundColor:
                              CHART_COLORS[index % CHART_COLORS.length],
                          }}
                        />
                        {item.name}
                      </span>
                      <span className="font-medium text-foreground">
                        {formatAdminAmount(item.value, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Daily Revenue</CardTitle>
            <CardDescription>Completed payments over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[260px] w-full rounded-md" />
            ) : revenueTrend.every((d) => d.revenue === 0) ? (
              <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                No revenue recorded this week
              </div>
            ) : (
              <ChartContainer config={{}} className="h-[260px] w-full">
                <BarChart data={revenueTrend} margin={{ top: 8, right: 8, left: 0 }}>
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis dataKey="period" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={40} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="revenue"
                    fill="hsl(var(--primary))"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
