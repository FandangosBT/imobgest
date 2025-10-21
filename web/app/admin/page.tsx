"use client";

import { RoleGuard } from "@/components/RoleGuard";
import { TableBoletos } from "@/components/TableBoletos";
import { DemoControls } from "@/components/DemoControls";

export default function AdminPage() {
  return (
    <RoleGuard allow={["admin"]}>
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Área Administrativa</h1>
        <TableBoletos />
        <DemoControls />
      </div>
    </RoleGuard>
  );
}

