"use client";

import { useDemoStore } from '@/lib/store';

export function DemoBanner() {
  const persona = useDemoStore((s) => s.persona);
  const env = process.env.NEXT_PUBLIC_APP_ENV || 'demo';
  return (
    <div className="w-full rounded-md bg-yellow-100 text-yellow-900 border border-yellow-300 px-4 py-2 text-sm">
      Sessão de demonstração – dados fictícios. Perfil atual: <b className="font-semibold">{persona}</b> • env: {env}
    </div>
  );
}
