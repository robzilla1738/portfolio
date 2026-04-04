"use client";

import * as React from "react";
import { DottedMap } from "@/components/ui/dotted-map";
import type { Marker } from "@/components/ui/dotted-map";

interface Location {
  label: string;
  flag: string;
  lat: number;
  lng: number;
  // Position as percentage of map container
  top: string;
  left: string;
}

const locations: Location[] = [
  { label: "Bay Area", flag: "🇺🇸", lat: 37.77, lng: -122.42, top: "38%", left: "14%" },
  { label: "Texas", flag: "🇺🇸", lat: 31.97, lng: -99.9, top: "44%", left: "23%" },
  { label: "Louisiana, Alabama", flag: "🇺🇸", lat: 31.2, lng: -89.0, top: "43%", left: "30%" },
  { label: "Moscow", flag: "🇷🇺", lat: 55.76, lng: 37.62, top: "26%", left: "68%" },
];

const markers: Marker[] = locations.map((l) => ({
  lat: l.lat,
  lng: l.lng,
  size: 0.8,
  pulse: true,
}));

export function LocationMap() {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: "clamp(280px, 40vw, 480px)" }}>
      {/* Dotted map background */}
      <div className="absolute inset-0">
        <DottedMap
          markers={markers}
          dotColor="rgba(255,255,255,0.12)"
          markerColor="#3b82f6"
          dotRadius={0.2}
          pulse
        />
      </div>

      {/* Gradient fade at edges */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30" />

      {/* HTML labels positioned over the map */}
      {locations.map((loc) => (
        <div
          key={loc.label}
          className="group absolute -translate-x-1/2 -translate-y-1/2"
          style={{ top: loc.top, left: loc.left }}
        >
          {/* Ping dot */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <span className="absolute inline-flex h-3 w-3 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-blue-400 opacity-40" />
            <span className="absolute inline-flex h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400" />
          </div>

          {/* Label pill */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-black shadow-lg backdrop-blur-sm transition-all duration-200 group-hover:bg-white group-hover:scale-105">
            <span className="mr-1.5">{loc.flag}</span>
            {loc.label}
          </div>
        </div>
      ))}
    </div>
  );
}
