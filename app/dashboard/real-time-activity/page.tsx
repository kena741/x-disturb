"use client";

import { useMemo, useState } from "react";
import { MapPin, Radio, Users, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useZoneActivities } from "@/hooks/useZoneActivities";
import ActivityMap from "@/components/real-time-activity/ActivityMap";
import { useSilentZones } from "@/hooks/useSilentZones";
import { AdminPageContent } from "@/components/admin/admin-layout";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import {
  AdminTableShell,
  AdminDataTableEmpty,
  AdminLoadingRow,
  AdminPagination,
} from "@/components/admin/data-table";
import {
  AdminFilterPanel,
  AdminSearchInput,
  AdminFilterPills,
} from "@/components/admin/admin-filter-panel";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { formatAdminCount } from "@/lib/admin-display";
import { AdminStatusTone } from "@/lib/admin-status-badge";
import {
  ActivityTypeFilter,
  filterZoneActivities,
  getActivityCategory,
  getSimplifiedZones,
  type ZoneActivityRow,
} from "@/lib/zone-activity";

const PAGE_SIZE = 10;

const ACTIVITY_FILTERS: { value: ActivityTypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "enter", label: "Entered" },
  { value: "exit", label: "Exited" },
  { value: "other", label: "Other" },
];

function getActivityTone(activity: string): AdminStatusTone {
  const category = getActivityCategory(activity);
  if (category === "enter") return "success";
  if (category === "exit") return "warning";
  return "info";
}

export default function RealTimeActivityPage() {
  const [coordinates, setCoordinates] = useState({ lat: 9.0572, lng: 38.7592 });
  const [radius, setRadius] = useState(500);
  const [mapZone, setMapZone] = useState("");
  const [search, setSearch] = useState("");
  const [logZone, setLogZone] = useState("");
  const [activityType, setActivityType] = useState<ActivityTypeFilter>("all");
  const [page, setPage] = useState(1);

  const { silentZones } = useSilentZones();
  const { activities, loading } = useZoneActivities();

  const simplifiedZones = useMemo(
    () => getSimplifiedZones(silentZones),
    [silentZones]
  );

  const zoneNames = useMemo(
    () => Array.from(new Set(activities.map((a) => a.zoneName))).sort(),
    [activities]
  );

  const filteredActivities = useMemo(
    () =>
      filterZoneActivities(activities, {
        search,
        zoneName: logZone,
        activityType,
        simplifiedZones,
      }),
    [activities, search, logZone, activityType, simplifiedZones]
  );

  const totalPages = Math.max(1, Math.ceil(filteredActivities.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredActivities.slice(start, start + PAGE_SIZE);
  }, [filteredActivities, currentPage]);

  const uniqueUserCount = useMemo(
    () => new Set(activities.map((a) => a.userID)).size,
    [activities]
  );

  const activityFilterOptions = useMemo(
    () =>
      ACTIVITY_FILTERS.map((opt) => ({
        ...opt,
        count:
          opt.value === "all"
            ? activities.length
            : activities.filter(
                (a) => getActivityCategory(a.activity) === opt.value
              ).length,
      })),
    [activities]
  );

  const hasActiveFilters =
    search.length > 0 || logZone.length > 0 || activityType !== "all";

  const handleMapZoneChange = (zoneName: string) => {
    setMapZone(zoneName);
    const match = simplifiedZones.find((z) => z.name === zoneName);
    if (!match) return;
    setRadius(match.radius);
    setCoordinates({ lat: match.coord.lat, lng: match.coord.lng });
  };

  const handleRowFocus = (row: ZoneActivityRow) => {
    if (!row.coordinates?.latitude || !row.coordinates?.longitude) return;
    setCoordinates({
      lat: row.coordinates.latitude,
      lng: row.coordinates.longitude,
    });
    setMapZone(row.zoneName);
    const match = simplifiedZones.find((z) => z.name === row.zoneName);
    if (match) setRadius(match.radius);
  };

  const clearLogFilters = () => {
    setSearch("");
    setLogZone("");
    setActivityType("all");
    setPage(1);
  };

  return (
    <AdminPageContent wide className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <AdminStatCard
          title="Live events"
          value={formatAdminCount(activities.length)}
          icon={Radio}
          loading={loading}
        />
        <AdminStatCard
          title="Active users"
          value={formatAdminCount(uniqueUserCount)}
          icon={Users}
          loading={loading}
        />
        <AdminStatCard
          title="Monitored zones"
          value={formatAdminCount(simplifiedZones.length)}
          icon={MapPin}
          loading={loading}
        />
      </div>

      <Card className="overflow-hidden border-border shadow-sm">
        <CardHeader className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold">Live map</CardTitle>
            {!loading && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <Circle className="h-2 w-2 fill-current animate-pulse" />
                Live
              </span>
            )}
          </div>
          <div className="w-full sm:w-64">
            <Select value={mapZone} onValueChange={handleMapZoneChange}>
              <SelectTrigger>
                <SelectValue placeholder="Focus on a zone" />
              </SelectTrigger>
              <SelectContent>
                {simplifiedZones.map((zone) => (
                  <SelectItem key={zone.name} value={zone.name}>
                    {zone.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ActivityMap coords={coordinates} radius={radius} />
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardHeader className="space-y-1 border-b border-border pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base font-semibold">
              Zone activity log
            </CardTitle>
            {!loading && (
              <span className="text-sm text-muted-foreground">
                {formatAdminCount(filteredActivities.length)} of{" "}
                {formatAdminCount(activities.length)} events
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Search users, zones, or actions. Click a row to focus the map.
          </p>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <AdminFilterPanel>
            <AdminSearchInput
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search user, zone, or activity…"
              className="md:flex-1"
            />
            <Select
              value={logZone || "all"}
              onValueChange={(value) => {
                setLogZone(value === "all" ? "" : value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-full bg-background md:w-48">
                <SelectValue placeholder="All zones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All zones</SelectItem>
                {zoneNames.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="outline"
                className="h-10 shrink-0"
                onClick={clearLogFilters}
              >
                Clear
              </Button>
            )}
          </AdminFilterPanel>

          <AdminFilterPills
            options={activityFilterOptions}
            value={activityType}
            onChange={(value) => {
              setActivityType(value);
              setPage(1);
            }}
          />

          <AdminTableShell>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-muted-foreground">User</TableHead>
                  <TableHead className="text-muted-foreground">Zone</TableHead>
                  <TableHead className="text-muted-foreground">
                    Activity
                  </TableHead>
                  <TableHead className="text-right text-muted-foreground">
                    Timestamp
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <AdminLoadingRow columns={4} rows={8} />
                ) : paginatedActivities.length === 0 ? (
                  <AdminDataTableEmpty
                    colSpan={4}
                    message={
                      hasActiveFilters
                        ? "No events match your search or filters"
                        : "No zone activity yet"
                    }
                  />
                ) : (
                  paginatedActivities.map((activity) => (
                    <TableRow
                      key={activity.id}
                      className="cursor-pointer"
                      onClick={() => handleRowFocus(activity)}
                    >
                      <TableCell className="font-medium">
                        {activity.userName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {activity.zoneName}
                      </TableCell>
                      <TableCell>
                        <AdminStatusBadge
                          label={activity.activity}
                          tone={getActivityTone(activity.activity)}
                        />
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground tabular-nums">
                        {activity.timestamp}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </AdminTableShell>

          {!loading && filteredActivities.length > PAGE_SIZE && (
            <div className="flex justify-end">
              <AdminPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </AdminPageContent>
  );
}
