"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDemoStore } from '@/lib/store';
import type { Imovel } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function ImovelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const store = useDemoStore();
  const imovel = store.data.entities.imoveis.find((i) => i.id === id);
  const contrato = imovel?.contratoVigenteId ? store.data.entities.contratos.find(c=>c.id===imovel.contratoVigenteId) : undefined;
  const inquilino = contrato ? store.data.entities.inquilinos.find(i=>i.id===contrato.inquilinoId) : undefined;
  // const proprietario = imovel ? store.data.entities.proprietarios.find(p=>p.id===imovel.proprietarioId) : undefined;

  const [form, setForm] = useState<Imovel | null>(imovel ? { ...imovel } : null);
  if (!imovel || !form) return <div>Imóvel não encontrado.</div>;

  const save = () => {
    if (!form.endereco || !form.cidade || !form.uf) {
      toast.error('Preencha endereço, cidade e UF');
      return;
    }
    store.updateImovel(form);
    toast.success('Imóvel atualizado (mock)');
  };

  const del = () => {
    if (!confirm('Excluir imóvel (mock)?')) return;
    store.deleteImovel(imovel.id);
    toast.success('Imóvel excluído (mock)');
    router.push('/imoveis');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{imovel.codigo} — {imovel.tipo.toUpperCase()}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/imoveis')}>Voltar</Button>
          <Button variant="destructive" onClick={del}>Excluir</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {/* eslint-disable @next/next/no-img-element */}
            {[1,2,3].map((k) => (
              <img key={k} src="/window.svg" alt="foto" className="w-full h-32 object-cover rounded border" />
            ))}
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-sm text-foreground/70 mb-2">Atributos</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <div>Metragem: <b>{imovel.metragem} m²</b></div>
              <div>Quartos: <b>{imovel.quartos}</b></div>
              <div>Banheiros: <b>{imovel.banheiros}</b></div>
              <div>Vagas: <b>{imovel.vagas}</b></div>
              <div>Status: <b>{imovel.statusOcupa}</b></div>
              <div>Local: <b>{imovel.cidade}/{imovel.uf}</b></div>
            </div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-sm text-foreground/70 mb-2">Localização</div>
            <iframe
              title="mapa"
              className="w-full h-64 rounded"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${imovel.geo.lng-0.01},${imovel.geo.lat-0.01},${imovel.geo.lng+0.01},${imovel.geo.lat+0.01}&layer=mapnik&marker=${imovel.geo.lat}%2C${imovel.geo.lng}`}
            />
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-lg border p-3">
            <div className="text-sm text-foreground/70 mb-2">Contrato vigente</div>
            {contrato ? (
              <div className="text-sm space-y-1">
                <div><b>ID:</b> {contrato.id.slice(0,8).toUpperCase()}</div>
                <div><b>Inquilino:</b> {inquilino?.nome}</div>
                <div><b>Valor:</b> {(contrato.valorAluguel + contrato.valorCondominio).toLocaleString('pt-BR', { style:'currency', currency:'BRL'})}</div>
                <div><b>Status:</b> {contrato.status}</div>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" onClick={()=>toast.message('Ação mock: abrir contrato')}>Ver Contrato</Button>
                  <Button variant="outline" onClick={()=>toast.message('Ação mock: ir para inquilino')}>Ver Inquilino</Button>
                </div>
              </div>
            ) : (
              <div className="text-sm">Sem contrato vigente</div>
            )}
          </div>

          <div className="rounded-lg border p-3">
            <div className="text-sm text-foreground/70 mb-2">Editar dados</div>
            <div className="grid gap-2">
              <label className="text-xs">Endereço</label>
              <Input value={form.endereco} onChange={(e)=>setForm({...form, endereco: e.target.value})} />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs">Cidade</label>
                  <Input value={form.cidade} onChange={(e)=>setForm({...form, cidade: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs">UF</label>
                  <Input value={form.uf} onChange={(e)=>setForm({...form, uf: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs">Quartos</label>
                  <Input type="number" value={form.quartos} onChange={(e)=>setForm({...form, quartos: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="text-xs">Banheiros</label>
                  <Input type="number" value={form.banheiros} onChange={(e)=>setForm({...form, banheiros: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="text-xs">Vagas</label>
                  <Input type="number" value={form.vagas} onChange={(e)=>setForm({...form, vagas: Number(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="text-xs">Tipo</label>
                <Select value={form.tipo} onValueChange={(v)=>setForm({...form, tipo: v as Imovel['tipo']})}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apto">Apartamento</SelectItem>
                    <SelectItem value="casa">Casa</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="sala">Sala</SelectItem>
                    <SelectItem value="terreno">Terreno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={()=>setForm({...imovel})}>Desfazer</Button>
                <Button onClick={save}>Salvar</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
