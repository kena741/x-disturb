import { Timestamp } from "firebase/firestore";

export interface ZoneActivityRecord {
  id: string;
  zoneName: string;
  timestamp: Date;
}

export interface TransactionRecord {
  id: string;
  amount: number;
  currency: string;
  plan_id: string;
  status: string;
  created_at: Date;
}

export interface DashboardStatCards {
  totalActivities: number;
  activityChangePercent: number;
  totalUsers: number;
  activeUsers: number;
  activeZones: number;
  peakZoneEntries: number;
  totalRevenue: number;
  currency: string;
  completedTransactions: number;
  userChangePercent?: number;
  averageDwellMinutes?: number;
  dwellChangePercent?: number;
  entryRatePercent?: number;
  entryRateChangePercent?: number;
}

export interface DashboardChartPoint {
  day: string;
  entries: number;
}

export interface DashboardZonePoint {
  zone: string;
  entries: number;
}

export interface DashboardRevenueCategory {
  name: string;
  value: number;
}

export interface DashboardRevenueTrendPoint {
  period: string;
  revenue: number;
}

export interface DashboardMetrics {
  stats: DashboardStatCards;
  entriesOverTime: DashboardChartPoint[];
  entriesByZone: DashboardZonePoint[];
  revenueByPlan: DashboardRevenueCategory[];
  revenueTrend: DashboardRevenueTrendPoint[];
}

export function toFirestoreDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  if (
    value &&
    typeof value === "object" &&
    "seconds" in value &&
    typeof (value as { seconds: number }).seconds === "number"
  ) {
    return new Date((value as { seconds: number }).seconds * 1000);
  }
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

const COMPLETED_STATUSES = new Set(["success", "completed"]);

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isWithinDays(date: Date, days: number, from = new Date()): boolean {
  const cutoff = startOfDay(from);
  cutoff.setDate(cutoff.getDate() - (days - 1));
  return startOfDay(date) >= cutoff;
}

export function buildDashboardMetrics(
  activities: ZoneActivityRecord[],
  users: { isActive?: boolean }[],
  zones: { isActive?: boolean }[],
  transactions: TransactionRecord[]
): DashboardMetrics {
  const now = new Date();

  const thisWeekActivities = activities.filter((a) =>
    isWithinDays(a.timestamp, 7, now)
  );
  const previousWeekStart = startOfDay(now);
  previousWeekStart.setDate(previousWeekStart.getDate() - 13);
  const previousWeekEnd = startOfDay(now);
  previousWeekEnd.setDate(previousWeekEnd.getDate() - 7);

  const lastWeekActivities = activities.filter((a) => {
    const day = startOfDay(a.timestamp);
    return day >= previousWeekStart && day < previousWeekEnd;
  });

  const activityChangePercent =
    lastWeekActivities.length === 0
      ? thisWeekActivities.length > 0
        ? 100
        : 0
      : Math.round(
          ((thisWeekActivities.length - lastWeekActivities.length) /
            lastWeekActivities.length) *
            100
        );

  const entriesOverTime = Array.from({ length: 7 }, (_, index) => {
    const day = startOfDay(now);
    day.setDate(day.getDate() - (6 - index));
    const label = day.toLocaleDateString("en-US", { weekday: "short" });
    const count = activities.filter(
      (a) => startOfDay(a.timestamp).getTime() === day.getTime()
    ).length;
    return { day: label, entries: count };
  });

  const zoneCounts = new Map<string, number>();
  for (const activity of activities) {
    const zone = activity.zoneName?.trim() || "Unknown Zone";
    zoneCounts.set(zone, (zoneCounts.get(zone) ?? 0) + 1);
  }

  const entriesByZone = Array.from(zoneCounts.entries())
    .map(([zone, entries]) => ({ zone, entries }))
    .sort((a, b) => b.entries - a.entries);

  const peakZoneEntries = entriesByZone[0]?.entries ?? 0;

  const completedTransactions = transactions.filter((tx) =>
    COMPLETED_STATUSES.has(tx.status.toLowerCase())
  );

  const totalRevenue = completedTransactions.reduce(
    (sum, tx) => sum + tx.amount,
    0
  );

  const currency = transactions[0]?.currency ?? "ETB";

  const planCounts = new Map<string, number>();
  for (const tx of completedTransactions) {
    const plan = tx.plan_id?.trim() || "Other";
    planCounts.set(plan, (planCounts.get(plan) ?? 0) + tx.amount);
  }

  const revenueByPlan = Array.from(planCounts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const revenueTrend = Array.from({ length: 7 }, (_, index) => {
    const day = startOfDay(now);
    day.setDate(day.getDate() - (6 - index));
    const label = day.toLocaleDateString("en-US", { weekday: "short" });
    const revenue = completedTransactions
      .filter((tx) => startOfDay(tx.created_at).getTime() === day.getTime())
      .reduce((sum, tx) => sum + tx.amount, 0);
    return { period: label, revenue };
  });

  const activeUsers = users.filter((u) => u.isActive !== false).length;
  const activeZones = zones.filter((z) => z.isActive !== false).length;

  return {
    stats: {
      totalActivities: thisWeekActivities.length,
      activityChangePercent,
      totalUsers: users.length,
      activeUsers,
      activeZones,
      peakZoneEntries,
      totalRevenue,
      currency,
      completedTransactions: completedTransactions.length,
    },
    entriesOverTime,
    entriesByZone,
    revenueByPlan,
    revenueTrend,
  };
}
