"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Breadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split('/').filter(Boolean);
  const crumbs = [
    { name: 'Início', href: '/' },
    ...parts.map((p, i) => ({
      name: p.charAt(0).toUpperCase() + p.slice(1),
      href: '/' + parts.slice(0, i + 1).join('/'),
    })),
  ];
  return (
    <nav className="text-sm text-foreground/70" aria-label="Breadcrumb">
      {crumbs.map((c, i) => (
        <span key={c.href}>
          <Link className="hover:underline" href={c.href}>{c.name}</Link>
          {i < crumbs.length - 1 && <span className="px-1">/</span>}
        </span>
      ))}
    </nav>
  );
}

