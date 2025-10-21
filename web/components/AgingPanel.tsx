"use client";

import { useMemo } from 'react';
import { useDemoStore } from '@/lib/store';

function daysDiff(vencISO: string) {
  const diff = Math.floor((Date.now() - new Date(vencISO).getTime()) / (24 * 3600 * 1000));
  return diff;
}

export function AgingPanel() {
  const boletos = useDemoStore((s) => s.data.entities.boletos);
  const aging = useMemo(() => {
    const buckets = { b0_30: 0, b31_60: 0, b61_90: 0, b90p: 0 };
    for (const b of boletos) {
      if (b.status === 'pago') continue;
      const d = daysDiff(b.vencimento);
      if (d <= 0) continue;
      if (d <= 30) buckets.b0_30++;
      else if (d <= 60) buckets.b31_60++;
      else if (d <= 90) buckets.b61_90++;
      else buckets.b90p++;
    }
    return buckets;
  }, [boletos]);

  const items = [
    { label: '0–30 dias', value: aging.b0_30, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { label: '31–60 dias', value: aging.b31_60, color: 'bg-orange-100 text-orange-800 border-orange-200' },
    { label: '61–90 dias', value: aging.b61_90, color: 'bg-amber-100 text-amber-800 border-amber-200' },
    { label: '+90 dias', value: aging.b90p, color: 'bg-red-100 text-red-800 border-red-200' },
  ];

  return (
    <div className="rounded-lg border p-4 bg-background">
      <div className="text-sm text-foreground/70 mb-2">Aging de Inadimplência</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((it) => (
          <div key={it.label} className={`rounded-md border p-3 ${it.color}`}>
            <div className="text-xs">{it.label}</div>
            <div className="text-xl font-semibold">{it.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

