"use client";

import { useDemoStore } from '@/lib/store';
import { type Persona } from '@/lib/types';

const personas: { key: Persona; label: string }[] = [
  { key: 'admin', label: 'Admin' },
  { key: 'inquilino', label: 'Inquilino' },
  { key: 'proprietario', label: 'Proprietário' },
];

export function PersonaSwitcher() {
  const persona = useDemoStore((s) => s.persona);
  const setPersona = useDemoStore((s) => s.setPersona);
  return (
    <div className="inline-flex items-center gap-2" data-tour="persona">
      <label htmlFor="persona-select" className="text-sm text-foreground/70">Persona</label>
      <select
        id="persona-select"
        className="border rounded-md px-2 py-1 bg-background"
        value={persona}
        onChange={(e) => setPersona(e.target.value as Persona)}
      >
        {personas.map((p) => (
          <option key={p.key} value={p.key}>
            {p.label}
          </option>
        ))}
      </select>
    </div>
  );
}
