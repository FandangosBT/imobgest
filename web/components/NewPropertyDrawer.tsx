"use client";

import { useState, useEffect } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { UploadMock } from './UploadMock';
import { useDemoStore } from '@/lib/store';
import { type Imovel } from '@/lib/types';
import { toast } from 'sonner';

export function NewPropertyDrawer() {
  const addImovel = useDemoStore((s) => s.addImovel);
  const [open, setOpen] = useState(false);
  const [disponivel, setDisponivel] = useState<Date | undefined>(new Date());
  const [form, setForm] = useState({
    codigo: '',
    tipo: 'apto' as Imovel['tipo'],
    endereco: '',
    cidade: 'São Paulo',
    uf: 'SP',
    metragem: 50,
    quartos: 2,
    banheiros: 1,
    vagas: 1,
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'n' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const el = document.activeElement as HTMLElement | null;
        const tag = el?.tagName?.toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const submit = () => {
    const id = crypto.randomUUID();
    const i: Imovel = {
      id,
      codigo: form.codigo || `IM-${Math.floor(Math.random()*9000)+1000}`,
      tipo: form.tipo,
      endereco: form.endereco || 'Endereço não informado',
      cidade: form.cidade,
      uf: form.uf,
      geo: { lat: -23.55 + Math.random()*0.1, lng: -46.65 + Math.random()*0.1 },
      metragem: Number(form.metragem) || 50,
      quartos: Number(form.quartos) || 2,
      banheiros: Number(form.banheiros) || 1,
      vagas: Number(form.vagas) || 1,
      fotos: [],
      statusOcupa: 'vago',
      proprietarioId: (useDemoStore.getState().data.entities.proprietarios[0]?.id) || id,
      contratoVigenteId: undefined,
    };
    addImovel(i);
    setOpen(false);
    toast.success('Imóvel cadastrado (mock)');
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" data-tour="new-property">
          Novo Imóvel (N)
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Novo Imóvel (mock)</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="grid gap-2">
            <label className="text-sm">Código</label>
            <Input value={form.codigo} onChange={(e)=>setForm({...form, codigo: e.target.value})} placeholder="IM-0001" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm">Tipo</label>
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
          <div className="grid gap-2 md:col-span-2">
            <label className="text-sm">Endereço</label>
            <Input value={form.endereco} onChange={(e)=>setForm({...form, endereco: e.target.value})} placeholder="Rua Exemplo, 123" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm">Cidade</label>
            <Input value={form.cidade} onChange={(e)=>setForm({...form, cidade: e.target.value})} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm">UF</label>
            <Input value={form.uf} onChange={(e)=>setForm({...form, uf: e.target.value})} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm">Metragem (m²)</label>
            <Input type="number" value={form.metragem} onChange={(e)=>setForm({...form, metragem: Number(e.target.value)})} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm">Quartos</label>
            <Input type="number" value={form.quartos} onChange={(e)=>setForm({...form, quartos: Number(e.target.value)})} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm">Banheiros</label>
            <Input type="number" value={form.banheiros} onChange={(e)=>setForm({...form, banheiros: Number(e.target.value)})} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm">Vagas</label>
            <Input type="number" value={form.vagas} onChange={(e)=>setForm({...form, vagas: Number(e.target.value)})} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm">Disponível a partir</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">{disponivel?.toLocaleDateString('pt-BR')}</Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Calendar mode="single" selected={disponivel} onSelect={setDisponivel} />
              </PopoverContent>
            </Popover>
          </div>
          <div className="md:col-span-2">
            <UploadMock />
          </div>
          <div className="md:col-span-2 flex justify-end gap-2">
            <Button variant="outline" onClick={()=>setOpen(false)}>Cancelar</Button>
            <Button onClick={submit}>Salvar</Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
