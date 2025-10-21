"use client";

import Link from 'next/link';

const routes: { href: string; label: string }[] = [
  { href: '/', label: 'Dashboard' },
  { href: '/contratos', label: 'Contratos' },
  { href: '/relatorios/inadimplencia', label: 'Relatório: Inadimplência' },
  { href: '/relatorios/repasses', label: 'Relatório: Repasses' },
  { href: '/financeiro/boletos', label: 'Financeiro: Boletos' },
  { href: '/financeiro/repasses', label: 'Financeiro: Repasses' },
  { href: '/imoveis', label: 'Imóveis' },
  { href: '/manutencoes', label: 'Manutenções' },
  { href: '/mapa', label: 'Mapa' },
  { href: '/correspondencias', label: 'Correspondências' },
  { href: '/avisos', label: 'Avisos (Admin)' },
  { href: '/feed', label: 'Feed' },
  { href: '/inquilino', label: 'Portal do Inquilino' },
  { href: '/proprietario', label: 'Portal do Proprietário' },
  { href: '/admin', label: 'Admin' },
];

export default function SitemapPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Sitemap (rotas principais)</h1>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {routes.map((r) => (
          <li key={r.href}>
            <Link className="underline" href={r.href}>
              {r.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

