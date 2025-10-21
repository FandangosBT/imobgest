"use client";
/* eslint-disable @next/next/no-img-element */

import imageCompression from 'browser-image-compression';
import { useState } from 'react';
import { UploadCloud } from 'lucide-react';

type Item = { name: string; original: number; compressed: number; url: string };

export function UploadMock() {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);

  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    setBusy(true);
    const list: Item[] = [];
    for (const f of Array.from(files)) {
      const compressed = await imageCompression(f, { maxWidthOrHeight: 1600, maxSizeMB: 1, useWebWorker: true });
      const url = URL.createObjectURL(compressed);
      list.push({ name: f.name, original: f.size, compressed: compressed.size, url });
    }
    setItems(list);
    setBusy(false);
  };

  return (
    <div className="rounded-lg border bg-background p-4 space-y-3">
      <div className="text-sm text-foreground/70">Upload/preview (mock) com compressão</div>
      <label className="flex items-center gap-2 border rounded-md px-3 py-2 w-fit cursor-pointer hover:bg-foreground/5">
        <UploadCloud size={16} /> Selecionar arquivos
        <input className="hidden" type="file" multiple accept="image/*" onChange={(e) => onFiles(e.target.files)} />
      </label>
      {busy && <div className="text-sm">Comprimindo imagens…</div>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((it) => (
          <figure key={it.name} className="border rounded-md overflow-hidden">
            <img src={it.url} alt={it.name} className="w-full h-32 object-cover" />
            <figcaption className="p-2 text-xs">
              {it.name}
              <br />
              {(it.original / 1024).toFixed(0)} KB → {(it.compressed / 1024).toFixed(0)} KB
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
