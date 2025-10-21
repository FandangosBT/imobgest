"use client";

import { useState, useMemo } from 'react';
import { Bell } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { useDemoStore } from '@/lib/store';

export function NotificationBell() {
  const avisos = useDemoStore((s) => s.data.entities.avisos);
  const persona = useDemoStore((s) => s.persona);
  const inqId = useDemoStore((s) => s.currentInquilinoId);
  const propId = useDemoStore((s) => s.currentProprietarioId);
  const userId = persona === 'inquilino' ? inqId : persona === 'proprietario' ? propId : null;
  const [open, setOpen] = useState(false);
  const visiveis = useMemo(() => avisos.filter(a => {
    if (a.publicoAlvo === 'todos') return true;
    if (a.publicoAlvo === 'inquilinos') return persona==='inquilino';
    if (a.publicoAlvo === 'proprietarios') return persona==='proprietario';
    return true;
  }), [avisos, persona]);
  const count = useMemo(() => {
    if (!userId) return visiveis.length;
    return visiveis.filter(a => !a.leituraConfirmadaPor.includes(userId)).length;
  }, [visiveis, userId]);
  const confirmar = (id: string) => { if (!userId) return; useDemoStore.getState().confirmarAvisoLeitura(id, userId); };
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button className="relative inline-flex items-center gap-2 border px-3 py-1.5 rounded-md hover:bg-foreground/5" data-tour="notifications">
          <Bell size={16} />
          Notificações
          {count > 0 && <Badge variant="default">{count}</Badge>}
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Notificações (mock)</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-3 max-h-[50vh] overflow-auto">
          {visiveis.slice(0,8).map((a) => {
            const lido = userId ? a.leituraConfirmadaPor.includes(userId) : true;
            return (
              <div key={a.id} className={`border rounded-md p-3 ${!lido ? 'bg-yellow-50' : ''}`}>
                <div className="font-medium">{a.titulo}</div>
                <div className="text-xs text-foreground/60">[{a.grupos.join(', ')}]{a.segmentoDetalhe ? ` • ${a.segmentoDetalhe}` : ''}</div>
                <div className="text-sm text-foreground/70 line-clamp-2 mt-1">{a.corpo}</div>
                {userId && (
                  <div className="mt-2">
                    <button className="text-xs px-2 py-1 border rounded" onClick={()=>confirmar(a.id)} disabled={lido}>{lido ? 'Lido' : 'Confirmar leitura'}</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
