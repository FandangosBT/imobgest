"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl, { Map as MapLibreMap, Popup, MapGeoJSONFeature, GeoJSONSource, MapLayerMouseEvent } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useDemoStore } from '@/lib/store';
import type { FeatureCollection, Point } from 'geojson';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

type ImovelProps = { id: string; nome: string; status: string };

function toGeoJSON(points: { id: string; nome: string; lat: number; lng: number; status: string }[]): FeatureCollection<Point, ImovelProps> {
  return {
    type: 'FeatureCollection',
    features: points.map((p) => ({
      type: 'Feature',
      properties: { id: p.id, nome: p.nome, status: p.status },
      geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
    })),
  };
}

function distKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371; // km
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLon = (b.lng - a.lng) * Math.PI / 180;
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

export default function MapaPage() {
  const store = useDemoStore();
  const allPoints = store.data.imoveisMapa;
  const entities = store.data.entities;

  const cities = useMemo(() => Array.from(new Set(entities.imoveis.map(i=>i.cidade))).sort(), [entities.imoveis]);
  const [city, setCity] = useState<string>('');
  const [radius, setRadius] = useState<number>(10);

  const center = useMemo(() => {
    if (!city || city === 'all') return allPoints[0] ? { lat: allPoints[0].lat, lng: allPoints[0].lng } : { lat: -23.56, lng: -46.64 };
    const arr = entities.imoveis.filter(i => i.cidade === city);
    if (!arr.length) return { lat: -23.56, lng: -46.64 };
    const lat = arr.reduce((a,b)=>a+b.geo.lat, 0) / arr.length;
    const lng = arr.reduce((a,b)=>a+b.geo.lng, 0) / arr.length;
    return { lat, lng };
  }, [city, allPoints, entities.imoveis]);

  const points = useMemo(() => {
    if (!center) return allPoints;
    return allPoints.filter(p => distKm(center, { lat: p.lat, lng: p.lng }) <= radius);
  }, [allPoints, center, radius]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  // create and update map
  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({ container: containerRef.current, style: 'https://demotiles.maplibre.org/style.json', center: [center.lng, center.lat], zoom: 11 });
    mapRef.current = map;
    map.on('load', () => {
      map.addSource('imoveis', { type: 'geojson', data: toGeoJSON(points), cluster: true, clusterMaxZoom: 14, clusterRadius: 50 });
      map.addLayer({ id: 'clusters', type: 'circle', source: 'imoveis', filter: ['has', 'point_count'], paint: { 'circle-color': '#5485ff', 'circle-radius': ['step', ['get','point_count'], 16, 10, 22, 50, 28], 'circle-opacity': 0.8 } });
      map.addLayer({ id: 'cluster-count', type: 'symbol', source: 'imoveis', filter: ['has', 'point_count'], layout: { 'text-field': ['get','point_count'], 'text-size': 12 }, paint: { 'text-color': '#fff' } });
      map.addLayer({ id: 'unclustered-point', type: 'circle', source: 'imoveis', filter: ['!', ['has','point_count']], paint: { 'circle-color': ['match',['get','status'],'vago','#ef4444','manutencao','#f59e0b','#22c55e'], 'circle-radius': 8, 'circle-stroke-width': 1, 'circle-stroke-color': '#fff' } });

      map.on('click', 'unclustered-point', (e: MapLayerMouseEvent) => {
        const f = (e.features?.[0] as MapGeoJSONFeature) || null;
        if (!f) return;
        const { id, nome, status } = f.properties as unknown as ImovelProps & { id: string };
        const imovel = entities.imoveis.find(i=>i.id===id);
        const contrato = imovel ? entities.contratos.find(c=>c.id===imovel.contratoVigenteId) : undefined;
        const inquilino = contrato ? entities.inquilinos.find(i=>i.id===contrato.inquilinoId) : undefined;
        const [lng, lat] = (f.geometry.type === 'Point' ? (f.geometry.coordinates as [number, number]) : [0, 0]);
        const contratoHtml = contrato ? `<div>Contrato: <a href="/contratos/${contrato.id}" style="text-decoration:underline">${contrato.id.slice(0,8).toUpperCase()}</a></div>` : '';
        const detalheHtml = `<div><a href="/imoveis/${id}" style="text-decoration:underline">Ver detalhes do imóvel</a></div>`;
        const inqHtml = inquilino ? `<div>Inquilino: ${inquilino.nome}</div>` : '';
        new Popup().setLngLat([lng, lat]).setHTML(`<div style="font-weight:600">${nome}</div><div>Status: ${status}</div>${contratoHtml}${inqHtml}${detalheHtml}`).addTo(map);
      });
    });
    return () => { map.remove(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // update data & view on filters/center changes
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    const src = map.getSource('imoveis') as GeoJSONSource | undefined;
    if (src) src.setData(toGeoJSON(points));
    map.easeTo({ center: [center.lng, center.lat] });
  }, [points, center]);

  const counts = useMemo(() => {
    const c = { ocupado: 0, vago: 0, manutencao: 0 } as Record<'ocupado'|'vago'|'manutencao', number>;
    for (const p of points) c[p.status]++;
    return c;
  }, [points]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Mapa e Geolocalização</h1>
      <div className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="text-xs">Cidade</label>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="w-64"><SelectValue placeholder="Todas" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs">Raio (km)</label>
          <Input type="number" value={radius} onChange={(e)=>setRadius(Number(e.target.value)||10)} />
        </div>
      </div>

      <div className="relative rounded-lg border bg-background">
        <div className="absolute z-10 top-3 left-3 bg-white/90 dark:bg-black/60 backdrop-blur rounded-md border px-3 py-2 text-xs space-y-1">
          <div className="font-medium">Legenda</div>
          <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full" style={{background:'#22c55e'}} /> Ocupado ({counts.ocupado})</div>
          <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full" style={{background:'#ef4444'}} /> Vago ({counts.vago})</div>
          <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full" style={{background:'#f59e0b'}} /> Manutenção ({counts.manutencao})</div>
        </div>
        <div ref={containerRef} className="h-[520px] w-full rounded-lg" />
      </div>
    </div>
  );
}
