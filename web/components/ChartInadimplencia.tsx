"use client";

import { useEffect, useState } from 'react';
import { useDemoStore } from '@/lib/store';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

export function ChartInadimplencia() {
  const serie = useDemoStore((s) => s.data.inadimplenciaSerie);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return (
    <div className="rounded-lg border p-4 bg-background" aria-hidden>
      <div className="h-[260px] w-full" />
    </div>
  );
  return (
    <div className="rounded-lg border p-4 bg-background min-w-0" role="img" aria-label="Gráfico de recebimentos versus esperado por mês">
      <div className="text-sm text-foreground/70 mb-2">Recebimentos vs. Esperado</div>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
          <LineChart data={serie} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis tickFormatter={(v) => (v / 1000).toFixed(0) + 'k'} />
            <Tooltip formatter={(v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
            <Legend />
            <Line type="monotone" dataKey="esperado" stroke="#8884d8" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="recebido" stroke="#82ca9d" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
