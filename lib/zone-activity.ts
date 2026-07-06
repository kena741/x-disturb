import { SilentZone } from "@/hooks/useSilentZones";

export interface ZoneActivityRow {
  id: string;
  userID: string;
  userName: string;
  zoneID: string;
  zoneName: string;
  activity: string;
  timestamp: string;
  timestampMs: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface SimplifiedZone {
  name: string;
  coord: { lat: number; lng: number };
  radius: number;
}

export type ActivityTypeFilter = "all" | "enter" | "exit" | "other";

export function getSimplifiedZones(zones: SilentZone[]): SimplifiedZone[] {
  return zones.map((zone) => ({
    name: zone.name,
    coord: {
      lat: zone.center.latitude,
      lng: zone.center.longitude,
    },
    radius: zone.radius,
  }));
}

function getDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const earthRadius = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function isInsideAnyZone(
  coord: { latitude: number; longitude: number },
  zones: SimplifiedZone[]
): boolean {
  return zones.some(
    (zone) =>
      getDistanceMeters(
        coord.latitude,
        coord.longitude,
        zone.coord.lat,
        zone.coord.lng
      ) <= zone.radius
  );
}

export function getActivityCategory(activity: string): ActivityTypeFilter {
  const value = activity.toLowerCase();
  if (value.includes("enter")) return "enter";
  if (value.includes("exit")) return "exit";
  return "other";
}

export function filterZoneActivities(
  activities: ZoneActivityRow[],
  options: {
    search: string;
    zoneName: string;
    activityType: ActivityTypeFilter;
    insideZones?: boolean;
    outsideZones?: boolean;
    simplifiedZones: SimplifiedZone[];
  }
): ZoneActivityRow[] {
  const query = options.search.trim().toLowerCase();

  return activities.filter((row) => {
    if (query) {
      const haystack = `${row.userName} ${row.zoneName} ${row.activity}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    if (options.zoneName && row.zoneName !== options.zoneName) return false;

    if (options.activityType !== "all") {
      if (getActivityCategory(row.activity) !== options.activityType) return false;
    }

    if (options.insideZones || options.outsideZones) {
      const inside = isInsideAnyZone(row.coordinates, options.simplifiedZones);
      if (options.insideZones && options.outsideZones) return true;
      if (options.insideZones) return inside;
      return !inside;
    }

    return true;
  });
}

export function getUserInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
