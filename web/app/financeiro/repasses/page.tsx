"use client";

import { useMemo, useState } from 'react';
import { useDemoStore } from '@/lib/store';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Row = {
  id: string;
  proprietario: string;
  competencia: string;
  valorBruto: number;
  taxas: number;
  valorLiquido: number;
  status: 'pendente' | 'pago';
};

export default function RepassesPage() {
  const store = useDemoStore();
  const { repasses, proprietarios } = store.data.entities;
  const [propId, setPropId] = useState('');
  const [comp, setComp] = useState('');

  const rows = useMemo<Row[]>(() => {
    return repasses.map((r) => {
      const p = proprietarios.find((x) => x.id === r.proprietarioId);
      return { id: r.id, proprietario: p?.nome || '-', competencia: r.competencia, valorBruto: r.valorBruto, taxas: r.taxas, valorLiquido: r.valorLiquido, status: r.status };
    })
    .filter((r) => (propId && propId !== 'all' ? r.proprietario === (proprietarios.find(p=>p.id===propId)?.nome || '') : true))
    .filter((r) => (comp && comp !== 'all' ? r.competencia === comp : true));
  }, [repasses, proprietarios, propId, comp]);

  const columns = useMemo<ColumnDef<Row>[]>(() => [
    { header: 'Proprietário', accessorKey: 'proprietario' },
    { header: 'Competência', accessorKey: 'competencia' },
    { header: 'Bruto', accessorKey: 'valorBruto', cell: ({ getValue }) => getValue<number>().toLocaleString('pt-BR', { style:'currency', currency:'BRL'}) },
    { header: 'Taxas', accessorKey: 'taxas', cell: ({ getValue }) => getValue<number>().toLocaleString('pt-BR', { style:'currency', currency:'BRL'}) },
    { header: 'Líquido', accessorKey: 'valorLiquido', cell: ({ getValue }) => getValue<number>().toLocaleString('pt-BR', { style:'currency', currency:'BRL'}) },
    { header: 'Status', accessorKey: 'status' },
    { header: 'Ações', cell: ({ row }) => (
      <Button size="sm" variant="outline" disabled={row.original.status==='pago'} onClick={() => { const r = repasses.find(x=>x.id===row.original.id); if(!r) return; store.liquidarRepasse(r.id); toast.success('Repasse liquidado (mock)'); }}>Liquidar</Button>
    )},
  ], [repasses, store]);

  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), getFilteredRowModel: getFilteredRowModel() });

  const competencias = Array.from(new Set(repasses.map(r=>r.competencia))).sort();

  const exportCSV = () => {
    const header = ['Proprietario','Competencia','Bruto','Taxas','Liquido','Status'];
    const lines = rows.map(r => [r.proprietario, r.competencia, r.valorBruto, r.taxas, r.valorLiquido, r.status].join(','));
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'repasses.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const printPDF = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write('<html><head><title>Repasses</title></head><body><pre>' + JSON.stringify(rows, null, 2) + '</pre></body></html>');
    win.document.close(); win.focus(); win.print();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Financeiro – Repasses</h1>
      <div className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="text-xs">Proprietário</label>
          <Select value={propId} onValueChange={setPropId}>
            <SelectTrigger className="w-56"><SelectValue placeholder="Todos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {proprietarios.map(p=> <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs">Competência</label>
          <Select value={comp} onValueChange={setComp}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Todas" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {competencias.map(c=> <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={exportCSV}>Exportar CSV</Button>
          <Button variant="outline" onClick={printPDF}>Imprimir (PDF)</Button>
        </div>
      </div>

      <div className="rounded-lg border p-2 bg-background overflow-x-auto">
        <table className="min-w-[900px] w-full text-sm">
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(h => (
                  <th key={h.id} className="text-left border-b py-2 pr-2 font-medium">{flexRender(h.column.columnDef.header, h.getContext())}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(r => (
              <tr key={r.id} className="border-b last:border-b-0 hover:bg-foreground/5">
                {r.getVisibleCells().map(c => (
                  <td key={c.id} className="py-2 pr-2">{flexRender(c.column.columnDef.cell, c.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between items-center mt-3 text-sm">
          <div>
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</Button>
            <Button variant="outline" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Próxima</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
