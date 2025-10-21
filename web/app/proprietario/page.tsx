"use client";

import { RoleGuard } from "@/components/RoleGuard";
import { useDemoStore } from "@/lib/store";
import { useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

type RepRow = { id: string; competencia: string; valorBruto: number; taxas: number; valorLiquido: number; status: 'pendente'|'pago' };
type ImRow = { codigo: string; endereco: string; status: string; contrato?: string; vence?: string };

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4 bg-background">
      <div className="text-sm text-foreground/70">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

export default function ProprietarioPage() {
  const store = useDemoStore();
  const proprietarios = store.data.entities.proprietarios;
  const currentId = store.currentProprietarioId ?? proprietarios[0]?.id ?? null;
  const setCurrent = (id: string) => store.setCurrentProprietario(id);

  const meusImoveis = useMemo(() => store.data.entities.imoveis.filter(i=>i.proprietarioId===currentId), [store.data.entities.imoveis, currentId]);
  const meusContratos = useMemo(() => store.data.entities.contratos.filter(c=>c.proprietarioId===currentId), [store.data.entities.contratos, currentId]);
  const meusRepasses = useMemo(() => store.data.entities.repasses.filter(r=>r.proprietarioId===currentId), [store.data.entities.repasses, currentId]);

  const ultimaComp = useMemo(()=>{
    const set = new Set(meusRepasses.map(r=>r.competencia));
    const arr = Array.from(set).sort();
    return arr[arr.length-1];
  }, [meusRepasses]);

  const totalLiquidoMes = useMemo(()=> meusRepasses.filter(r=>r.competencia===ultimaComp).reduce((a,b)=>a+b.valorLiquido,0), [meusRepasses, ultimaComp]);
  const ocupados = meusImoveis.filter(i=>i.statusOcupa==='ocupado').length;
  const vacos = meusImoveis.filter(i=>i.statusOcupa==='vago').length;

  // Repasses table
  const repRows: RepRow[] = useMemo(() => meusRepasses.map(r=>({ id: r.id, competencia: r.competencia, valorBruto: r.valorBruto, taxas: r.taxas, valorLiquido: r.valorLiquido, status: r.status })), [meusRepasses]);
  const repColumns: ColumnDef<RepRow>[] = [
    { header: 'Competência', accessorKey: 'competencia' },
    { header: 'Bruto', accessorKey: 'valorBruto', cell: ({getValue})=>getValue<number>().toLocaleString('pt-BR',{style:'currency', currency:'BRL'}) },
    { header: 'Taxas', accessorKey: 'taxas', cell: ({getValue})=>getValue<number>().toLocaleString('pt-BR',{style:'currency', currency:'BRL'}) },
    { header: 'Líquido', accessorKey: 'valorLiquido', cell: ({getValue})=>getValue<number>().toLocaleString('pt-BR',{style:'currency', currency:'BRL'}) },
    { header: 'Status', accessorKey: 'status' },
  ];
  const repTable = useReactTable({ data: repRows, columns: repColumns, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), getFilteredRowModel: getFilteredRowModel() });

  // Imóveis/contratos table
  const imRows: ImRow[] = useMemo(() => {
    return meusImoveis.map((i)=>{
      const ct = i.contratoVigenteId ? meusContratos.find(c=>c.id===i.contratoVigenteId) : undefined;
      const vence = ct ? new Date(ct.fim).toLocaleDateString('pt-BR') : undefined;
      return { codigo: i.codigo, endereco: `${i.endereco}, ${i.cidade}/${i.uf}`, status: i.statusOcupa, contrato: ct ? ct.id.slice(0,8).toUpperCase() : undefined, vence };
    });
  }, [meusImoveis, meusContratos]);
  const imColumns: ColumnDef<ImRow>[] = [
    { header: 'Código', accessorKey: 'codigo' },
    { header: 'Endereço', accessorKey: 'endereco' },
    { header: 'Status', accessorKey: 'status' },
    { header: 'Contrato', accessorKey: 'contrato', cell: ({getValue})=>getValue<string|undefined>() ?? '-' },
    { header: 'Vencimento', accessorKey: 'vence', cell: ({getValue})=>getValue<string|undefined>() ?? '-' },
  ];
  const imTable = useReactTable({ data: imRows, columns: imColumns, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), getFilteredRowModel: getFilteredRowModel() });

  // const compList = Array.from(new Set(meusRepasses.map(r=>r.competencia))).sort();
  const exportCSV = () => {
    const header = ['Competencia','Bruto','Taxas','Liquido','Status'];
    const lines = repRows.map(r=>[r.competencia, r.valorBruto, r.taxas, r.valorLiquido, r.status].join(','));
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'repasses_proprietario.csv'; a.click(); URL.revokeObjectURL(url);
  };

  // Notificações importantes: contratos a vencer em até 60 dias
  const avisosContratos = useMemo(()=>{
    const now = Date.now();
    const cutoff = now + 60*24*3600*1000;
    return meusContratos.filter(c=>{
      const t = new Date(c.fim).getTime();
      return t>now && t<=cutoff;
    }).map(c=>{
      const im = store.data.entities.imoveis.find(i=>i.id===c.imovelId);
      return `Contrato ${c.id.slice(0,8).toUpperCase()} (${im?.codigo}) vence em ${new Date(c.fim).toLocaleDateString('pt-BR')}`;
    });
  }, [meusContratos, store.data.entities.imoveis]);

  return (
    <RoleGuard allow={["proprietario"]}>
      <div className="space-y-4">
        <div className="flex items-end gap-3">
          <h1 className="text-xl font-semibold">Portal do Proprietário</h1>
          <div className="ml-auto">
            <label className="block text-xs">Eu sou</label>
            <Select value={currentId ?? ''} onValueChange={(v)=>setCurrent(v)}>
              <SelectTrigger className="w-64"><SelectValue placeholder="Selecione um proprietário" /></SelectTrigger>
              <SelectContent>
                {proprietarios.map(p=> <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Stat label={`Total líquido (${ultimaComp||'-'})`} value={totalLiquidoMes.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} />
          <Stat label="Imóveis ocupados" value={String(ocupados)} />
          <Stat label="Imóveis vagos" value={String(vacos)} />
        </div>

        <div className="rounded-lg border p-3 bg-background space-y-2">
          <div className="flex items-center">
            <div className="text-sm text-foreground/70">Repasses</div>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" onClick={exportCSV}>Exportar CSV</Button>
              <Button variant="outline" onClick={()=>{ const w=window.open('', '_blank'); if(!w) return; w.document.write('<pre>'+JSON.stringify(repRows,null,2)+'</pre>'); w.document.close(); w.print(); }}>Imprimir</Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full text-sm">
              <thead>
                {repTable.getHeaderGroups().map(hg => (
                  <tr key={hg.id}>
                    {hg.headers.map(h => (
                      <th key={h.id} className="text-left border-b py-2 pr-2 font-medium">{flexRender(h.column.columnDef.header, h.getContext())}</th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {repTable.getRowModel().rows.map(r => (
                  <tr key={r.id} className="border-b last:border-b-0 hover:bg-foreground/5">
                    {r.getVisibleCells().map(c => (
                      <td key={c.id} className="py-2 pr-2">{flexRender(c.column.columnDef.cell, c.getContext())}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border p-3 bg-background">
          <div className="text-sm text-foreground/70 mb-2">Imóveis e contratos</div>
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-sm">
              <thead>
                {imTable.getHeaderGroups().map(hg => (
                  <tr key={hg.id}>
                    {hg.headers.map(h => (
                      <th key={h.id} className="text-left border-b py-2 pr-2 font-medium">{flexRender(h.column.columnDef.header, h.getContext())}</th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {imTable.getRowModel().rows.map(r => (
                  <tr key={r.id} className="border-b last:border-b-0 hover:bg-foreground/5">
                    {r.getVisibleCells().map(c => (
                      <td key={c.id} className="py-2 pr-2">{flexRender(c.column.columnDef.cell, c.getContext())}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border p-3 bg-background">
          <div className="text-sm text-foreground/70 mb-2">Notificações importantes</div>
          {avisosContratos.length ? (
            <ul className="list-disc pl-5 text-sm space-y-1">
              {avisosContratos.map((t,i)=>(<li key={i}>{t}</li>))}
            </ul>
          ) : (
            <div className="text-sm">Nenhuma notificação no momento.</div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
