"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import AddressField from "./AddressSuggestion";

/* eslint-disable */
// Define types for HERE Maps API
declare global {
  interface Window {
    H: any;
  }
}

type HereMapProps = {
  onCoordinatesChange: (coords: { lat: string; lng: string }) => void;
  radius: number;
};

const HereMap = ({ onCoordinatesChange, radius }: HereMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<H.Map | null>(null);
  const markerRef = useRef<H.map.Marker | null>(null);
  const circleRef = useRef<H.map.Circle | null>(null);
  const platformRef = useRef<any>(null); // To hold the platform instance
  const [coordinates, setCoordinates] = useState<{
    lat: string | null;
    lng: string | null;
  }>({
    lat: null,
    lng: null,
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMapLoading, setIsMapLoading] = useState<boolean>(true);

  const apikey: string = process.env.NEXT_PUBLIC_HERE_API_KEY || "";

  // Load HERE Maps scripts and initialize the map
  useEffect(() => {
    if (!apikey) {
      setError("API key is missing. Please check your environment variables.");
      setIsMapLoading(false);
      return;
    }

    if (!mapRef.current) {
      setIsMapLoading(false);
      return;
    }

    setIsMapLoading(true);
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () =>
          reject(new Error(`Failed to load script: ${src}`));
        document.body.appendChild(script);
      });
    };

    let isMounted = true;

    const initializeMap = async () => {
      try {
        // Load required HERE Maps scripts
        await loadScript("https://js.api.here.com/v3/3.1/mapsjs-core.js");
        await loadScript("https://js.api.here.com/v3/3.1/mapsjs-service.js");
        await loadScript("https://js.api.here.com/v3/3.1/mapsjs-ui.js");
        await loadScript("https://js.api.here.com/v3/3.1/mapsjs-mapevents.js");

        if (!isMounted) return;

        const H = window.H;

        if (!H) {
          throw new Error("HERE Maps API not loaded");
        }

        // Clean up existing map instance if it exists
        if (mapInstance.current) {
          mapInstance.current.dispose();
          mapInstance.current = null;
        }

        // Initialize platform with API key
        platformRef.current = new H.service.Platform({ apikey });

        // Create default layers
        const defaultLayers = platformRef.current.createDefaultLayers();

        // Initialize the map
        mapInstance.current = new H.Map(
          mapRef.current,
          defaultLayers.vector.normal.map,
          {
            center: { lat: 9.0572, lng: 38.7592 },
            zoom: 14,
            pixelRatio: window.devicePixelRatio || 1,
          }
        );

        // Add map events for interactivity (pan/zoom)
        const behavior = new H.mapevents.Behavior(
          new H.mapevents.MapEvents(mapInstance.current)
        );

        // Add UI controls
        H.ui.UI.createDefault(mapInstance.current, defaultLayers);

        // Add tap event listener for placing marker
        mapInstance.current?.addEventListener("tap", (evt: any) => {
          const coord = mapInstance.current!.screenToGeo(
            evt.currentPointer.viewportX,
            evt.currentPointer.viewportY
          );

          if (coord) {
            const newCoord = {
              lat: coord.lat.toFixed(6),
              lng: coord.lng.toFixed(6),
            };
            setCoordinates(newCoord);
            onCoordinatesChange(newCoord);

            // Update or create marker
            if (markerRef.current) {
              markerRef.current.setGeometry(coord);
            } else {
              markerRef.current = new H.map.Marker(coord);
              mapInstance.current!.addObject(markerRef.current!);
            }

            // Update or create circle
            if (circleRef.current) {
              circleRef.current.setCenter(coord);
              circleRef.current.setRadius(radius);
            } else {
              circleRef.current = new H.map.Circle(coord, radius, {
                style: {
                  strokeColor: "rgba(255, 0, 0, 0.7)",
                  lineWidth: 2,
                  fillColor: "rgba(0, 255, 0, 0.3)",
                },
              });
              mapInstance.current!.addObject(circleRef.current!);
            }
          }
        });

        setIsMapLoading(false);
      } catch (err) {
        console.error("Map initialization error:", err);
        setError(
          `Map initialization failed: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
        setIsMapLoading(false);
      }
    };

    initializeMap();

    // Cleanup function
    return () => {
      isMounted = false;
      if (mapInstance.current) {
        mapInstance.current.dispose();
        mapInstance.current = null;
      }
    };
  }, [apikey]);

  // Update circle radius when radius prop changes
  useEffect(() => {
    if (!mapInstance.current || !circleRef.current) return;

    circleRef.current.setRadius(radius);
  }, [radius]);

  // Handle coordinate input changes
  const handleCoordinateInputChange = (type: "lat" | "lng", value: string) => {
    const newCoord = { ...coordinates, [type]: value };
    setCoordinates(newCoord);
  };

  // Handle search
  const handleSearch = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!searchQuery || !mapInstance.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const encodedQuery = encodeURIComponent(searchQuery);
      const url = `/api/geocode?q=${encodedQuery}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Geocoding request failed with status: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const position = data.items[0].position;
        const newCoord = {
          lat: position.lat.toFixed(6),
          lng: position.lng.toFixed(6),
        };
        setCoordinates(newCoord);
        onCoordinatesChange(newCoord);
      } else {
        setError("No results found for your search query.");
      }
    } catch (error) {
      console.error("Search error:", error);
      setError(
        `Search failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMapLoading(true);
    if (
      !mapInstance.current ||
      !markerRef.current ||
      !circleRef.current ||
      !coordinates.lat ||
      !coordinates.lng
    ) {
      setIsMapLoading(false);
      return;
    }

    // Update map center
    mapInstance.current.setCenter({
      lat: +coordinates.lat,
      lng: +coordinates.lng,
    });

    // Update marker position
    markerRef.current.setGeometry({
      lat: +coordinates.lat,
      lng: +coordinates.lng,
    });

    // Update circle position
    circleRef.current.setCenter({
      lat: +coordinates.lat,
      lng: +coordinates.lng,
    });

    setIsMapLoading(false);
  }, [coordinates]);

  return (
    <Card className="w-full mx-auto shadow-lg">
      <CardContent>
        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <AddressField
              value={searchQuery}
              onSelect={(selected) => {
                setSearchQuery(selected);
                handleSearch({
                  preventDefault: () => {},
                  stopPropagation: () => {},
                } as any);
              }}
            />
          </div>

          <Button
            type="button"
            onClick={handleSearch}
            disabled={isLoading || isMapLoading || !searchQuery}
            className="bg-[#E66641] text-white"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Search
          </Button>
        </div>

        <div
          className={cn(
            "relative w-full h-[400px] bg-slate-100 rounded-md overflow-hidden"
          )}
        >
          {isMapLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 bg-opacity-80 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading map...</span>
            </div>
          )}
          <div ref={mapRef} className="w-full h-full" />
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {coordinates.lat && coordinates.lng && (
          <div className="mt-4 p-3 bg-slate-50 rounded-md flex items-center justify-center gap-4">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1 text-primary" />
              <Input
                type="text"
                value={coordinates.lat}
                onChange={(e) =>
                  handleCoordinateInputChange("lat", e.target.value)
                }
                placeholder="Latitude"
                className="w-32 text-sm"
              />
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1 text-primary" />
              <Input
                type="text"
                value={coordinates.lng}
                onChange={(e) =>
                  handleCoordinateInputChange("lng", e.target.value)
                }
                placeholder="Longitude"
                className="w-32 text-sm"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HereMap;
