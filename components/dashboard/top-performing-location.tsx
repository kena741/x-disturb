"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  AdminTableShell,
  AdminDataTableEmpty,
  AdminLoadingRow,
} from "@/components/admin/data-table";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { formatAdminCount } from "@/lib/admin-display";
import type { DashboardZonePoint } from "@/lib/dashboard-metrics";

interface TopPerformingLocationProps {
  entriesByZone: DashboardZonePoint[];
  loading?: boolean;
}

function getOccupancyTone(percent: number): "success" | "warning" | "danger" {
  if (percent >= 70) return "success";
  if (percent >= 40) return "warning";
  return "danger";
}

export default function TopPerformingLocation({
  entriesByZone,
  loading = false,
}: TopPerformingLocationProps) {
  const maxEntries = entriesByZone[0]?.entries ?? 1;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="admin-section-title">Top Zones</h2>
        <p className="admin-section-desc">
          Ranked by zone activity volume
        </p>
      </div>

      <AdminTableShell>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 text-muted-foreground">#</TableHead>
                <TableHead className="text-muted-foreground">Zone</TableHead>
                <TableHead className="text-muted-foreground">Activities</TableHead>
                <TableHead className="text-muted-foreground">Share</TableHead>
                <TableHead className="text-muted-foreground">Activity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <AdminLoadingRow columns={5} rows={4} />
              ) : entriesByZone.length === 0 ? (
                <AdminDataTableEmpty colSpan={5} message="No zone activity yet" />
              ) : (
                entriesByZone.map((location, index) => {
                  const share = Math.round(
                    (location.entries / maxEntries) * 100
                  );
                  return (
                    <TableRow key={location.zone}>
                      <TableCell className="text-sm text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {location.zone}
                      </TableCell>
                      <TableCell>
                        {formatAdminCount(location.entries)}
                      </TableCell>
                      <TableCell>
                        <AdminStatusBadge
                          label={`${share}%`}
                          tone={getOccupancyTone(share)}
                        />
                      </TableCell>
                      <TableCell className="min-w-[160px]">
                        <Progress value={share} className="h-1.5" />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </AdminTableShell>
    </section>
  );
}
