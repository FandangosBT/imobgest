"use client";

import { useEffect, useMemo, useState } from 'react';
import { useDemoStore } from '@/lib/store';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export function ChartRepasses() {
  const repasses = useDemoStore((s) => s.data.entities.repasses);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const serie = useMemo(() => {
    // soma por competência (últimos 6 meses)
    const byComp = new Map<string, number>();
    for (const r of repasses) {
      byComp.set(r.competencia, (byComp.get(r.competencia) || 0) + r.valorLiquido);
    }
    const comps = Array.from(byComp.keys()).sort().slice(-6);
    return comps.map((c) => {
      const mesIdx = parseInt(c.split('-')[1], 10) - 1;
      const mes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][mesIdx];
      return { comp: c, mes, valor: byComp.get(c) || 0 };
    });
  }, [repasses]);

  if (!mounted) return (
    <div className="rounded-lg border p-4 bg-background" aria-hidden>
      <div className="h-[260px] w-full" />
    </div>
  );

  return (
    <div className="rounded-lg border p-4 bg-background min-w-0">
      <div className="text-sm text-foreground/70 mb-2">Repasses por mês (valor líquido)</div>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
          <BarChart data={serie} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis tickFormatter={(v) => (v / 1000).toFixed(0) + 'k'} />
            <Tooltip formatter={(v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
            <Bar dataKey="valor" fill="#60a5fa" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
