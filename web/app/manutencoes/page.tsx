"use client";

import { useMemo, useState } from 'react';
import { useDemoStore } from '@/lib/store';
import type { Manutencao } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RoleGuard } from '@/components/RoleGuard';

type Col = { key: Manutencao['status']; title: string };
const COLUMNS: Col[] = [
  { key: 'aberto', title: 'Aberto' },
  { key: 'andamento', title: 'Em andamento' },
  { key: 'aguardando', title: 'Aguardando' },
  { key: 'concluido', title: 'Concluído' },
];

function PriorityBadge({ p }: { p: Manutencao['prioridade'] }) {
  const cls = p==='alta' ? 'bg-red-100 text-red-800 border-red-200' : p==='media' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-green-100 text-green-800 border-green-200';
  return <span className={`px-2 py-0.5 text-xs rounded border ${cls}`}>{p}</span>;
}

export default function ManutencoesBoard() {
  const store = useDemoStore();
  const items = store.data.entities.manutencoes;
  const grouped = useMemo(() => {
    const g: Record<Manutencao['status'], Manutencao[]> = { aberto: [], andamento: [], aguardando: [], concluido: [] };
    for (const m of items) g[m.status].push(m);
    return g;
  }, [items]);

  const [openId, setOpenId] = useState<string | null>(null);
  const current = openId ? items.find(i=>i.id===openId) : null;

  const [note, setNote] = useState('');
  const [tecnico, setTecnico] = useState('');
  const [sla, setSla] = useState<number>(5);
  const [prio, setPrio] = useState<Manutencao['prioridade']>('media');

  const openDetail = (m: Manutencao) => {
    setOpenId(m.id); setNote(''); setTecnico(m.tecnico ?? ''); setSla(m.sla); setPrio(m.prioridade);
  };

  const addNote = () => { if (!current) return; store.addManutencaoEvento(current.id, note || 'Observação'); setNote(''); };
  const saveMeta = () => { if (!current) return; store.setManutencaoTecnico(current.id, tecnico || undefined); store.setManutencaoSla(current.id, Number(sla)||5); store.setManutencaoPrioridade(current.id, prio); };
  const changeStatus = (st: Manutencao['status']) => { if (!current) return; store.setManutencaoStatus(current.id, st); };
  const addPhoto = (file: File | null) => { if (!file || !current) return; const r = new FileReader(); r.onload = ()=>{ store.addManutencaoFoto(current.id, r.result as string); }; r.readAsDataURL(file); };
  const avaliar = (score: number) => { if (!current) return; store.addManutencaoEvento(current.id, `Avaliação: ${score}/5`); };

  return (
    <RoleGuard allow={["admin","inquilino","proprietario"]}>
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Solicitações de Manutenção</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {COLUMNS.map(col => (
            <div key={col.key} className="rounded-lg border p-2 bg-background min-h-[300px]">
              <div className="text-sm text-foreground/70 mb-2 flex items-center justify-between">
                <span>{col.title}</span>
                <span className="text-xs">{grouped[col.key].length}</span>
              </div>
              <div className="space-y-2">
                {grouped[col.key].map(m => (
                  <div key={m.id} className="border rounded p-2 bg-foreground/5 cursor-pointer" onClick={()=>openDetail(m)}>
                    <div className="flex items-center justify-between">
                      <PriorityBadge p={m.prioridade} />
                      <span className="text-xs">SLA: {m.sla}d</span>
                    </div>
                    <div className="text-sm mt-1 line-clamp-2">{m.descricao}</div>
                    <div className="text-xs text-foreground/60 mt-1">{m.tecnico ? `Tec: ${m.tecnico}` : 'Sem técnico'}</div>
                    <div className="text-xs text-foreground/60">Eventos: {m.eventos.length}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Dialog open={!!openId} onOpenChange={(v)=> setOpenId(v ? openId : null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Detalhes do chamado</DialogTitle>
            </DialogHeader>
            {current && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="rounded border p-2">
                    <div className="text-sm text-foreground/70 mb-1">Descrição</div>
                    <div className="text-sm">{current.descricao}</div>
                  </div>
                  <div className="rounded border p-2 space-y-2">
                    <div className="text-sm text-foreground/70">Metadados</div>
                    <div className="grid grid-cols-2 gap-2 text-sm items-end">
                      <div>
                        <label className="text-xs">Técnico</label>
                        <Input value={tecnico} onChange={(e)=>setTecnico(e.target.value)} placeholder="Nome do técnico" />
                      </div>
                      <div>
                        <label className="text-xs">SLA (dias)</label>
                        <Input type="number" value={sla} onChange={(e)=>setSla(Number(e.target.value))} />
                      </div>
                      <div>
                        <label className="text-xs">Prioridade</label>
                        <Select value={prio} onValueChange={(v)=>setPrio(v as Manutencao['prioridade'])}>
                          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="baixa">Baixa</SelectItem>
                            <SelectItem value="media">Média</SelectItem>
                            <SelectItem value="alta">Alta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end">
                        <Button variant="outline" onClick={saveMeta}>Salvar</Button>
                      </div>
                    </div>
                  </div>
                  <div className="rounded border p-2 space-y-2">
                    <div className="text-sm text-foreground/70">Status</div>
                    <div className="flex flex-wrap gap-2">
                      {COLUMNS.map(c => (
                        <Button key={c.key} size="sm" variant={current.status===c.key? 'default':'outline'} onClick={()=>changeStatus(c.key)}>{c.title}</Button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="rounded border p-2 space-y-2">
                    <div className="text-sm text-foreground/70">Timeline</div>
                    <div className="max-h-48 overflow-auto text-sm">
                      <ul className="space-y-1">
                        {current.eventos.map((ev,i)=> (
                          <li key={i}>• {new Date(ev.data).toLocaleString('pt-BR')} — {ev.texto}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-end">
                      <div className="col-span-2">
                        <label className="text-xs">Observação</label>
                        <Input value={note} onChange={(e)=>setNote(e.target.value)} placeholder="Escreva uma observação" />
                      </div>
                      <Button onClick={addNote}>Enviar</Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Avaliar:</span>
                      {[1,2,3,4,5].map(s => <Button key={s} size="sm" variant="outline" onClick={()=>avaliar(s)}>{s}</Button>)}
                    </div>
                  </div>
                  <div className="rounded border p-2 space-y-2">
                    <div className="text-sm text-foreground/70">Anexos (fotos)</div>
                    <input type="file" accept="image/*" onChange={(e)=>addPhoto(e.target.files?.[0] ?? null)} />
                    <div className="grid grid-cols-3 gap-2">
                      {current.fotos.map((url, idx) => (
                        <img key={idx} src={url} alt={`foto-${idx}`} className="w-full h-20 object-cover rounded border" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}

