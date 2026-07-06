"use client";

import {
  Users,
  TrendingUp,
  MapPin,
  Activity,
  Clock,
  Percent,
} from "lucide-react";
import DashboardCharts from "./dashboard-charts";
import TopPerformingLocation from "./top-performing-location";
import RevenueBreakdown from "./revenue-break-down";
import { AdminPageContent } from "@/components/admin/admin-layout";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminFilterPanel } from "@/components/admin/admin-filter-panel";
import { AdminErrorAlert } from "@/components/admin/admin-error-alert";
import { formatAdminAmount, formatAdminCount } from "@/lib/admin-display";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";

export function DashboardContent() {
  const { metrics, loading, error, isDemo } = useDashboardMetrics();
  const stats = metrics?.stats;

  const entryChange = stats?.activityChangePercent ?? 0;
  const entryChangeType =
    entryChange > 0 ? "positive" : entryChange < 0 ? "negative" : "neutral";

  return (
    <AdminPageContent wide>
      {error && !isDemo && (
        <AdminErrorAlert
          title="Could not load dashboard data"
          message={error}
        />
      )}

      <AdminFilterPanel className="justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-8 items-center rounded-full bg-primary/10 px-3 text-xs font-semibold text-primary">
            Last 7 days
          </span>
          <span className="inline-flex h-8 items-center rounded-full border border-border bg-background px-3 text-xs font-medium text-muted-foreground">
            All zones
          </span>
          {isDemo ? (
            <span className="inline-flex h-8 items-center rounded-full border border-amber-200 bg-amber-50 px-3 text-xs font-semibold text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400">
              Demo data
            </span>
          ) : (
            <span className="inline-flex h-8 items-center rounded-full border border-border bg-background px-3 text-xs font-medium text-muted-foreground">
              Live from Firebase
            </span>
          )}
        </div>
        {!loading && stats && !isDemo && (
          <p className="text-xs text-muted-foreground">
            {formatAdminCount(stats.totalActivities)} activities this week
          </p>
        )}
      </AdminFilterPanel>

      <section className="space-y-4">
        <h2 className="admin-section-title">Key Metrics</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {isDemo ? (
            <>
              <AdminStatCard
                title="Total Entries"
                value={stats ? formatAdminCount(stats.totalActivities) : "—"}
                change={stats ? `+${stats.activityChangePercent}%` : undefined}
                changeType="positive"
                icon={Activity}
                loading={loading}
              />
              <AdminStatCard
                title="Unique Users"
                value={stats ? formatAdminCount(stats.totalUsers) : "—"}
                change={
                  stats?.userChangePercent !== undefined
                    ? `${stats.userChangePercent}%`
                    : undefined
                }
                changeType="negative"
                icon={Users}
                loading={loading}
              />
              <AdminStatCard
                title="Average Dwell Time"
                value={
                  stats?.averageDwellMinutes !== undefined
                    ? `${stats.averageDwellMinutes} min`
                    : "—"
                }
                change={
                  stats?.dwellChangePercent !== undefined
                    ? `+${stats.dwellChangePercent}%`
                    : undefined
                }
                changeType="positive"
                icon={Clock}
                loading={loading}
              />
              <AdminStatCard
                title="Entry Rate"
                value={
                  stats?.entryRatePercent !== undefined
                    ? `${stats.entryRatePercent}%`
                    : "—"
                }
                change={
                  stats?.entryRateChangePercent !== undefined
                    ? `+${stats.entryRateChangePercent}%`
                    : undefined
                }
                changeType="positive"
                icon={Percent}
                loading={loading}
              />
            </>
          ) : (
            <>
              <AdminStatCard
                title="Zone Activities"
                value={
                  stats ? formatAdminCount(stats.totalActivities) : "—"
                }
                change={
                  stats
                    ? `${entryChange > 0 ? "+" : ""}${entryChange}% vs last week`
                    : undefined
                }
                changeType={entryChangeType}
                icon={Activity}
                loading={loading}
              />
              <AdminStatCard
                title="Total Users"
                value={stats ? formatAdminCount(stats.totalUsers) : "—"}
                change={
                  stats
                    ? `${formatAdminCount(stats.activeUsers)} active`
                    : undefined
                }
                changeType="neutral"
                icon={Users}
                loading={loading}
              />
              <AdminStatCard
                title="Active Zones"
                value={stats ? formatAdminCount(stats.activeZones) : "—"}
                change={
                  stats && stats.peakZoneEntries > 0
                    ? `Peak: ${formatAdminCount(stats.peakZoneEntries)} entries`
                    : undefined
                }
                changeType="neutral"
                icon={MapPin}
                loading={loading}
              />
              <AdminStatCard
                title="Revenue"
                value={
                  stats
                    ? formatAdminAmount(stats.totalRevenue, stats.currency)
                    : "—"
                }
                change={
                  stats
                    ? `${stats.completedTransactions} completed payments`
                    : undefined
                }
                changeType="positive"
                icon={TrendingUp}
                loading={loading}
              />
            </>
          )}
        </div>
      </section>

      <DashboardCharts
        entriesOverTime={metrics?.entriesOverTime ?? []}
        entriesByZone={metrics?.entriesByZone ?? []}
        activityChangePercent={stats?.activityChangePercent ?? 0}
        loading={loading}
      />

      <RevenueBreakdown
        revenueByPlan={metrics?.revenueByPlan ?? []}
        revenueTrend={metrics?.revenueTrend ?? []}
        totalRevenue={stats?.totalRevenue ?? 0}
        currency={stats?.currency ?? "ETB"}
        loading={loading}
      />

      <TopPerformingLocation
        entriesByZone={metrics?.entriesByZone ?? []}
        loading={loading}
      />
    </AdminPageContent>
  );
}
