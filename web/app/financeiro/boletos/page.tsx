"use client";

import { useMemo, useState } from 'react';
import { useDemoStore } from '@/lib/store';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AgingPanel } from '@/components/AgingPanel';
import { PayDialog } from '@/components/PayDialog';
import { toast } from 'sonner';

type Row = {
  id: string;
  contrato: string;
  inquilino: string;
  competencia: string;
  vencimento: string;
  valor: number;
  juros: number;
  multa: number;
  desconto: number;
  status: 'em_atraso' | 'pago' | 'aberto';
  diasAtraso: number;
};

export default function BoletosPage() {
  const store = useDemoStore();
  const { boletos, contratos, inquilinos } = store.data.entities;
  const [status, setStatus] = useState('');
  const [comp, setComp] = useState('');
  const [q, setQ] = useState('');
  const [payId, setPayId] = useState<string | null>(null);

  const rows = useMemo<Row[]>(() => {
    return boletos.map((b) => {
      const ct = contratos.find((c) => c.id === b.contratoId);
      const inq = ct ? inquilinos.find((i) => i.id === ct.inquilinoId) : undefined;
      const diasAtraso = Math.max(0, Math.floor((Date.now() - new Date(b.vencimento).getTime()) / (24 * 3600 * 1000)));
      return { id: b.id, contrato: ct ? ct.id.slice(0,8).toUpperCase() : '-', inquilino: inq?.nome || '-', competencia: b.competencia, vencimento: new Date(b.vencimento).toLocaleDateString('pt-BR'), valor: b.valor, juros: b.juros, multa: b.multa, desconto: b.desconto, status: b.status, diasAtraso };
    })
    .filter((r) => (status && status !== 'all' ? r.status === (status as Row['status']) : true))
    .filter((r) => (comp && comp !== 'all' ? r.competencia === comp : true))
    .filter((r) => (q ? (r.inquilino + r.contrato).toLowerCase().includes(q.toLowerCase()) : true));
  }, [boletos, contratos, inquilinos, status, comp, q]);

  const columns = useMemo<ColumnDef<Row>[]>(() => [
    { header: 'Contrato', accessorKey: 'contrato' },
    { header: 'Inquilino', accessorKey: 'inquilino' },
    { header: 'Competência', accessorKey: 'competencia' },
    { header: 'Vencimento', accessorKey: 'vencimento' },
    { header: 'Valor', accessorKey: 'valor', cell: ({ getValue }) => getValue<number>().toLocaleString('pt-BR', { style:'currency', currency:'BRL'}) },
    { header: 'Juros', accessorKey: 'juros', cell: ({ getValue }) => getValue<number>().toLocaleString('pt-BR', { style:'currency', currency:'BRL'}) },
    { header: 'Multa', accessorKey: 'multa', cell: ({ getValue }) => getValue<number>().toLocaleString('pt-BR', { style:'currency', currency:'BRL'}) },
    { header: 'Desc.', accessorKey: 'desconto', cell: ({ getValue }) => getValue<number>().toLocaleString('pt-BR', { style:'currency', currency:'BRL'}) },
    { header: 'Status', accessorKey: 'status' },
    { header: 'Atraso', accessorKey: 'diasAtraso', cell: ({ getValue }) => getValue<number>() + ' d' },
    { header: 'Ações', cell: ({ row }) => (
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => { store.sendReminder(row.original.id); toast.message('Lembrete enviado (mock)'); }}>Lembrete</Button>
        <Button variant="outline" size="sm" onClick={() => { store.applyPenalty(row.original.id); toast.success('Multa/Juros aplicados (mock)'); }}>Multa/Juros</Button>
        <Button variant="outline" size="sm" onClick={async () => { const r = await fetch('/api/payments/emit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ boletoId: row.original.id }) }); const j = await r.json(); toast.success('Boleto emitido (mock): ' + j.barcode); }}>Emitir (mock)</Button>
        <Button variant="outline" size="sm" onClick={async () => { await fetch('/api/payments/webhook', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ boletoId: row.original.id, event: 'payment_received' }) }); const total = row.original.valor + row.original.juros + row.original.multa - row.original.desconto; store.registerPayment(row.original.id, total); toast.success('Webhook recebido: pagamento registrado (mock)'); }}>Webhook pago</Button>
        <Button variant="default" size="sm" onClick={() => setPayId(row.original.id)}>Pagar</Button>
      </div>
    )},
  ], [store]);

  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), getFilteredRowModel: getFilteredRowModel() });

  const competencias = Array.from(new Set(boletos.map(b=>b.competencia))).sort();

  const exportCSV = () => {
    const header = ['Contrato','Inquilino','Competência','Vencimento','Valor','Juros','Multa','Desconto','Status','DiasAtraso'];
    const lines = rows.map(r => [r.contrato, r.inquilino, r.competencia, r.vencimento, r.valor, r.juros, r.multa, r.desconto, r.status, r.diasAtraso].join(','));
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'boletos.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const printPDF = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write('<html><head><title>Boletos</title></head><body><pre>' + JSON.stringify(rows, null, 2) + '</pre></body></html>');
    win.document.close(); win.focus(); win.print();
  };

  const doGenerateMonth = () => {
    const c = prompt('Gerar boletos para competência (YYYY-MM):', comp || competencias[competencias.length-1] || '');
    if (!c) return;
    const n = store.generateBoletosMes(c);
    toast.success(`${n} boletos gerados para ${c} (mock)`);
  };

  const paying = payId ? boletos.find(b=>b.id===payId) : undefined;
  const total = paying ? (paying.valor + paying.juros + paying.multa - paying.desconto) : 0;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Financeiro – Boletos</h1>
      <AgingPanel />

      <div className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="text-xs">Status</label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Todos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="aberto">Aberto</SelectItem>
              <SelectItem value="em_atraso">Em atraso</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
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
        <div>
          <label className="text-xs">Buscar</label>
          <Input placeholder="Contrato ou inquilino" value={q} onChange={(e)=>setQ(e.target.value)} />
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={doGenerateMonth}>Gerar mês</Button>
          <Button variant="outline" onClick={exportCSV}>Exportar CSV</Button>
          <Button variant="outline" onClick={printPDF}>Imprimir (PDF)</Button>
        </div>
      </div>

      <div className="rounded-lg border p-2 bg-background overflow-x-auto">
        <table className="min-w-[1100px] w-full text-sm">
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

      <PayDialog open={!!payId} onOpenChange={(v)=> setPayId(v ? payId : null)} total={total} onConfirm={(valor, comp) => { if (!paying) return; store.registerPayment(paying.id, valor, comp); setPayId(null); toast.success('Pagamento registrado (mock)'); }} />
    </div>
  );
}
