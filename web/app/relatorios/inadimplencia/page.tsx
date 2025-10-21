"use client";

import { useMemo } from "react";
import { useDemoStore } from "@/lib/store";
import { ChartInadimplencia } from "@/components/ChartInadimplencia";
import { Button } from "@/components/ui/button";

type Row = { mes: string; esperado: number; recebido: number; inadimplencia: number; perc: number };

export default function RelatorioInadimplenciaPage() {
  const serie = useDemoStore((s) => s.data.inadimplenciaSerie);
  const rows = useMemo<Row[]>(() => {
    return serie.map((p) => {
      const inad = Math.max(0, p.esperado - p.recebido);
      const perc = p.esperado ? Math.round((inad / p.esperado) * 100) : 0;
      return { mes: p.mes, esperado: p.esperado, recebido: p.recebido, inadimplencia: inad, perc };
    });
  }, [serie]);

  const exportCSV = () => {
    const header = ["Mês","Esperado","Recebido","Inadimplência","%"];
    const lines = rows.map(r => [r.mes, r.esperado, r.recebido, r.inadimplencia, r.perc+"%"].join(","));
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'relatorio_inadimplencia.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const printPDF = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write('<html><head><title>Relatório de Inadimplência</title></head><body><pre>' + JSON.stringify(rows, null, 2) + '</pre></body></html>');
    win.document.close(); win.focus(); win.print();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Relatório de Inadimplência</h1>
      <ChartInadimplencia />

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={exportCSV}>Exportar CSV</Button>
        <Button variant="outline" onClick={printPDF}>Imprimir (PDF)</Button>
      </div>

      <div className="rounded-lg border p-2 bg-background overflow-x-auto">
        <table className="min-w-[700px] w-full text-sm">
          <thead>
            <tr>
              <th className="text-left border-b py-2 pr-2 font-medium">Mês</th>
              <th className="text-left border-b py-2 pr-2 font-medium">Esperado</th>
              <th className="text-left border-b py-2 pr-2 font-medium">Recebido</th>
              <th className="text-left border-b py-2 pr-2 font-medium">Inadimplência</th>
              <th className="text-left border-b py-2 pr-2 font-medium">%</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.mes} className="border-b last:border-b-0">
                <td className="py-2 pr-2">{r.mes}</td>
                <td className="py-2 pr-2">{r.esperado.toLocaleString('pt-BR',{style:'currency', currency:'BRL'})}</td>
                <td className="py-2 pr-2">{r.recebido.toLocaleString('pt-BR',{style:'currency', currency:'BRL'})}</td>
                <td className="py-2 pr-2">{r.inadimplencia.toLocaleString('pt-BR',{style:'currency', currency:'BRL'})}</td>
                <td className="py-2 pr-2">{r.perc}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

