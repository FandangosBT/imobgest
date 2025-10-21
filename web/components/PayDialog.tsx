"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function PayDialog({ open, onOpenChange, onConfirm, total }: { open: boolean; onOpenChange: (v: boolean) => void; onConfirm: (valor: number, comprovante?: string) => void; total: number }) {
  const [valor, setValor] = useState<number>(total);
  const [file, setFile] = useState<File | null>(null);
  const confirm = () => {
    if (!valor || valor <= 0) return;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onConfirm(valor, reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      onConfirm(valor);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar pagamento (mock)</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="text-sm">Total: {total.toLocaleString('pt-BR', { style:'currency', currency:'BRL'})}</div>
          <div className="grid gap-2">
            <label className="text-xs">Valor pago</label>
            <Input type="number" value={valor} onChange={(e)=>setValor(Number(e.target.value))} />
          </div>
          <div className="grid gap-2">
            <label className="text-xs">Comprovante (opcional)</label>
            <input type="file" accept="image/*,application/pdf" onChange={(e)=>setFile(e.target.files?.[0] ?? null)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={()=>onOpenChange(false)}>Cancelar</Button>
            <Button onClick={confirm}>Confirmar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

