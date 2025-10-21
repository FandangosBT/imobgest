"use client";

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem('imobgest-theme');
    if (stored) setDark(stored === 'dark');
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.style.setProperty('--background', '#0a0a0a');
      root.style.setProperty('--foreground', '#ededed');
    } else {
      root.style.setProperty('--background', '#ffffff');
      root.style.setProperty('--foreground', '#171717');
    }
    localStorage.setItem('imobgest-theme', dark ? 'dark' : 'light');
  }, [dark]);
  return (
    <button
      className="inline-flex items-center gap-2 text-sm border px-3 py-1.5 rounded-md hover:bg-foreground/5"
      onClick={() => setDark((v) => !v)}
      aria-label="Alternar tema"
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
      {dark ? 'Claro' : 'Escuro'}
    </button>
  );
}

