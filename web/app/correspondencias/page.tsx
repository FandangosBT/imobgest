"use client";

import { RoleGuard } from "@/components/RoleGuard";
import { useDemoStore } from "@/lib/store";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

type Row = { id: string; imovel: string; recebedor: string; remetente: string; data: string; status: 'pendente'|'retirado'; foto?: string };

export default function CorrespondenciasAdminPage() {
  return (
    <RoleGuard allow={["admin"]}>
      <Content />
    </RoleGuard>
  );
}

function Content() {
  const store = useDemoStore();
  const { correspondencias, imoveis } = store.data.entities;
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [openPickup, setOpenPickup] = useState<string | null>(null);
  const [responsavel, setResponsavel] = useState('');

  const rows = useMemo<Row[]>(() => {
    return correspondencias.map(c => {
      const im = imoveis.find(i=>i.id===c.imovelId);
      return { id: c.id, imovel: im ? `${im.codigo} – ${im.endereco}` : '-', recebedor: c.recebedor, remetente: c.remetente, data: new Date(c.dataRecebimento).toLocaleDateString('pt-BR'), status: c.statusRetirada, foto: c.foto };
    })
    .filter(r => (status && status !== 'all' ? r.status === (status as Row['status']) : true))
    .filter(r => (q ? (r.imovel + r.recebedor + r.remetente).toLowerCase().includes(q.toLowerCase()) : true));
  }, [correspondencias, imoveis, status, q]);

  // form state
  const [imovelId, setImovelId] = useState<string>('');
  const [recebedor, setRecebedor] = useState('');
  const [remetente, setRemetente] = useState('');
  const [foto, setFoto] = useState<string | undefined>(undefined);
  const onFoto = (file: File | null) => {
    if (!file) return setFoto(undefined);
    const reader = new FileReader();
    reader.onload = () => setFoto(reader.result as string);
    reader.readAsDataURL(file);
  };
  const create = () => {
    if (!imovelId || !recebedor || !remetente) { toast.error('Preencha imóvel, recebedor e remetente'); return; }
    store.addCorrespondencia({ imovelId, recebedor, remetente, fotoDataUrl: foto });
    setImovelId(''); setRecebedor(''); setRemetente(''); setFoto(undefined);
    toast.success('Correspondência registrada (mock)');
  };

  const confirmPickup = () => {
    if (!openPickup) return;
    store.confirmarRetiradaCorrespondencia(openPickup, responsavel || 'Recebedor');
    setOpenPickup(null); setResponsavel('');
    toast.success('Retirada confirmada (mock)');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Controle de Correspondências (Admin)</h1>
      <div className="rounded-lg border p-3 bg-background">
        <div className="text-sm text-foreground/70 mb-2">Nova correspondência</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div>
            <label className="text-xs">Imóvel</label>
            <Select value={imovelId} onValueChange={setImovelId}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {imoveis.slice(0,200).map(i=> <SelectItem key={i.id} value={i.id}>{i.codigo} — {i.cidade}/{i.uf}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs">Recebedor</label>
            <Input value={recebedor} onChange={(e)=>setRecebedor(e.target.value)} />
          </div>
          <div>
            <label className="text-xs">Remetente</label>
            <Input value={remetente} onChange={(e)=>setRemetente(e.target.value)} />
          </div>
          <div>
            <label className="text-xs">Foto (opcional)</label>
            <input type="file" accept="image/*" onChange={(e)=>onFoto(e.target.files?.[0] ?? null)} />
          </div>
        </div>
        <div className="flex justify-end mt-2">
          <Button onClick={create}>Registrar</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="text-xs">Status</label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Todos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="retirado">Retirado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs">Buscar</label>
          <Input placeholder="Imóvel/Recebedor/Remetente" value={q} onChange={(e)=>setQ(e.target.value)} />
        </div>
      </div>

      <div className="rounded-lg border p-2 bg-background overflow-x-auto">
        <table className="min-w-[900px] w-full text-sm">
          <thead>
            <tr>
              <th className="text-left border-b py-2 pr-2 font-medium">Imóvel</th>
              <th className="text-left border-b py-2 pr-2 font-medium">Recebedor</th>
              <th className="text-left border-b py-2 pr-2 font-medium">Remetente</th>
              <th className="text-left border-b py-2 pr-2 font-medium">Data</th>
              <th className="text-left border-b py-2 pr-2 font-medium">Status</th>
              <th className="text-left border-b py-2 pr-2 font-medium">Foto</th>
              <th className="text-left border-b py-2 pr-2 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-b last:border-b-0">
                <td className="py-2 pr-2">{r.imovel}</td>
                <td className="py-2 pr-2">{r.recebedor}</td>
                <td className="py-2 pr-2">{r.remetente}</td>
                <td className="py-2 pr-2">{r.data}</td>
                <td className="py-2 pr-2">{r.status}</td>
                <td className="py-2 pr-2">{r.foto ? <img src={r.foto} alt="foto" className="w-10 h-10 object-cover rounded" /> : '-'}</td>
                <td className="py-2 pr-2">
                  {r.status==='pendente' ? (
                    <Button size="sm" onClick={()=>{ setOpenPickup(r.id); setResponsavel(''); }}>Confirmar retirada</Button>
                  ) : (
                    <span className="text-foreground/60">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!openPickup} onOpenChange={(v)=> setOpenPickup(v ? openPickup : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar retirada</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Informe o responsável pela retirada para registrar a correspondência como retirada.
          </DialogDescription>
          <div className="grid gap-2">
            <label className="text-xs">Responsável pela retirada</label>
            <Input value={responsavel} onChange={(e)=>setResponsavel(e.target.value)} placeholder="Nome completo" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={()=>setOpenPickup(null)}>Cancelar</Button>
              <Button onClick={confirmPickup}>Confirmar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
