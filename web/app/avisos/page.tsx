"use client";

import { RoleGuard } from "@/components/RoleGuard";
import { useDemoStore } from "@/lib/store";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export default function AvisosAdminPage() {
  return (
    <RoleGuard allow={["admin"]}>
      <Content />
    </RoleGuard>
  );
}

function Content() {
  const store = useDemoStore();
  const [titulo, setTitulo] = useState("");
  const [corpo, setCorpo] = useState("");
  const [publico, setPublico] = useState<'todos'|'inquilinos'|'proprietarios'>("todos");
  const [grGer, setGer] = useState(true);
  const [grPre, setPre] = useState(false);
  const [grUni, setUni] = useState(false);
  const [segmento, setSegmento] = useState("");
  const [preview, setPreview] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const avisos = store.data.entities.avisos;
  const create = () => {
    const grupos = [grGer && 'geral', grPre && 'predio', grUni && 'unidade'].filter(Boolean) as ('geral'|'predio'|'unidade')[];
    if (!titulo || !corpo || grupos.length===0) { toast.error('Preencha título, corpo e grupos'); return; }
    store.addAviso({ titulo, corpo, grupos, publicoAlvo: publico, segmentoDetalhe: segmento || undefined });
    setTitulo(""); setCorpo(""); setGer(true); setPre(false); setUni(false); setSegmento(""); setPublico('todos'); setPreview(false);
    toast.success('Aviso publicado (mock)');
  };

  const startEdit = (id: string) => {
    const a = avisos.find(x=>x.id===id); if (!a) return;
    setEditingId(id);
    setTitulo(a.titulo);
    setCorpo(a.corpo);
    setPublico(a.publicoAlvo);
    setGer(a.grupos.includes('geral'));
    setPre(a.grupos.includes('predio'));
    setUni(a.grupos.includes('unidade'));
    setSegmento(a.segmentoDetalhe || "");
    setPreview(false);
  };
  const saveEdit = () => {
    if (!editingId) return;
    const grupos = [grGer && 'geral', grPre && 'predio', grUni && 'unidade'].filter(Boolean) as ('geral'|'predio'|'unidade')[];
    const a = avisos.find(x=>x.id===editingId); if (!a) return;
    store.updateAviso({ ...a, titulo, corpo, publicoAlvo: publico, grupos, segmentoDetalhe: segmento || undefined });
    setEditingId(null); setTitulo(""); setCorpo(""); setGer(true); setPre(false); setUni(false); setSegmento(""); setPublico('todos'); setPreview(false);
    toast.success('Aviso atualizado (mock)');
  };
  const remove = (id: string) => { if (!confirm('Excluir aviso?')) return; store.deleteAviso(id); toast.success('Aviso excluído'); };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Avisos e Comunicados (Admin)</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-lg border p-3 bg-background space-y-2">
          <div className="text-sm text-foreground/70">{editingId ? 'Editar aviso' : 'Novo aviso'}</div>
          <div className="grid gap-2">
            <label className="text-xs">Título</label>
            <Input value={titulo} onChange={(e)=>setTitulo(e.target.value)} />
            <label className="text-xs">Corpo (Markdown simples)</label>
            <textarea className="border rounded p-2 text-sm h-40" value={corpo} onChange={(e)=>setCorpo(e.target.value)} />
            <div className="flex items-center gap-4 text-sm">
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={grGer} onChange={(e)=>setGer(e.target.checked)} /> Geral</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={grPre} onChange={(e)=>setPre(e.target.checked)} /> Prédio</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={grUni} onChange={(e)=>setUni(e.target.checked)} /> Unidade</label>
              <div className="ml-auto" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs">Detalhe do segmento (opcional)</label>
                <Input placeholder="Ex.: Bloco A, Apto 101" value={segmento} onChange={(e)=>setSegmento(e.target.value)} />
              </div>
              <div>
                <label className="text-xs">Público</label>
                <Select value={publico} onValueChange={(v)=>setPublico(v as 'todos'|'inquilinos'|'proprietarios')}>
                  <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="inquilinos">Inquilinos</SelectItem>
                    <SelectItem value="proprietarios">Proprietários</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={()=>setPreview(v=>!v)}>{preview ? 'Editar' : 'Preview'}</Button>
              {editingId ? (
                <Button onClick={saveEdit}>Salvar</Button>
              ) : (
                <Button onClick={create}>Publicar</Button>
              )}
            </div>
            {preview && (
              <div className="border rounded p-3 text-sm bg-foreground/5">
                <ReactMarkdown>{corpo || '*sem conteúdo*'}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border p-3 bg-background">
          <div className="text-sm text-foreground/70 mb-2">Lista</div>
          <div className="space-y-2">
            {avisos.map(a => (
              <div key={a.id} className="border rounded p-2">
                <div className="flex items-center gap-2">
                  <div className="font-medium">{a.titulo}</div>
                  <div className="text-xs text-foreground/60">[{a.grupos.join(', ')}] {a.segmentoDetalhe ? `• ${a.segmentoDetalhe}` : ''} • Público: {a.publicoAlvo}</div>
                  <div className="ml-auto flex gap-2">
                    <Button size="sm" variant="outline" onClick={()=>startEdit(a.id)}>Editar</Button>
                    <Button size="sm" variant="destructive" onClick={()=>remove(a.id)}>Excluir</Button>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none mt-2">
                  <ReactMarkdown>{a.corpo}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
