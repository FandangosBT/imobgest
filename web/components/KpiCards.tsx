"use client";

import { useDemoStore } from '@/lib/store';
import { motion } from 'framer-motion';

export function KpiCards() {
  const { kpis } = useDemoStore((s) => s.data);
  const cards = [
    { label: 'Contratos vigentes', value: kpis.contratosVigentes.toString() },
    { label: 'Taxa de ocupação', value: `${Math.round(kpis.taxaOcupacao * 100)}%` },
    { label: 'Inadimplência', value: `${Math.round(kpis.inadimplenciaPercent * 100)}%` },
    { label: 'Vencendo em 7 dias', value: kpis.vencendo7dias.toString() },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, idx) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="rounded-lg border p-4 bg-background"
        >
          <div className="text-sm text-foreground/60">{c.label}</div>
          <div className="text-2xl font-semibold mt-1">{c.value}</div>
        </motion.div>
      ))}
    </div>
  );
}
