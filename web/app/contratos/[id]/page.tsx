"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDemoStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateContractTemplate } from '@/lib/templates';
import { toast } from 'sonner';

export default function ContratoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const store = useDemoStore();
  const contrato = store.data.entities.contratos.find((c) => c.id === id);
  const imovel = contrato ? store.data.entities.imoveis.find((i) => i.id === contrato.imovelId) : undefined;
  const inquilino = contrato ? store.data.entities.inquilinos.find((i) => i.id === contrato.inquilinoId) : undefined;
  const proprietario = contrato ? store.data.entities.proprietarios.find((p) => p.id === contrato.proprietarioId) : undefined;
  const eventos = store.contractEvents[id] ?? [];

  useEffect(() => {
    if (!contrato) return;
    if (!store.contractEvents[id]) {
      store.addContratoEvento(id, 'Contrato criado');
    }
  }, [contrato, id, store]);

  const [generated, setGenerated] = useState<string>('');
  const [envelopeId, setEnvelopeId] = useState<string | null>(null);
  const generate = () => {
    if (!contrato || !imovel || !inquilino || !proprietario) return;
    const txt = generateContractTemplate({ contrato, imovel, inquilino, proprietario });
    setGenerated(txt);
    toast.success('Contrato gerado a partir do template (mock)');
  };

  const onUploadPdf = async (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string; // data:application/pdf;base64,...
      store.addContratoArquivo(id, dataUrl);
      toast.success('PDF anexado ao contrato (mock)');
    };
    reader.readAsDataURL(file);
  };

  if (!contrato || !imovel || !inquilino || !proprietario) return <div>Contrato não encontrado.</div>;

  const canSend = contrato.status === 'rascunho';
  const canSign1 = contrato.status === 'pendente_assinatura';
  const canSign2 = contrato.status === 'pendente_assinatura';
  const canVigent = contrato.status === 'pendente_assinatura';

  const send = async () => {
    const res = await fetch('/api/clicksign/envelopes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contratoId: id }) });
    const json = await res.json();
    setEnvelopeId(json.envelopeId);
    await fetch(`/api/clicksign/envelopes/${json.envelopeId}/send`, { method: 'POST' });
    store.setContratoStatus(id, 'pendente_assinatura');
    store.addContratoEvento(id, `Envelope criado ${json.envelopeId} e enviado (mock)`);
    toast.message('Envelope enviado (mock)');
  };
  const sign1 = async () => {
    if (envelopeId) await fetch(`/api/clicksign/envelopes/${envelopeId}/sign`, { method: 'POST' });
    store.addContratoEvento(id, 'Assinante 1 (Inquilino) assinou');
    toast.message('Inquilino assinou (mock)');
  };
  const sign2 = async () => {
    if (envelopeId) await fetch(`/api/clicksign/envelopes/${envelopeId}/sign`, { method: 'POST' });
    store.addContratoEvento(id, 'Assinante 2 (Proprietário) assinou');
    toast.message('Proprietário assinou (mock)');
  };
  const vigent = () => { store.setContratoStatus(id, 'vigente'); store.addContratoEvento(id, 'Contrato assinado e vigente'); toast.success('Contrato marcado como vigente'); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Contrato {contrato.id.slice(0,8).toUpperCase()}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/contratos')}>Voltar</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <div className="rounded-lg border p-3">
            <div className="text-sm text-foreground/70 mb-2">Dados do Contrato</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <div><b>Imóvel:</b> {imovel.codigo} – {imovel.endereco}</div>
              <div><b>Inquilino:</b> {inquilino.nome}</div>
              <div><b>Proprietário:</b> {proprietario.nome}</div>
              <div><b>Vigência:</b> {new Date(contrato.inicio).toLocaleDateString('pt-BR')} → {new Date(contrato.fim).toLocaleDateString('pt-BR')}</div>
              <div><b>Status:</b> {contrato.status.replace('_',' ')}</div>
              <div><b>Total:</b> {(contrato.valorAluguel + contrato.valorCondominio).toLocaleString('pt-BR', { style:'currency', currency:'BRL'})}</div>
            </div>
          </div>

          <div className="rounded-lg border p-3 space-y-2">
            <div className="text-sm text-foreground/70">Gerar a partir de Template</div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={generate}>Gerar Contrato</Button>
              {generated && <Button variant="outline" onClick={() => navigator.clipboard.writeText(generated)}>Copiar</Button>}
            </div>
            {generated && (
              <textarea className="w-full h-64 border rounded p-2 text-sm" value={generated} onChange={(e)=>setGenerated(e.target.value)} />
            )}
          </div>

          <div className="rounded-lg border p-3 space-y-2">
            <div className="text-sm text-foreground/70">Anexos (PDF)</div>
            <label className="inline-flex items-center gap-2 border rounded px-3 py-1.5 w-fit cursor-pointer hover:bg-foreground/5">
              Upload PDF
              <input className="hidden" type="file" accept="application/pdf" onChange={(e)=> onUploadPdf(e.target.files?.[0] as File)} />
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {contrato.arquivos.map((url, idx) => (
                <iframe key={idx} src={url} className="w-full h-64 border rounded" title={`pdf-${idx}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border p-3 space-y-2">
            <div className="text-sm text-foreground/70">Simular Fluxo de Assinatura</div>
            <div className="grid gap-2">
              <Button disabled={!canSend} onClick={send}>Enviar para assinatura</Button>
              <Button variant="outline" disabled={!canSign1} onClick={sign1}>Assinar – Inquilino</Button>
              <Button variant="outline" disabled={!canSign2} onClick={sign2}>Assinar – Proprietário</Button>
              <Button disabled={!canVigent} onClick={vigent}>Marcar como vigente</Button>
            </div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-sm text-foreground/70 mb-2">Linha do tempo</div>
            <ul className="space-y-2 text-sm">
              {eventos.map((ev, i) => (
                <li key={i} className="flex gap-2 items-start">
                  <div className="mt-1 h-2 w-2 rounded-full bg-foreground" />
                  <div>
                    <div className="text-foreground/80">{new Date(ev.data).toLocaleString('pt-BR')}</div>
                    <div>{ev.texto}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
