"use client";

import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useDemoStore } from '@/lib/store';
import type { BoletoRow } from '@/lib/types';

function StatusBadge({ status }: { status: BoletoRow['status'] }) {
  const map: Record<BoletoRow['status'], string> = {
    em_atraso: 'bg-red-100 text-red-800 border-red-200',
    pago: 'bg-green-100 text-green-800 border-green-200',
    aberto: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };
  return <span className={`px-2 py-0.5 text-xs rounded border ${map[status]}`}>{status.replace('_', ' ')}</span>;
}

export function TableBoletos() {
  const data = useDemoStore((s) => s.data.boletosAtraso);
  const columns = useMemo<ColumnDef<BoletoRow>[]>(
    () => [
      { header: 'Contrato', accessorKey: 'contrato' },
      { header: 'Inquilino', accessorKey: 'inquilino' },
      { header: 'Competência', accessorKey: 'competencia' },
      {
        header: 'Valor',
        accessorKey: 'valor',
        cell: (info) => (info.getValue<number>()).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      },
      { header: 'Dias de atraso', accessorKey: 'diasAtraso' },
      { header: 'Status', accessorKey: 'status', cell: (info) => <StatusBadge status={info.getValue() as BoletoRow['status']} /> },
    ],
    []
  );
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="rounded-lg border p-4 bg-background">
      <div className="text-sm text-foreground/70 mb-2">Boletos em atraso</div>
      <div className="flex items-center gap-2 mb-2 text-sm">
        <input
          placeholder="Filtrar por inquilino…"
          className="border rounded px-2 py-1"
          value={(table.getColumn('inquilino')?.getFilterValue() as string) ?? ''}
          onChange={(e) => table.getColumn('inquilino')?.setFilterValue(e.target.value)}
        />
        <div className="ml-auto flex items-center gap-2">
          {table.getAllLeafColumns().map((col) => (
            <label key={col.id} className="inline-flex items-center gap-1">
              <input
                type="checkbox"
                checked={col.getIsVisible()}
                onChange={(e) => col.toggleVisibility(e.target.checked)}
              />
              {col.id}
            </label>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[600px] w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th key={h.id} className="text-left border-b py-2 pr-2 font-medium">
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b last:border-b-0">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-2 pr-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-3 text-sm">
        <div>
          Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
        </div>
        <div className="flex gap-2">
          <button className="border rounded px-2 py-1" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Anterior
          </button>
          <button className="border rounded px-2 py-1" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
}
