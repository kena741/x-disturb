"use client";
import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
// import HereMap from "@/components/dashboard/silent-zones/HereMap";
import Image from "next/image";
import { useZoneActivities } from "@/hooks/useZoneActivities";
import ActivityMap from "@/components/real-time-activity/ActivityMap";
import { SilentZone, useSilentZones } from "@/hooks/useSilentZones";
import { AdminPageContent } from "@/components/admin/admin-layout";

interface Filters {
  insideZones: boolean;
  outsideZones: boolean;
}

interface SimplifiedZone {
  name: string;
  coord: {
    lat: number;
    lng: number;
  };
  radius: number;
}

const Page = () => {
  const [filters, setFilters] = useState<Filters>({
    insideZones: false,
    outsideZones: false,
  });

  const [coordinates, setCoordinates] = useState({ lat: 9.0572, lng: 38.7592 });
  const [radius, setRadius] = useState(500);
  const { silentZones } = useSilentZones();

  const { activities, loading } = useZoneActivities();

  const recentUniqueUsers = Array.from(
    new Map(activities.map((a) => [a.userID, a])).values()
  ).slice(0, 3);

  function getSimplifiedZones(zones: SilentZone[]): SimplifiedZone[] {
    return zones.map((zone) => ({
      name: zone.name,
      coord: {
        lat: zone.center.latitude,
        lng: zone.center.longitude,
      },
      radius: zone.radius,
    }));
  }

  const simplifiedZones = getSimplifiedZones(silentZones);

  const handleChange = (filter: keyof Filters) => {
    setFilters((prev) => ({ ...prev, [filter]: !prev[filter] }));
  };

  const handleApplyFilters = () => {
    console.log("Filters applied:", filters);
  };

  const handleZoneChange = (zoneName: string) => {
    const selectedZone = simplifiedZones.find((zone) => zone.name === zoneName);
    if (selectedZone) {
      setRadius(selectedZone.radius);
      setCoordinates({
        lat: selectedZone.coord.lat,
        lng: selectedZone.coord.lng,
      });
    }
  };

  return (
    <AdminPageContent wide>
    <div className="w-full space-y-6 xl:flex xl:gap-6 xl:space-y-0">
      <div className="p-0 w-full xl:w-1/4 xl:h-full flex flex-col gap-4">
        <div className="space-y-2">
          <p className="admin-section-title text-base">Zone selection</p>
          <Select
            // defaultValue="Dembel City Center"
            onValueChange={handleZoneChange}
          >
            <SelectTrigger className="w-full p-3 bg-white border border-gray-300 rounded-md cursor-pointer">
              <SelectValue placeholder="Select Location" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {simplifiedZones.map((zone, index) => {
                return (
                  <SelectItem key={index} value={zone.name}>
                    {zone.name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <div className=" space-y-6">
          {/* Filters Section */}
          <div className="space-y-4">
            <h2 className="admin-section-title text-base">Activity Filters</h2>
            <div className="flex flex-col gap-2">
              {/* Fix 1: Use proper label association with the checkbox */}
              <div className=" flex items-center space-x-2">
                <Checkbox
                  id="insideZones"
                  checked={filters.insideZones}
                  onCheckedChange={() => handleChange("insideZones")}
                />
                <Label
                  htmlFor="insideZones"
                  className="text-gray-950 cursor-pointer"
                >
                  Inside Zones
                </Label>
              </div>

              <div className="cursor-pointer flex items-center space-x-2">
                <Checkbox
                  id="outsideZones"
                  checked={filters.outsideZones}
                  onCheckedChange={() => handleChange("outsideZones")}
                />
                <Label
                  htmlFor="outsideZones"
                  className="text-gray-950 cursor-pointer"
                >
                  Outside Zones
                </Label>
              </div>
            </div>
            <Button
              className="bg-gray-200 text-gray-950 w-full px-6 py-2 rounded-md"
              onClick={handleApplyFilters}
            >
              Apply Filters
            </Button>
          </div>

          {/* User Activity Section */}
          <div>
            <h3 className="text-xl font-semibold">User Activity</h3>
            <div className="space-y-4 mt-4">
              {loading
                ? Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full  bg-[#f9d3c4] dark:bg-[#b54c2f]/20animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 w-32  bg-[#f9d3c4] dark:bg-[#b54c2f]/20rounded animate-pulse" />
                        <div className="h-3 w-48 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                      </div>
                    </div>
                  ))
                : recentUniqueUsers.map((user, index) => (
                    <div
                      key={user.userID}
                      className="flex items-center space-x-4"
                    >
                      <Image
                        width={48}
                        height={48}
                        src={`/U${index + 1}.png`}
                        alt="User avatar"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{`User: ${user.userName}`}</p>
                        <p className="text-sm text-gray-500">{`${user.activity} in: ${user.zoneName}`}</p>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full xl:w-3/4 h-full flex flex-col gap-[10px]">
        <div className="rounded-b-md">
          <ActivityMap coords={coordinates} radius={radius} />
        </div>
        <p className="text-gray-950 text-xl font-bold">Zone Log Activity</p>
        <div className="rounded-xl border overflow-hidden shadow-sm bg-background">
          <Table className="min-w-full border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-950 dark:text-white shadow-md rounded-xl">
            <TableHeader className="border-b border-gray-400 dark:border-gray-600 ">
              <TableRow>
                <TableHead className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-white">
                  User
                </TableHead>
                <TableHead className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-white">
                  Zone
                </TableHead>
                <TableHead className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-white">
                  Activity
                </TableHead>
                <TableHead className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-white">
                  Time Stamp
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`skeleton-row-${i}`}>
                      <TableCell className="px-6 py-4">
                        <div className="h-4 w-32 rounded  bg-[#f9d3c4] dark:bg-[#b54c2f]/20 animate-pulse" />
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="h-4 w-28 rounded  bg-[#f9d3c4] dark:bg-[#b54c2f]/20animate-pulse" />
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="h-4 w-24 rounded  bg-[#f9d3c4] dark:bg-[#b54c2f]/20animate-pulse" />
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="h-4 w-20 rounded  bg-[#f9d3c4] dark:bg-[#b54c2f]/20animate-pulse" />
                      </TableCell>
                    </TableRow>
                  ))
                : activities.map((user) => (
                    <TableRow
                      key={user.id}
                      className="border-b border-gray-400 dark:border-gray-600 cursor-pointer"
                    >
                      <TableCell className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {user.userName}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-gray-500 dark:text-gray-200">
                        {user.zoneName}
                      </TableCell>
                      <TableCell className="flex items-center gap-4 px-6 py-4 text-sm">
                        {user.activity}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200">
                        {user.timestamp}
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
    </AdminPageContent>
  );
};

export default Page;
