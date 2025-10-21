"use client";

import dynamic from "next/dynamic";
const KpiCards = dynamic(() => import("@/components/features/dashboard").then(m => m.KpiCards), { ssr: false, loading: () => <div className="rounded-lg border p-4 h-24 bg-background" aria-hidden /> });
const ChartInadimplencia = dynamic(() => import("@/components/features/dashboard").then(m => m.ChartInadimplencia), { ssr: false, loading: () => <div className="rounded-lg border p-4 h-[260px] bg-background" aria-hidden /> });
const MapLibreProperties = dynamic(() => import("@/components/features/dashboard").then(m => m.MapLibreProperties), { ssr: false, loading: () => <div className="rounded-lg border p-4 h-[300px] bg-background" aria-hidden /> });
const ChartRepasses = dynamic(() => import("@/components/ChartRepasses").then(m => m.ChartRepasses), { ssr: false, loading: () => <div className="rounded-lg border p-4 h-[260px] bg-background" aria-hidden /> });
import { DemoControls } from "@/components/DemoControls";
import { useDemoStore } from "@/lib/store";
import React from "react";
import { UploadMock } from "@/components/UploadMock";

const QuickActions = dynamic(() => import("@/components/QuickActions").then(m => m.QuickActions), { ssr: false });

export default function Home() {
  const persona = useDemoStore((s) => s.persona);
  return (
    <div className="space-y-4">
      <KpiCards />
      <div className="grid min-w-0 grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="min-w-0"><ChartInadimplencia /></div>
        <div className="min-w-0"><MapLibreProperties /></div>
      </div>
      <ChartRepasses />
      {persona === 'admin' && <QuickActions />}
      {persona === 'admin' && <DemoControls />}
      <UploadMock />
    </div>
  );
}
