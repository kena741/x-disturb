"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, MapPin, Navigation, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import AddressField from "./AddressSuggestion";

type HereMapProps = {
  onCoordinatesChange: (coords: { lat: string; lng: string }) => void;
  onAddressChange?: (address: string) => void;
  radius: number;
  initialCoordinates?: { lat: string; lng: string };
  initialAddress?: string;
};

const HereMap = ({
  onCoordinatesChange,
  onAddressChange,
  radius,
  initialCoordinates,
  initialAddress,
}: HereMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<InstanceType<NonNullable<Window["H"]>["Map"]> | null>(null);
  const markerRef = useRef<InstanceType<NonNullable<Window["H"]>["map"]["Marker"]> | null>(null);
  const circleRef = useRef<InstanceType<NonNullable<Window["H"]>["map"]["Circle"]> | null>(null);
  const platformRef = useRef<any>(null);
  const [coordinates, setCoordinates] = useState<{
    lat: string | null;
    lng: string | null;
  }>({
    lat: initialCoordinates?.lat || null,
    lng: initialCoordinates?.lng || null,
  });
  const [searchQuery, setSearchQuery] = useState<string>(initialAddress || "");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isMapLoading, setIsMapLoading] = useState<boolean>(true);

  const apikey: string = process.env.NEXT_PUBLIC_HERE_API_KEY || "";

  // Load HERE Maps scripts and initialize the map
  useEffect(() => {
    if (!apikey) {
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
        await loadScript("https://js.api.here.com/v3/3.1/mapsjs-core.js");
        await loadScript("https://js.api.here.com/v3/3.1/mapsjs-service.js");
        await loadScript("https://js.api.here.com/v3/3.1/mapsjs-ui.js");
        await loadScript("https://js.api.here.com/v3/3.1/mapsjs-mapevents.js");

        if (!isMounted) return;

        const here = window.H;

        if (!here) {
          throw new Error("HERE Maps API not loaded");
        }

        if (mapInstance.current) {
          mapInstance.current.dispose();
          mapInstance.current = null;
        }

        platformRef.current = new here.service.Platform({ apikey });

        const defaultLayers = platformRef.current.createDefaultLayers();

        const hasInitialCoords =
          initialCoordinates &&
          initialCoordinates.lat &&
          initialCoordinates.lng &&
          initialCoordinates.lat !== "0" &&
          initialCoordinates.lng !== "0";
        const mapCenter = hasInitialCoords
          ? {
              lat: parseFloat(initialCoordinates.lat!),
              lng: parseFloat(initialCoordinates.lng!),
            }
          : { lat: 9.0572, lng: 38.7592 };

        mapInstance.current = new here.Map(
          mapRef.current!,
          defaultLayers.vector.normal.map,
          {
            center: mapCenter,
            zoom: 14,
            pixelRatio: window.devicePixelRatio || 1,
          }
        );

        const behavior = new here.mapevents.Behavior(
          new here.mapevents.MapEvents(mapInstance.current)
        );

        here.ui.UI.createDefault(mapInstance.current, defaultLayers);

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

            if (markerRef.current) {
              markerRef.current.setGeometry(coord);
            } else {
              markerRef.current = new here.map.Marker(coord);
              mapInstance.current!.addObject(markerRef.current!);
            }

            if (circleRef.current) {
              circleRef.current.setCenter(coord);
              circleRef.current.setRadius(radius);
            } else {
              circleRef.current = new here.map.Circle(coord, radius, {
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
        setIsMapLoading(false);
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
      if (mapInstance.current) {
        mapInstance.current.dispose();
        mapInstance.current = null;
      }
    };
  }, [apikey, initialCoordinates, onCoordinatesChange, radius]);

  // Update circle radius when radius prop changes
  useEffect(() => {
    if (!mapInstance.current || !circleRef.current) return;

    circleRef.current.setRadius(radius);
  }, [radius]);

  const handleCoordinateInputChange = (type: "lat" | "lng", value: string) => {
    const newCoord = { ...coordinates, [type]: value };
    setCoordinates(newCoord);
  };

  const handleApplyCoords = () => {
    if (coordinates.lat && coordinates.lng) {
      onCoordinatesChange({
        lat: coordinates.lat,
        lng: coordinates.lng,
      });
    }
  };

  const performSearch = async (query: string) => {
    if (!query || !mapInstance.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const encodedQuery = encodeURIComponent(query);
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

  const handleSearch = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    await performSearch(searchQuery);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        const newCoord = { lat, lng };

        setCoordinates(newCoord);
        onCoordinatesChange(newCoord);

        try {
          const response = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}`);
          if (!response.ok) {
            throw new Error("Failed to reverse geocode location");
          }
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            const address = data.items[0].title;
            setSearchQuery(address);
            if (onAddressChange) {
              onAddressChange(address);
            }
          }
        } catch (err) {
          console.error("Reverse geocoding error:", err);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        let errorMsg = "Failed to retrieve your current location.";
        if (err.code === 1) {
          errorMsg = "Permission denied. Please allow location access in your browser.";
        } else if (err.code === 2) {
          errorMsg = "Position unavailable. Please try again.";
        } else if (err.code === 3) {
          errorMsg = "Location request timed out. Please try again.";
        }
        setError(errorMsg);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    setIsMapLoading(true);
    if (
      !mapInstance.current ||
      !coordinates.lat ||
      !coordinates.lng
    ) {
      setIsMapLoading(false);
      return;
    }

    const here = window.H;
    const coord = { lat: +coordinates.lat, lng: +coordinates.lng };

    mapInstance.current.setCenter(coord);

    if (markerRef.current) {
      markerRef.current.setGeometry(coord);
    } else {
      markerRef.current = new here.map.Marker(coord);
      mapInstance.current.addObject(markerRef.current!);
    }

    if (circleRef.current) {
      circleRef.current.setCenter(coord);
      circleRef.current.setRadius(radius);
    } else {
      circleRef.current = new here.map.Circle(coord, radius, {
        style: {
          strokeColor: "rgba(255, 0, 0, 0.7)",
          lineWidth: 2,
          fillColor: "rgba(0, 255, 0, 0.3)",
        },
      });
      mapInstance.current.addObject(circleRef.current!);
    }

    setIsMapLoading(false);
  }, [coordinates, radius]);

  const mapAvailable = !!apikey;

  return (
    <Card className="w-full mx-auto shadow-lg">
      <CardContent>
        {mapAvailable ? (
          <>
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <div className="flex-1">
                <AddressField
                  value={searchQuery}
                  onSelect={(selected) => {
                    setSearchQuery(selected);
                    if (onAddressChange) {
                      onAddressChange(selected);
                    }
                    performSearch(selected);
                  }}
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  onClick={handleSearch}
                  disabled={isLoading || isMapLoading || isLocating || !searchQuery}
                  className="flex-1 sm:flex-none"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Search
                </Button>

                <Button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={isLoading || isMapLoading || isLocating}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10 flex items-center gap-1 flex-1 sm:flex-none"
                >
                  {isLocating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <MapPin className="h-4 w-4 mr-1" />
                  )}
                  Current Location
                </Button>
              </div>
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
          </>
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm">Map unavailable — enter coordinates manually</p>
          </div>
        )}

        <div className="mt-4 p-3 bg-slate-50 rounded-md flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1 text-primary" />
            <Input
              type="text"
              value={coordinates.lat || ""}
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
              value={coordinates.lng || ""}
              onChange={(e) =>
                handleCoordinateInputChange("lng", e.target.value)
              }
              placeholder="Longitude"
              className="w-32 text-sm"
            />
          </div>
          {!mapAvailable && (
            <Button type="button" variant="outline" size="sm" onClick={handleApplyCoords}>
              Apply
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HereMap;
