"use client";

import {
  useGetUserGrowthMetricsQuery,
  useGetRevenueMetricsQuery,
} from "@/store/metrics/metricsApi";
import MetricCard from "@/components/dashboard/metric-card";
import ZoneActivityChart from "@/components/dashboard/report/zone-activity-chart";
import { AdminPageContent } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Area,
  XAxis,
  AreaChart,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  YAxis,
} from "recharts";

export default function Reports() {
  const {
    data: userGrowthData,
    isLoading: loadingUsers,
  } = useGetUserGrowthMetricsQuery();
  const {
    data: revenueMetricsData,
    isLoading: loadingRevenue,
  } = useGetRevenueMetricsQuery();

  const timeData =
    userGrowthData?.monthlyGrowth
      ? Object.entries(userGrowthData.monthlyGrowth).map(
          ([month, users]) => ({
            month,
            users,
          })
        )
      : [];

  const revenueData =
    revenueMetricsData?.revenueTrend.labels.map((label, index) => {
      let totalRevenue = 0;
      revenueMetricsData.revenueTrend.datasets.forEach((dataset) => {
        totalRevenue += dataset.data[index] ?? 0;
      });
      return {
        month: label,
        revenue: parseFloat(totalRevenue.toFixed(2)),
      };
    }) ?? [];

  return (
    <AdminPageContent>
      <div>
        <h2 className="admin-section-title mb-4">Overviews</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total User Growths"
            value={userGrowthData?.totalUsers?.toString() ?? "--"}
            change={`${userGrowthData?.growthRate ?? "0"}%`}
            changeType="positive"
          />
          <MetricCard
            title="Total Zone Activity"
            value="3,210"
            change="-5%"
            changeType="negative"
          />
          <MetricCard
            title="Total Payment Revenue"
            value={`$${revenueMetricsData?.totalRevenueByCategory?.overallTotalRevenue.toFixed(2) ?? "--"}`}
            change="+15%"
            changeType="positive"
          />
        </div>
      </div>

      {/* User Growth Chart */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">User Growth</h2>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              User Growth over time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <p className="text-sm text-muted-foreground">
                Loading user growth...
              </p>
            ) : timeData.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No user growth data available.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={timeData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorUsers"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#FF8736"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="#FF8736"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#FF8736"
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Zone Activity */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Zone Activity</h2>
        <ZoneActivityChart />
      </div>

      {/* Payment Revenue */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Payment Revenue Report</h2>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              Payment Revenue over time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingRevenue ? (
              <p className="text-sm text-muted-foreground">
                Loading revenue data...
              </p>
            ) : revenueData.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No revenue data available.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={revenueData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#FF8736"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="#FF8736"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#FF8736"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Export Buttons */}
      <div className="flex justify-end gap-4 mt-6">
        <Button
          onClick={() => exportCSV(timeData, "user-growth-report.csv")}
        >
          Export Data (CSV)
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          Download Report (Print View)
        </Button>
      </div>
    </AdminPageContent>
  );
}

type CSVRow = Record<string, string | number>;

function exportCSV(data: CSVRow[], filename: string) {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]).join(",");
  const rows = data.map((row) => Object.values(row).join(",")).join("\n");
  const csv = `${headers}\n${rows}`;

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
