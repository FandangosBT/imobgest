"use client";

import { useDemoStore } from '@/lib/store';
import Link from 'next/link';
import type { Persona } from '@/lib/types';

export function RoleGuard({ allow, children }: { allow: Persona[]; children: React.ReactNode }) {
  const persona = useDemoStore((s) => s.persona);
  const setPersona = useDemoStore((s) => s.setPersona);
  if (!allow.includes(persona)) {
    const target = allow[0];
    return (
      <div className="rounded-md border p-6 bg-background">
        <div className="text-lg font-semibold mb-2">Acesso restrito</div>
        <p className="text-sm text-foreground/70 mb-4">
          Esta área está disponível apenas para <b>{allow.join(' / ')}</b>.
        </p>
        <div className="flex gap-2">
          <button className="text-sm px-3 py-1.5 rounded-md border" onClick={() => setPersona(target)}>
            Trocar para {target}
          </button>
          <Link className="text-sm px-3 py-1.5 rounded-md border" href="/">
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
