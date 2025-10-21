"use client";

import { RoleGuard } from "@/components/RoleGuard";
import { useDemoStore } from "@/lib/store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { generateContractTemplate } from "@/lib/templates";
import { toast } from "sonner";

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4 bg-background">
      <div className="text-sm text-foreground/70">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

export default function InquilinoPage() {
  const store = useDemoStore();
  const inquilinos = store.data.entities.inquilinos;
  const currentId = store.currentInquilinoId ?? inquilinos[0]?.id ?? null;
  const setCurrent = (id: string) => store.setCurrentInquilino(id);

  const meusContratos = useMemo(() => store.data.entities.contratos.filter(c=>c.inquilinoId === currentId), [store.data.entities.contratos, currentId]);
  const meusBoletos = useMemo(() => store.data.entities.boletos.filter(b=>meusContratos.some(c=>c.id===b.contratoId)), [store.data.entities.boletos, meusContratos]);
  const proximos = useMemo(() => meusBoletos.filter(b=>b.status!=='pago').sort((a,b)=> new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime()).slice(0,3), [meusBoletos]);

  const totalAberto = meusBoletos.filter(b=>b.status!=='pago').reduce((a,b)=> a + b.valor + b.juros + b.multa - b.desconto, 0);
  const pagos = meusBoletos.filter(b=>b.status==='pago').length;
  const percPago = meusBoletos.length ? Math.round(pagos / meusBoletos.length * 100) : 0;

  const [descChamado, setDescChamado] = useState("");
  const [prio, setPrio] = useState<'baixa'|'media'|'alta'>("media");
  const abrirChamado = () => {
    const ct = meusContratos[0];
    if (!ct) return;
    const im = store.data.entities.imoveis.find(i=>i.id===ct.imovelId)!;
    store.addManutencao({ contratoId: ct.id, imovelId: im.id, descricao: descChamado || 'Sem descrição', prioridade: prio });
    setDescChamado("");
    toast.success('Chamado aberto (mock)');
  };

  const meusChamados = useMemo(()=> store.data.entities.manutencoes.filter(m=> meusContratos.some(c=>c.id===m.contratoId)), [store.data.entities.manutencoes, meusContratos]);

  const confirmLeitura = (avisoId: string) => { if (!currentId) return; store.confirmarAvisoLeitura(avisoId, currentId); toast.success('Leitura confirmada'); };
  const avisos = store.data.entities.avisos.slice(0,5);
  const correspondencias = useMemo(()=>{
    const imIds = new Set(meusContratos.map(c=>c.imovelId));
    return store.data.entities.correspondencias.filter(c=> c.imovelId ? imIds.has(c.imovelId) : false).slice(0,5);
  }, [store.data.entities.correspondencias, meusContratos]);

  const genContrato = () => {
    const ct = meusContratos[0]; if (!ct) return;
    const im = store.data.entities.imoveis.find(i=>i.id===ct.imovelId)!;
    const inq = store.data.entities.inquilinos.find(i=>i.id===ct.inquilinoId)!;
    const prp = store.data.entities.proprietarios.find(p=>p.id===ct.proprietarioId)!;
    const txt = generateContractTemplate({ contrato: ct, imovel: im, inquilino: inq, proprietario: prp });
    const win = window.open('', '_blank'); if (!win) return; win.document.write(`<pre>${txt}</pre>`); win.document.close();
  };

  const baixarBoleto = (id: string) => {
    const b = meusBoletos.find(x=>x.id===id); if (!b) return;
    const ct = meusContratos.find(c=>c.id===b.contratoId);
    const text = `BOLETO (mock)\nContrato: ${ct?.id.slice(0,8).toUpperCase()}\nCompetência: ${b.competencia}\nVencimento: ${new Date(b.vencimento).toLocaleDateString('pt-BR')}\nValor: ${(b.valor + b.juros + b.multa - b.desconto).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}`;
    const win = window.open('', '_blank'); if (!win) return; win.document.write(`<pre>${text}</pre>`); win.document.close(); win.print();
  };

  return (
    <RoleGuard allow={["inquilino"]}>
      <div className="space-y-4">
        <div className="flex items-end gap-3">
          <h1 className="text-xl font-semibold">Portal do Inquilino</h1>
          <div className="ml-auto">
            <label className="block text-xs">Eu sou</label>
            <Select value={currentId ?? ''} onValueChange={(v)=>setCurrent(v)}>
              <SelectTrigger className="w-64"><SelectValue placeholder="Selecione um inquilino" /></SelectTrigger>
              <SelectContent>
                {inquilinos.map(i=> <SelectItem key={i.id} value={i.id}>{i.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Kpi label="Boletos (pagos %)" value={`${percPago}%`} />
          <Kpi label="Em aberto" value={(totalAberto).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} />
          <Kpi label="Próximos vencimentos" value={`${proximos.length}`} />
        </div>

        <div className="rounded-lg border p-3 bg-background">
          <div className="text-sm text-foreground/70 mb-2">Próximos vencimentos</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            {proximos.map(p => (
              <div key={p.id} className="border rounded p-2">
                <div><b>{p.competencia}</b> — Venc: {new Date(p.vencimento).toLocaleDateString('pt-BR')}</div>
                <div>Valor: {(p.valor + p.juros + p.multa - p.desconto).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</div>
                <div className="flex gap-2 mt-1">
                  <Button variant="outline" size="sm" onClick={()=>toast.message('2ª via gerada (mock)')}>2ª via</Button>
                  <Button size="sm" onClick={()=>baixarBoleto(p.id)}>Baixar PDF</Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border p-3 bg-background">
          <div className="text-sm text-foreground/70 mb-2">Meu Contrato</div>
          {meusContratos[0] ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={genContrato}>Visualizar (mock)</Button>
              <Button variant="outline" onClick={()=>toast.message('Aditivo anexado (mock)')}>Enviar aditivo</Button>
            </div>
          ) : (
            <div className="text-sm">Nenhum contrato encontrado</div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-lg border p-3 bg-background space-y-2">
            <div className="text-sm text-foreground/70">Abrir chamado de manutenção</div>
            <div className="grid gap-2">
              <label className="text-xs">Descrição</label>
              <Input placeholder="Descreva o problema" value={descChamado} onChange={(e)=>setDescChamado(e.target.value)} />
              <label className="text-xs">Prioridade</label>
              <Select value={prio} onValueChange={(v)=>setPrio(v as 'baixa'|'media'|'alta')}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex justify-end">
                <Button onClick={abrirChamado}>Abrir chamado</Button>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-3 bg-background">
            <div className="text-sm text-foreground/70 mb-2">Meus chamados</div>
            <ul className="space-y-2 text-sm">
              {meusChamados.map(c => (
                <li key={c.id} className="border rounded p-2">
                  <div className="flex justify-between">
                    <div><b>{c.prioridade.toUpperCase()}</b> — {c.status}</div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={()=>store.addManutencaoEvento(c.id, 'Comentário do inquilino')}>Comentar</Button>
                      <Button variant="outline" size="sm" onClick={()=>store.addManutencaoEvento(c.id, 'Avaliação: 5/5')}>Avaliar</Button>
                    </div>
                  </div>
                  <div className="mt-1">
                    <div className="text-foreground/70">Timeline</div>
                    <ul>
                      {c.eventos.slice(0,3).map((ev,i)=>(
                        <li key={i}>• {new Date(ev.data).toLocaleString('pt-BR')} — {ev.texto}</li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-lg border p-3 bg-background">
          <div className="text-sm text-foreground/70 mb-2">Avisos</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {avisos.map(a => (
              <div key={a.id} className="border rounded p-2">
                <div className="font-medium">{a.titulo}</div>
                <div className="text-sm text-foreground/70 line-clamp-2">{a.corpo}</div>
                <div className="mt-2">
                  <Button size="sm" variant="outline" onClick={()=>confirmLeitura(a.id)} disabled={!currentId || a.leituraConfirmadaPor.includes(currentId!)}>
                    {currentId && a.leituraConfirmadaPor.includes(currentId) ? 'Leitura confirmada' : 'Confirmar leitura'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border p-3 bg-background">
          <div className="text-sm text-foreground/70 mb-2">Correspondências</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {correspondencias.map(c => (
              <div key={c.id} className="border rounded p-2">
                <div><b>Remetente:</b> {c.remetente}</div>
                <div><b>Recebida em:</b> {new Date(c.dataRecebimento).toLocaleDateString('pt-BR')}</div>
                <div><b>Status:</b> {c.statusRetirada}</div>
                {c.statusRetirada==='pendente' && (
                  <div className="mt-2">
                    <Button size="sm" onClick={()=>{ store.confirmarRetiradaCorrespondencia(c.id, (inquilinos.find(i=>i.id===currentId)?.nome || 'Inquilino')); toast.success('Retirada confirmada (mock)'); }}>Confirmar retirada</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
