"use client";

import { useEffect, useRef } from 'react';
import maplibregl, { Map as MapLibreMap, Popup, MapGeoJSONFeature, GeoJSONSource, MapLayerMouseEvent } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useDemoStore } from '@/lib/store';
import type { FeatureCollection, Point } from 'geojson';

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

export function MapLibreProperties() {
  const points = useDemoStore((s) => s.data.imoveisMapa);
  const entities = useDemoStore((s) => s.data.entities);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const first = points[0] ?? { lat: -23.56, lng: -46.64 };
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [first.lng, first.lat],
      zoom: 11,
    });
    mapRef.current = map;

    map.on('load', () => {
      map.addSource('imoveis', {
        type: 'geojson',
        data: toGeoJSON(points),
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'imoveis',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#5485ff',
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            16,
            10,
            22,
            50,
            28,
          ],
          'circle-opacity': 0.8,
        },
      });
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'imoveis',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count'],
          'text-size': 12,
        },
        paint: { 'text-color': '#fff' },
      });
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'imoveis',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'match',
            ['get', 'status'],
            'vago', '#ef4444',
            'manutencao', '#f59e0b',
            /* default */ '#22c55e',
          ],
          'circle-radius': 8,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff',
        },
      });

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
        new Popup()
          .setLngLat([lng, lat])
          .setHTML(`<div style="font-weight:600">${nome}</div>
            <div>Status: ${status}</div>
            ${contratoHtml}
            ${inqHtml}
            ${detalheHtml}
          `)
          .addTo(map);
      });

      map.on('click', 'clusters', (e: MapLayerMouseEvent) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] }) as MapGeoJSONFeature[];
        const feature = features[0];
        const clusterId = feature?.properties?.cluster_id as number;
        const source = map.getSource('imoveis') as GeoJSONSource;
        const zoom = (source as unknown as { getClusterExpansionZoom: (id: number) => number }).getClusterExpansionZoom(clusterId);
        if (!feature) return;
        const coords = (feature.geometry.type === 'Point' ? feature.geometry.coordinates : undefined) as unknown as [number, number];
        map.easeTo({ center: coords, zoom });
      });
    });

    return () => {
      map.remove();
    };
  }, [points, entities]);

  return (
    <div className="rounded-lg border bg-background" role="region" aria-label="Mapa de Imóveis com status e contratos">
      <div className="text-sm text-foreground/70 p-4 pb-0">Mapa de Imóveis</div>
      <div ref={containerRef} className="h-[300px] w-full rounded-b-lg" aria-label="Mapa interativo" />
    </div>
  );
}
