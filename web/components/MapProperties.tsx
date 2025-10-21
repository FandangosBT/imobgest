"use client";

import { useDemoStore } from '@/lib/store';

export function MapProperties() {
  const points = useDemoStore((s) => s.data.imoveisMapa);
  const center = points.length ? { lat: points[0].lat, lng: points[0].lng } : { lat: -23.56, lng: -46.64 };
  const bbox = `${center.lng - 0.09},${center.lat - 0.06},${center.lng + 0.09},${center.lat + 0.06}`;
  const markerParam = `${center.lat}%2C${center.lng}`; // one marker for embed
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${markerParam}`;

  return (
    <div className="rounded-lg border bg-background">
      <div className="text-sm text-foreground/70 p-4 pb-0">Mapa de Imóveis</div>
      <div className="h-[300px] w-full">
        <iframe title="mapa" src={src} className="w-full h-full rounded-b-lg" />
      </div>
    </div>
  );
}
