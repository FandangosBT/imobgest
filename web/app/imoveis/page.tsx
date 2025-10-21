"use client";

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoStore } from '@/lib/store';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table';
/* eslint-disable @next/next/no-img-element */
// import type { Imovel } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Row = {
  id: string;
  foto: string;
  codigo: string;
  endereco: string;
  cidade: string;
  uf: string;
  tipo: string;
  proprietario: string;
  inquilino?: string;
  contrato?: string;
  status: 'ocupado' | 'vago' | 'manutencao';
  aluguel?: number;
};

export default function ImoveisPage() {
  const router = useRouter();
  const store = useDemoStore();
  const { imoveis, proprietarios, contratos, inquilinos } = store.data.entities;

  const [fTipo, setFTipo] = useState<string>('');
  const [fStatus, setFStatus] = useState<string>('');
  const [fCidade, setFCidade] = useState<string>('');
  const [fUF, setFUF] = useState<string>('');
  const [minAlug, setMinAlug] = useState<string>('');
  const [maxAlug, setMaxAlug] = useState<string>('');

  const rows = useMemo<Row[]>(() => {
    return imoveis.map((i) => {
      const ct = i.contratoVigenteId ? contratos.find((c) => c.id === i.contratoVigenteId) : undefined;
      const inq = ct ? inquilinos.find((x) => x.id === ct.inquilinoId) : undefined;
      const prop = proprietarios.find((p) => p.id === i.proprietarioId);
      const aluguel = ct ? ct.valorAluguel + ct.valorCondominio : undefined;
      return {
        id: i.id,
        foto: '/file.svg',
        codigo: i.codigo,
        endereco: i.endereco,
        cidade: i.cidade,
        uf: i.uf,
        tipo: i.tipo,
        proprietario: prop?.nome || '-',
        inquilino: inq?.nome,
        contrato: ct?.id,
        status: i.statusOcupa,
        aluguel,
      };
    })
    .filter((r) => (fTipo && fTipo !== 'all' ? r.tipo === fTipo : true))
    .filter((r) => (fStatus && fStatus !== 'all' ? r.status === (fStatus as Row['status']) : true))
    .filter((r) => (fCidade ? r.cidade.toLowerCase().includes(fCidade.toLowerCase()) : true))
    .filter((r) => (fUF ? r.uf.toLowerCase() === fUF.toLowerCase() : true))
    .filter((r) => {
      const min = minAlug ? parseInt(minAlug) : undefined;
      const max = maxAlug ? parseInt(maxAlug) : undefined;
      if (min !== undefined && (r.aluguel ?? Infinity) < min) return false;
      if (max !== undefined && (r.aluguel ?? 0) > max) return false;
      return true;
    });
  }, [imoveis, contratos, inquilinos, proprietarios, fTipo, fStatus, fCidade, fUF, minAlug, maxAlug]);

  const onDelete = (id: string) => {
    if (!confirm('Excluir imóvel (mock)?')) return;
    store.deleteImovel(id);
    toast.success('Imóvel excluído (mock)');
  };

  const columns = useMemo<ColumnDef<Row>[]>(() => [
    {
      header: 'Imóvel',
      accessorKey: 'codigo',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <img src={row.original.foto} alt="foto" className="w-10 h-10 rounded object-cover" />
          <div>
            <div className="font-medium">{row.original.codigo}</div>
            <div className="text-xs text-foreground/60">{row.original.tipo.toUpperCase()}</div>
          </div>
        </div>
      )
    },
    { header: 'Endereço', accessorKey: 'endereco' },
    { header: 'Cidade', accessorKey: 'cidade' },
    { header: 'UF', accessorKey: 'uf' },
    { header: 'Proprietário', accessorKey: 'proprietario' },
    { header: 'Inquilino', accessorKey: 'inquilino' },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ getValue }) => {
        const v = getValue<Row['status']>();
        const cls = v === 'ocupado' ? 'bg-green-100 text-green-800 border-green-200' : v === 'vago' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return <span className={`px-2 py-0.5 text-xs rounded border ${cls}`}>{v}</span>;
      },
    },
    {
      header: 'Aluguel',
      accessorKey: 'aluguel',
      cell: ({ getValue }) => getValue<number | undefined>()?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? '-'
    },
    {
      header: 'Ações',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(`/imoveis/${row.original.id}`)}>Detalhes</Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(row.original.id)}>Excluir</Button>
        </div>
      )
    }
  ], [router]);

  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), getFilteredRowModel: getFilteredRowModel() });

  const distinct = {
    tipos: Array.from(new Set(imoveis.map(i=>i.tipo))).sort(),
    cidades: Array.from(new Set(imoveis.map(i=>i.cidade))).sort(),
    ufs: Array.from(new Set(imoveis.map(i=>i.uf))).sort(),
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Gestão de Imóveis</h1>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        <div>
          <label className="text-xs">Tipo</label>
          <Select value={fTipo} onValueChange={setFTipo}>
            <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {distinct.tipos.map(t=> <SelectItem key={t} value={t}>{t.toUpperCase()}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs">Status</label>
          <Select value={fStatus} onValueChange={setFStatus}>
            <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ocupado">Ocupado</SelectItem>
              <SelectItem value="vago">Vago</SelectItem>
              <SelectItem value="manutencao">Manutenção</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs">Cidade</label>
          <Input placeholder="Ex.: São Paulo" value={fCidade} onChange={(e)=>setFCidade(e.target.value)} />
        </div>
        <div>
          <label className="text-xs">UF</label>
          <Input placeholder="SP" value={fUF} onChange={(e)=>setFUF(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-1">
          <div>
            <label className="text-xs">Aluguel min</label>
            <Input type="number" placeholder="0" value={minAlug} onChange={(e)=>setMinAlug(e.target.value)} />
          </div>
          <div>
            <label className="text-xs">Aluguel max</label>
            <Input type="number" placeholder="∞" value={maxAlug} onChange={(e)=>setMaxAlug(e.target.value)} />
          </div>
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
