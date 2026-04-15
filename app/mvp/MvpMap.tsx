"use client";

import { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoiYXRsYXNib3N0b24iLCJhIjoiY21qejY1c211Nmt2azNlcHMwcnljOGR1dCJ9.Pnq-qa_giDk0LN95OpFvMg";

interface MvpMapProps {
  onMapClick: (lat: number, lng: number) => void;
  eventMarkers: Array<{ latitude: number; longitude: number }>;
}

export default function MvpMap({ onMapClick, eventMarkers }: MvpMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const clickMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const eventMarkersRef = useRef<mapboxgl.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [0, 20],
      zoom: 2,
      projection: "globe",
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("style.load", () => {
      map.setFog({
        color: "rgb(10, 10, 20)",
        "high-color": "rgb(20, 20, 40)",
        "horizon-blend": 0.08,
        "space-color": "rgb(5, 5, 15)",
        "star-intensity": 0.6,
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle click
  const handleClick = useCallback(
    (e: mapboxgl.MapMouseEvent) => {
      const { lat, lng } = e.lngLat;

      // Place/move click marker
      if (clickMarkerRef.current) {
        clickMarkerRef.current.setLngLat([lng, lat]);
      } else {
        clickMarkerRef.current = new mapboxgl.Marker({ color: "#3b82f6" })
          .setLngLat([lng, lat])
          .addTo(mapRef.current!);
      }

      onMapClick(lat, lng);
    },
    [onMapClick]
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [handleClick]);

  // Update event markers
  useEffect(() => {
    // Clear old markers
    eventMarkersRef.current.forEach((m) => m.remove());
    eventMarkersRef.current = [];

    if (!mapRef.current) return;

    // Dedupe by coordinate to avoid stacking
    const seen = new Set<string>();
    for (const ev of eventMarkers) {
      const key = `${ev.latitude.toFixed(3)},${ev.longitude.toFixed(3)}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const el = document.createElement("div");
      el.style.width = "10px";
      el.style.height = "10px";
      el.style.borderRadius = "50%";
      el.style.background = "rgba(239, 68, 68, 0.8)";
      el.style.border = "2px solid rgba(239, 68, 68, 0.4)";
      el.style.boxShadow = "0 0 8px rgba(239, 68, 68, 0.5)";

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([ev.longitude, ev.latitude])
        .addTo(mapRef.current!);

      eventMarkersRef.current.push(marker);
    }
  }, [eventMarkers]);

  return <div ref={containerRef} className="w-full h-full" />;
}
