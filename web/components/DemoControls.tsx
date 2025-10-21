"use client";

import { useDemoStore } from '@/lib/store';

export function DemoControls() {
  const scenarios = useDemoStore((s) => s.scenarios);
  const toggleScenario = useDemoStore((s) => s.toggleScenario);
  const resetData = useDemoStore((s) => s.resetData);
  const simulate = useDemoStore((s) => s.simulate);
  const store = useDemoStore();

  const onSimulate = (type: 'gerarBoletos' | 'enviarLembrete') => {
    const msg = simulate(type);
    alert(msg);
  };

  return (
    <div className="w-full rounded-lg border p-4 space-y-3 bg-background">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Demo Controls</h3>
        <button className="text-sm px-3 py-1.5 rounded-md border hover:bg-foreground/5" onClick={resetData}>
          Resetar dados
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
        <label className="flex items-center gap-2 border rounded-md px-3 py-2">
          <input type="checkbox" checked={scenarios.highInadimplencia} onChange={() => toggleScenario('highInadimplencia')} />
          Alta inadimplência
        </label>
        <label className="flex items-center gap-2 border rounded-md px-3 py-2">
          <input type="checkbox" checked={scenarios.highManutencao} onChange={() => toggleScenario('highManutencao')} />
          Alta demanda de manutenção
        </label>
        <label className="flex items-center gap-2 border rounded-md px-3 py-2">
          <input type="checkbox" checked={scenarios.highVacancia} onChange={() => toggleScenario('highVacancia')} />
          Vacância elevada
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="text-sm px-3 py-1.5 rounded-md border hover:bg-foreground/5" onClick={async ()=>{ await fetch('/api/push', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ title: 'Push Demo', message: 'Nova atualização disponível' })}); store.addAviso({ titulo: 'Push Demo', corpo: 'Nova atualização disponível (mock)', grupos: ['geral'], publicoAlvo: 'todos' }); alert('Push enviado (mock)'); }}>Simular Push (OneSignal/Firebase)</button>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="text-sm px-3 py-1.5 rounded-md border hover:bg-foreground/5" onClick={() => onSimulate('gerarBoletos')}>
          Simular: Gerar boletos do mês
        </button>
        <button className="text-sm px-3 py-1.5 rounded-md border hover:bg-foreground/5" onClick={() => onSimulate('enviarLembrete')}>
          Simular: Enviar lembrete de cobrança
        </button>
      </div>
      <div className="pt-2 border-t mt-2 space-y-2">
        <div className="text-sm text-foreground/70">Fluxos de Demonstração (E2E)</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <button className="text-sm px-3 py-1.5 rounded-md border hover:bg-foreground/5 text-left" onClick={() => {
            const im = store.data.entities.imoveis[0];
            const inq = store.data.entities.inquilinos[0];
            if (!im || !inq) return alert('Dados indisponíveis');
            // cadastra imovel (mock)
            const novoImovel = { ...im, id: crypto.randomUUID(), codigo: `IM-DEMO-${Math.floor(Math.random()*900)+100}`, statusOcupa: 'vago' as const, contratoVigenteId: undefined };
            store.addImovel(novoImovel);
            // cria contrato
            const ctId = store.addContrato({ imovelId: novoImovel.id, inquilinoId: inq.id, proprietarioId: novoImovel.proprietarioId, status: 'vigente' });
            // gera boletos mês atual
            const now = new Date(); const comp = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
            store.generateBoletosMes(comp);
            // envia aviso
            store.addAviso({ titulo: 'Novo contrato criado (demo)', corpo: `Contrato ${ctId.slice(0,8).toUpperCase()} criado para o imóvel ${novoImovel.codigo}.`, grupos: ['geral'], publicoAlvo: 'todos' });
            alert('Fluxo 1 concluído: imóvel, contrato, boletos e aviso.');
          }}>1) Admin: cadastra imóvel → cria contrato → gera boletos → envia aviso</button>

          <button className="text-sm px-3 py-1.5 rounded-md border hover:bg-foreground/5 text-left" onClick={() => {
            // inquilino baixa boleto, abre manutenção e confirma aviso
            const ct = store.data.entities.contratos[0]; if (!ct) return alert('Sem contrato');
            store.setPersona('inquilino'); store.setCurrentInquilino(ct.inquilinoId);
            const b = store.data.entities.boletos.find(x=>x.contratoId===ct.id); if (b) {
              const text = `BOLETO (mock)\nContrato ${ct.id.slice(0,8).toUpperCase()}\nComp: ${b.competencia} \nValor: ${(b.valor + b.juros + b.multa - b.desconto).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}`;
              const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' }); const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='boleto.txt'; a.click(); URL.revokeObjectURL(url);
            }
            store.addManutencao({ contratoId: ct.id, imovelId: ct.imovelId, descricao: 'Vazamento na pia (demo)', prioridade: 'media' });
            const aviso = store.data.entities.avisos.find(a=>a.publicoAlvo!=='proprietarios'); if (aviso) store.confirmarAvisoLeitura(aviso.id, ct.inquilinoId);
            alert('Fluxo 2 concluído: boleto baixado, manutenção aberta e aviso confirmado.');
          }}>2) Inquilino: acessa portal → baixa boleto → abre manutenção → confirma aviso</button>

          <button className="text-sm px-3 py-1.5 rounded-md border hover:bg-foreground/5 text-left" onClick={() => {
            const r = store.data.entities.repasses[0]; if (!r) return alert('Sem repasses');
            store.setPersona('proprietario'); store.setCurrentProprietario(r.proprietarioId);
            // exportar relatório simples
            const rows = store.data.entities.repasses.filter(x=>x.proprietarioId===r.proprietarioId).map(x=>[x.competencia, x.valorBruto, x.taxas, x.valorLiquido].join(','));
            const csv = ['Competencia,Bruto,Taxas,Liquido', ...rows].join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='extrato_repasses.csv'; a.click(); URL.revokeObjectURL(url);
            alert('Fluxo 3 concluído: extrato consultado e exportado (mock).');
          }}>3) Proprietário: consulta extrato → visualiza repasse → exporta relatório</button>

          <button className="text-sm px-3 py-1.5 rounded-md border hover:bg-foreground/5 text-left" onClick={() => {
            const im = store.data.entities.imoveis[0]; if (!im) return alert('Sem imóveis');
            store.addCorrespondencia({ imovelId: im.id, recebedor: 'Destinatário Demo', remetente: 'Correios' });
            const corr = store.data.entities.correspondencias[0]; if (corr) {
              const ct = store.data.entities.contratos.find(c=>c.imovelId===corr.imovelId); if (ct) {
                store.setPersona('inquilino'); store.setCurrentInquilino(ct.inquilinoId);
                store.confirmarRetiradaCorrespondencia(corr.id, 'Inquilino Demo');
              }
            }
            alert('Fluxo 4 concluído: correspondência registrada, notificação e retirada confirmada.');
          }}>4) Correspondência: registrada → inquilino notificado → retirada confirmada</button>

          <button className="text-sm px-3 py-1.5 rounded-md border hover:bg-foreground/5 text-left" onClick={() => {
            // contrato rascunho → assinado → vigente
            const im = store.data.entities.imoveis.find(i=>i.statusOcupa!=='ocupado');
            const inq = store.data.entities.inquilinos[0]; if (!im || !inq) return alert('Dados indisponíveis');
            const ctId = store.addContrato({ imovelId: im.id, inquilinoId: inq.id, proprietarioId: im.proprietarioId, status: 'rascunho' });
            store.addContratoEvento(ctId, 'Contrato criado (demo)');
            store.setContratoStatus(ctId, 'pendente_assinatura'); store.addContratoEvento(ctId, 'Envelope criado e enviado para assinatura');
            store.addContratoEvento(ctId, 'Assinante 1 (Inquilino) assinou'); store.addContratoEvento(ctId, 'Assinante 2 (Proprietário) assinou');
            store.setContratoStatus(ctId, 'vigente'); store.addContratoEvento(ctId, 'Contrato assinado e vigente');
            alert('Fluxo 5 concluído: assinatura simulada e contrato vigente.');
          }}>5) Contrato: rascunho → simula assinatura digital → vigente</button>
        </div>
      </div>
    </div>
  );
}
