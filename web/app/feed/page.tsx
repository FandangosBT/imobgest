"use client";

import { useMemo } from "react";
import { useDemoStore } from "@/lib/store";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";

export default function FeedPage() {
  const store = useDemoStore();
  const persona = store.persona;
  const userId = persona==='inquilino' ? store.currentInquilinoId : persona==='proprietario' ? store.currentProprietarioId : null;
  const avisos = store.data.entities.avisos;

  const visiveis = useMemo(()=>{
    return avisos.filter(a => {
      if (a.publicoAlvo === 'todos') return true;
      if (a.publicoAlvo === 'inquilinos') return persona==='inquilino';
      if (a.publicoAlvo === 'proprietarios') return persona==='proprietario';
      return true;
    });
  }, [avisos, persona]);

  const confirmar = (id: string) => { if (!userId) return; store.confirmarAvisoLeitura(id, userId); };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Feed de Avisos</h1>
      <div className="space-y-3">
        {visiveis.map(a => {
          const lido = userId ? a.leituraConfirmadaPor.includes(userId) : false;
          return (
            <div key={a.id} className={`border rounded p-3 ${!lido ? 'bg-yellow-50' : 'bg-background'}`}>
              <div className="flex items-center gap-2">
                <div className="font-medium">{a.titulo}</div>
                <div className="text-xs text-foreground/60">[{a.grupos.join(', ')}]{a.segmentoDetalhe ? ` • ${a.segmentoDetalhe}` : ''}</div>
                <div className="ml-auto text-xs">Público: {a.publicoAlvo}</div>
              </div>
              <div className="prose prose-sm max-w-none mt-2">
                <ReactMarkdown>{a.corpo}</ReactMarkdown>
              </div>
              {userId && (
                <div className="mt-2">
                  <Button size="sm" variant="outline" onClick={()=>confirmar(a.id)} disabled={lido}>{lido ? 'Leitura confirmada' : 'Confirmar leitura'}</Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

