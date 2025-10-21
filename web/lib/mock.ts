import { DemoData } from './types';
import { generateSeed } from './seed';

export function baseDemoData(): DemoData {
  return generateSeed();
}

export function scenarioHighInadimplencia(data: DemoData): DemoData {
  const adjSerie = data.inadimplenciaSerie.map((p, i) => ({ mes: p.mes, esperado: p.esperado, recebido: Math.round(p.esperado * (i < 6 ? 0.76 : 0.82)) }));
  return { ...data, kpis: { ...data.kpis, inadimplenciaPercent: 0.18 }, inadimplenciaSerie: adjSerie };
}

export function scenarioHighVacancia(data: DemoData): DemoData {
  return { ...data, kpis: { ...data.kpis, taxaOcupacao: 0.78 }, imoveisMapa: data.imoveisMapa.map((m, i) => ({ ...m, status: i % 2 === 0 ? 'vago' : m.status })) };
}

export function scenarioHighManutencao(data: DemoData): DemoData {
  return { ...data, kpis: { ...data.kpis, vencendo7dias: data.kpis.vencendo7dias + 6 }, imoveisMapa: data.imoveisMapa.map((m, i) => ({ ...m, status: i % 3 === 0 ? 'manutencao' : m.status })) };
}
