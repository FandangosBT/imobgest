"use client";

import { useEffect, useState } from 'react';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator } from "@/components/ui/command";
import { useDemoStore } from '@/lib/store';
import { Search, Wand2, BellRing } from 'lucide-react';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const toggleScenario = useDemoStore((s) => s.toggleScenario);
  const setPersona = useDemoStore((s) => s.setPersona);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const el = document.activeElement as HTMLElement | null;
        const tag = el?.tagName?.toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl">
        <Command className="rounded-lg border bg-background text-foreground">
          <CommandInput placeholder="Buscar comandos…" className="px-3 py-2" autoFocus />
          <CommandList className="max-h-72 overflow-auto">
            <CommandEmpty className="p-3 text-sm text-foreground/60">Sem resultados.</CommandEmpty>
            <CommandGroup heading="Ações" className="p-2">
              <CommandItem onSelect={() => { setPersona('admin'); setOpen(false); }}>
                <Search className="mr-2 h-4 w-4" /> Ir para Dashboard (Admin)
              </CommandItem>
              <CommandItem onSelect={() => { setPersona('inquilino'); setOpen(false); }}>
                <Search className="mr-2 h-4 w-4" /> Ir para Portal do Inquilino
              </CommandItem>
              <CommandItem onSelect={() => { setPersona('proprietario'); setOpen(false); }}>
                <Search className="mr-2 h-4 w-4" /> Ir para Portal do Proprietário
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Cenários" className="p-2">
              <CommandItem onSelect={() => { toggleScenario('highInadimplencia'); setOpen(false); }}>
                <Wand2 className="mr-2 h-4 w-4" /> Alternar: Alta inadimplência
              </CommandItem>
              <CommandItem onSelect={() => { toggleScenario('highManutencao'); setOpen(false); }}>
                <Wand2 className="mr-2 h-4 w-4" /> Alternar: Alta manutenção
              </CommandItem>
              <CommandItem onSelect={() => { toggleScenario('highVacancia'); setOpen(false); }}>
                <Wand2 className="mr-2 h-4 w-4" /> Alternar: Vacância elevada
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Outros" className="p-2">
              <CommandItem onSelect={() => { alert('Lembretes enviados (simulado)'); setOpen(false); }}>
                <BellRing className="mr-2 h-4 w-4" /> Enviar lembrete de cobrança
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
        <div className="text-xs text-center text-foreground/60 mt-2">Pressione Esc para fechar • Atalho: Cmd/Ctrl + K</div>
      </div>
    </div>
  );
}
