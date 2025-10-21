"use client";

import { useMemo, useState } from "react";
import { useDemoStore } from "@/lib/store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type Row = { proprietario: string; bruto: number; taxas: number; liquido: number };

export default function RelatorioRepassesPage() {
  const { repasses, proprietarios } = useDemoStore((s) => s.data.entities);
  const competencias = Array.from(new Set(repasses.map(r=>r.competencia))).sort();
  const [comp, setComp] = useState<string>(competencias[competencias.length-1] || '');

  const rows = useMemo<Row[]>(() => {
    const filtered = comp ? repasses.filter(r=>r.competencia===comp) : repasses;
    const byProp = new Map<string, { bruto: number; taxas: number; liquido: number }>();
    for (const r of filtered) {
      const cur = byProp.get(r.proprietarioId) || { bruto: 0, taxas: 0, liquido: 0 };
      cur.bruto += r.valorBruto; cur.taxas += r.taxas; cur.liquido += r.valorLiquido;
      byProp.set(r.proprietarioId, cur);
    }
    return Array.from(byProp.entries()).map(([propId, v]) => {
      const prop = proprietarios.find(p=>p.id===propId);
      return { proprietario: prop?.nome || propId, bruto: v.bruto, taxas: v.taxas, liquido: v.liquido };
    }).sort((a,b)=> b.liquido - a.liquido);
  }, [repasses, proprietarios, comp]);

  const exportCSV = () => {
    const header = ["Proprietario","Bruto","Taxas","Liquido"]; const lines = rows.map(r=>[r.proprietario, r.bruto, r.taxas, r.liquido].join(","));
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'relatorio_repasses.csv'; a.click(); URL.revokeObjectURL(url);
  };
  const printPDF = () => {
    const win = window.open('', '_blank'); if (!win) return;
    win.document.write('<html><head><title>Relatório de Repasses</title></head><body><pre>' + JSON.stringify(rows, null, 2) + '</pre></body></html>');
    win.document.close(); win.focus(); win.print();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Relatório de Repasses por Proprietário</h1>
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label className="text-xs">Competência</label>
          <Select value={comp} onValueChange={setComp}>
            <SelectTrigger className="w-56"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {competencias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={exportCSV}>Exportar CSV</Button>
          <Button variant="outline" onClick={printPDF}>Imprimir (PDF)</Button>
        </div>
      </div>
      <div className="rounded-lg border p-2 bg-background overflow-x-auto">
        <table className="min-w-[700px] w-full text-sm">
          <thead>
            <tr>
              <th className="text-left border-b py-2 pr-2 font-medium">Proprietário</th>
              <th className="text-left border-b py-2 pr-2 font-medium">Bruto</th>
              <th className="text-left border-b py-2 pr-2 font-medium">Taxas</th>
              <th className="text-left border-b py-2 pr-2 font-medium">Líquido</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b last:border-b-0">
                <td className="py-2 pr-2">{r.proprietario}</td>
                <td className="py-2 pr-2">{r.bruto.toLocaleString('pt-BR',{style:'currency', currency:'BRL'})}</td>
                <td className="py-2 pr-2">{r.taxas.toLocaleString('pt-BR',{style:'currency', currency:'BRL'})}</td>
                <td className="py-2 pr-2">{r.liquido.toLocaleString('pt-BR',{style:'currency', currency:'BRL'})}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

