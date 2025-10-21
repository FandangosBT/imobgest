"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDemoStore } from '@/lib/store';

function TableMini({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[560px] w-full text-sm">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} className="text-left border-b py-2 pr-2 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b last:border-b-0">
              {r.map((c, j) => (
                <td key={j} className="py-2 pr-2">{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function QuickActions() {
  // Seletores individuais para evitar retornar objetos novos a cada chamada
  const hydrated = useDemoStore((s) => s.hydrated);
  const boletosAtraso = useDemoStore((s) => s.data.boletosAtraso);
  const manutencoesAll = useDemoStore((s) => s.data.entities.manutencoes);
  const correspondenciasAll = useDemoStore((s) => s.data.entities.correspondencias);
  const contratos = useDemoStore((s) => s.data.entities.contratos);
  const inquilinos = useDemoStore((s) => s.data.entities.inquilinos);
  const imoveis = useDemoStore((s) => s.data.entities.imoveis);

  const boletosRows = hydrated
    ? boletosAtraso.slice(0, 10).map(b => [b.contrato, b.inquilino, b.competencia, b.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), b.diasAtraso + 'd'])
    : [];
  const manutencoes = hydrated
    ? manutencoesAll.filter(m=>m.prioridade==='alta' && m.status!=='concluido').slice(0,10)
    : [];
  const correspondencias = hydrated
    ? correspondenciasAll.filter(c=>c.statusRetirada==='pendente').slice(0,10)
    : [];

  const chamadosRows = manutencoes.map(m => {
    const ct = contratos.find(c=>c.id===m.contratoId);
    const im = imoveis.find(i=>i.id===m.imovelId);
    return [m.descricao.slice(0,40) + (m.descricao.length>40?'…':''), m.prioridade, m.status, (im?.codigo || '-'), (ct?.id?.slice(0,8).toUpperCase() || '-')];
  });

  const corrRows = correspondencias.map(c => {
    const im = imoveis.find(i=>i.id===c.imovelId);
    return [c.remetente, c.recebedor, (im?.codigo || '-'), new Date(c.dataRecebimento).toLocaleDateString('pt-BR')];
  });

  return (
    <div className="rounded-lg border p-4 bg-background">
      <div className="text-sm text-foreground/70 mb-2">Ações rápidas</div>
      <Tabs defaultValue="boletos">
        <TabsList>
          <TabsTrigger value="boletos">Boletos em atraso</TabsTrigger>
          <TabsTrigger value="chamados">Chamados urgentes</TabsTrigger>
          <TabsTrigger value="corresp">Correspondências pendentes</TabsTrigger>
        </TabsList>
        <TabsContent value="boletos">
          <TableMini headers={["Contrato","Inquilino","Competência","Valor","Atraso"]} rows={boletosRows} />
        </TabsContent>
        <TabsContent value="chamados">
          <TableMini headers={["Descrição","Prioridade","Status","Imóvel","Contrato"]} rows={chamadosRows} />
        </TabsContent>
        <TabsContent value="corresp">
          <TableMini headers={["Remetente","Recebedor","Imóvel","Recebida em"]} rows={corrRows} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
