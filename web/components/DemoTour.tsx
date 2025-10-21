"use client";

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';

type Step = { target: string; content: string };

const steps: Step[] = [
  { target: '[data-tour="persona"]', content: 'Troque rapidamente entre Admin, Inquilino e Proprietário.' },
  { target: '[data-tour="notifications"]', content: 'Veja avisos e confirme leitura diretamente aqui.' },
  { target: '[data-tour="new-property"]', content: 'Cadastre um novo imóvel (atalho N).' },
];

export function DemoTour() {
  const [run, setRun] = useState(false);
  const [i, setI] = useState(0);
  const step = steps[i];
  const el = typeof document !== 'undefined' && step ? (document.querySelector(step.target) as HTMLElement | null) : null;

  useEffect(() => {
    if (!run || !el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [run, i, el]);

  const rect = el?.getBoundingClientRect();
  const pos = useMemo(() => {
    if (!rect) return null;
    const top = rect.bottom + 8;
    const left = Math.min(rect.left, window.innerWidth - 280);
    return { top, left };
  }, [rect]);

  const onNext = () => setI((v) => Math.min(v + 1, steps.length - 1));
  const onBack = () => setI((v) => Math.max(v - 1, 0));
  const onStop = () => { setRun(false); setI(0); };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <Button variant="outline" onClick={()=> setRun(true)}>Tour</Button>
      {run && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={onStop} />
          {pos && (
            <div className="fixed z-50 max-w-[260px] rounded-md border bg-background p-3 shadow-xl" style={{ top: pos.top, left: pos.left }}>
              <div className="text-sm mb-2">{step.content}</div>
              <div className="flex justify-between text-sm">
                <Button variant="outline" size="sm" onClick={onBack} disabled={i===0}>Voltar</Button>
                {i < steps.length - 1 ? (
                  <Button size="sm" onClick={onNext}>Próximo</Button>
                ) : (
                  <Button size="sm" onClick={onStop}>Concluir</Button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
