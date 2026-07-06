"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface HereMapsApi {
  service: {
    Platform: new (options: { apikey: string }) => {
      createDefaultLayers: () => {
        vector: { normal: { map: unknown } };
      };
    };
  };
  Map: new (
    element: HTMLElement,
    layer: unknown,
    options: { zoom: number; center: { lat: number; lng: number } }
  ) => {
    dispose: () => void;
    setCenter: (center: { lat: number; lng: number }) => void;
    addObject: (object: unknown) => void;
  };
  mapevents: {
    Behavior: new (events: unknown) => unknown;
    MapEvents: new (map: unknown) => unknown;
  };
  map: {
    Marker: new (coords: { lat: number; lng: number }) => {
      setGeometry: (coords: { lat: number; lng: number }) => void;
    };
    Circle: new (
      center: { lat: number; lng: number },
      radius: number,
      options: { style: { strokeColor: string; lineWidth: number; fillColor: string } }
    ) => {
      setCenter: (center: { lat: number; lng: number }) => void;
      setRadius: (radius: number) => void;
    };
  };
  ui: {
    UI: {
      createDefault: (map: unknown, layers: unknown) => void;
    };
  };
}

declare global {
  interface Window {
    H: HereMapsApi;
  }
}

interface ActivityMapProps {
  coords: { lat: number; lng: number };
  radius: number;
}

const MAP_HEIGHT = 480;

export default function ActivityMap({ coords: { lat, lng }, radius }: ActivityMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<InstanceType<HereMapsApi["Map"]> | null>(null);
  const markerRef = useRef<InstanceType<HereMapsApi["map"]["Marker"]> | null>(null);
  const circleRef = useRef<InstanceType<HereMapsApi["map"]["Circle"]> | null>(null);
  const platformRef = useRef<InstanceType<HereMapsApi["service"]["Platform"]> | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);

  useEffect(() => {
    if (!mapRef.current) {
      setIsMapLoading(false);
      return;
    }

    setIsMapLoading(true);

    const loadScript = (src: string): Promise<void> =>
      new Promise((resolve) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        document.body.appendChild(script);
      });

    let isMounted = true;

    const initializeMap = async () => {
      await loadScript("https://js.api.here.com/v3/3.1/mapsjs-core.js");
      await loadScript("https://js.api.here.com/v3/3.1/mapsjs-service.js");
      await loadScript("https://js.api.here.com/v3/3.1/mapsjs-ui.js");
      await loadScript("https://js.api.here.com/v3/3.1/mapsjs-mapevents.js");

      if (!isMounted || !mapRef.current) return;

      const H = window.H;
      if (!H) {
        setIsMapLoading(false);
        return;
      }

      if (mapInstance.current) {
        mapInstance.current.dispose();
        mapInstance.current = null;
      }

      platformRef.current = new H.service.Platform({
        apikey: process.env.NEXT_PUBLIC_HERE_API_KEY as string,
      });

      const defaultLayers = platformRef.current.createDefaultLayers();

      mapInstance.current = new H.Map(
        mapRef.current,
        defaultLayers.vector.normal.map,
        { zoom: 14, center: { lat, lng } }
      );

      new H.mapevents.Behavior(new H.mapevents.MapEvents(mapInstance.current));
      H.ui.UI.createDefault(mapInstance.current, defaultLayers);

      markerRef.current = new H.map.Marker({ lat, lng });
      mapInstance.current.addObject(markerRef.current);

      circleRef.current = new H.map.Circle({ lat, lng }, radius, {
        style: {
          strokeColor: "hsla(14, 75%, 58%, 0.9)",
          lineWidth: 2,
          fillColor: "hsla(14, 75%, 58%, 0.15)",
        },
      });
      mapInstance.current.addObject(circleRef.current);

      setIsMapLoading(false);
    };

    initializeMap().catch(() => {
      if (isMounted) setIsMapLoading(false);
    });

    return () => {
      isMounted = false;
      mapInstance.current?.dispose();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !markerRef.current || !circleRef.current) return;

    mapInstance.current.setCenter({ lat, lng });
    markerRef.current.setGeometry({ lat, lng });
    circleRef.current.setCenter({ lat, lng });
    circleRef.current.setRadius(radius);
  }, [lat, lng, radius]);

  return (
    <div className="relative bg-muted/30">
      {isMapLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading map…</span>
        </div>
      )}
      <div
        ref={mapRef}
        className="w-full"
        style={{ height: MAP_HEIGHT }}
        aria-label="Zone activity map"
      />
    </div>
  );
}
