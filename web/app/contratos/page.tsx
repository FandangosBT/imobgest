"use client";

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoStore } from '@/lib/store';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Row = {
  id: string;
  imovel: string;
  inquilino: string;
  proprietario: string;
  vigencia: string;
  status: 'rascunho' | 'pendente_assinatura' | 'vigente' | 'encerrado';
  valor: number;
};

export default function ContratosPage() {
  const router = useRouter();
  const { contratos, imoveis, inquilinos, proprietarios } = useDemoStore((s) => s.data.entities);
  const [fStatus, setFStatus] = useState('');
  const [query, setQuery] = useState('');

  const rows = useMemo<Row[]>(() => {
    return contratos.map((ct) => {
      const im = imoveis.find((i) => i.id === ct.imovelId);
      const inq = inquilinos.find((i) => i.id === ct.inquilinoId);
      const prop = proprietarios.find((p) => p.id === ct.proprietarioId);
      return {
        id: ct.id,
        imovel: im ? `${im.codigo} – ${im.endereco}` : '-',
        inquilino: inq?.nome || '-',
        proprietario: prop?.nome || '-',
        vigencia: `${new Date(ct.inicio).toLocaleDateString('pt-BR')} → ${new Date(ct.fim).toLocaleDateString('pt-BR')}`,
        status: ct.status,
        valor: ct.valorAluguel + ct.valorCondominio,
      };
    })
    .filter((r) => (fStatus && fStatus !== 'all' ? r.status === (fStatus as Row['status']) : true))
    .filter((r) => (query ? (r.imovel + r.inquilino + r.proprietario).toLowerCase().includes(query.toLowerCase()) : true));
  }, [contratos, imoveis, inquilinos, proprietarios, fStatus, query]);

  const columns = useMemo<ColumnDef<Row>[]>(() => [
    { header: 'ID', accessorKey: 'id', cell: ({ getValue }) => String(getValue<string>()).slice(0, 8).toUpperCase() },
    { header: 'Imóvel', accessorKey: 'imovel' },
    { header: 'Inquilino', accessorKey: 'inquilino' },
    { header: 'Proprietário', accessorKey: 'proprietario' },
    { header: 'Vigência', accessorKey: 'vigencia' },
    { header: 'Status', accessorKey: 'status', cell: ({ getValue }) => {
      const s = getValue<Row['status']>();
      const cls = s==='vigente' ? 'bg-green-100 text-green-800 border-green-200' : s==='pendente_assinatura' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : s==='encerrado' ? 'bg-gray-200 text-gray-800 border-gray-300' : 'bg-blue-100 text-blue-800 border-blue-200';
      return <span className={`px-2 py-0.5 text-xs rounded border ${cls}`}>{s.replace('_',' ')}</span>;
    } },
    { header: 'Total', accessorKey: 'valor', cell: ({ getValue }) => getValue<number>().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
    { header: 'Ações', cell: ({ row }) => (
      <Button variant="outline" size="sm" onClick={() => router.push(`/contratos/${row.original.id}`)}>Abrir</Button>
    ) },
  ], [router]);

  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), getFilteredRowModel: getFilteredRowModel() });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Contratos</h1>
      <div className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="text-xs">Status</label>
          <Select value={fStatus} onValueChange={setFStatus}>
            <SelectTrigger className="w-56"><SelectValue placeholder="Todos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="rascunho">Rascunho</SelectItem>
              <SelectItem value="pendente_assinatura">Pendente assinatura</SelectItem>
              <SelectItem value="vigente">Vigente</SelectItem>
              <SelectItem value="encerrado">Encerrado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs">Buscar</label>
          <Input placeholder="Imóvel, inquilino, proprietário" value={query} onChange={(e)=>setQuery(e.target.value)} />
        </div>
      </div>

      <div className="rounded-lg border p-2 bg-background overflow-x-auto">
        <table className="min-w-[1000px] w-full text-sm">
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
