"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';
import type { DemoData, Persona, ScenarioFlags, Imovel, ImovelPoint, Contrato, Repasse, Manutencao, Aviso, Correspondencia } from './types';
import { baseDemoData, scenarioHighInadimplencia, scenarioHighManutencao, scenarioHighVacancia } from './mock';

type Store = {
  persona: Persona;
  scenarios: ScenarioFlags;
  data: DemoData;
  contractEvents: Record<string, { data: string; texto: string }[]>;
  currentInquilinoId: string | null;
  currentProprietarioId: string | null;
  hydrated: boolean;
  setPersona: (p: Persona) => void;
  setCurrentInquilino: (id: string) => void;
  setCurrentProprietario: (id: string) => void;
  toggleScenario: (key: keyof ScenarioFlags) => void;
  resetData: () => void;
  simulate: (action: 'gerarBoletos' | 'enviarLembrete') => string;
  addImovel: (i: Imovel) => void;
  updateImovel: (i: Imovel) => void;
  deleteImovel: (id: string) => void;
  setContratoStatus: (id: string, status: Contrato['status']) => void;
  addContratoArquivo: (id: string, dataUrl: string) => void;
  addContratoEvento: (id: string, texto: string) => void;
  addContrato: (input: { imovelId: string; inquilinoId: string; proprietarioId: string; inicio?: string; fim?: string; valorAluguel?: number; valorCondominio?: number; reajuste?: Contrato['reajuste']; status?: Contrato['status'] }) => string;
  generateBoletosMes: (competencia: string) => number;
  applyPenalty: (boletoId: string) => void;
  sendReminder: (boletoId: string) => void;
  registerPayment: (boletoId: string, valorPago: number, comprovante?: string) => void;
  liquidarRepasse: (repasseId: string) => void;
  addManutencao: (input: { contratoId: string; imovelId: string; descricao: string; prioridade: Manutencao['prioridade']; fotos?: string[] }) => void;
  addManutencaoEvento: (id: string, texto: string) => void;
  setManutencaoStatus: (id: string, status: Manutencao['status']) => void;
  confirmarAvisoLeitura: (avisoId: string, userId: string) => void;
  addAviso: (input: { titulo: string; corpo: string; grupos: Aviso['grupos']; publicoAlvo: Aviso['publicoAlvo']; expiracao?: string; segmentoDetalhe?: string }) => void;
  updateAviso: (aviso: Aviso) => void;
  deleteAviso: (id: string) => void;
  addCorrespondencia: (input: { imovelId: string; unidadeId?: string; recebedor: string; remetente: string; fotoDataUrl?: string }) => void;
  confirmarRetiradaCorrespondencia: (id: string, responsavel: string) => void;
  setManutencaoTecnico: (id: string, tecnico?: string) => void;
  setManutencaoSla: (id: string, sla: number) => void;
  setManutencaoPrioridade: (id: string, prioridade: Manutencao['prioridade']) => void;
  addManutencaoFoto: (id: string, dataUrl: string) => void;
};

const seed = (): DemoData => baseDemoData();

export const useDemoStore = create<Store>()(
  persist(
    (set, get) => ({
      persona: 'admin',
      scenarios: { highInadimplencia: false, highManutencao: false, highVacancia: false },
      data: seed(),
      contractEvents: {},
      currentInquilinoId: null,
      currentProprietarioId: null,
      hydrated: false,
      setPersona: (p) => set({ persona: p }),
      setCurrentInquilino: (id) => set({ currentInquilinoId: id }),
      setCurrentProprietario: (id) => set({ currentProprietarioId: id }),
      toggleScenario: (key) => {
        const { scenarios } = get();
        const next = { ...scenarios, [key]: !scenarios[key] } as ScenarioFlags;
        // recompute data from base + scenarios
        let nextData = seed();
        if (next.highInadimplencia) nextData = scenarioHighInadimplencia(nextData);
        if (next.highVacancia) nextData = scenarioHighVacancia(nextData);
        if (next.highManutencao) nextData = scenarioHighManutencao(nextData);
        set({ scenarios: next, data: nextData });
      },
      resetData: () => set({ scenarios: { highInadimplencia: false, highManutencao: false, highVacancia: false }, data: seed() }),
      simulate: (action) => {
        if (action === 'gerarBoletos') {
          return 'Boletos do mês gerados (simulado)';
        }
        if (action === 'enviarLembrete') {
          return 'Lembretes enviados aos inadimplentes (simulado)';
        }
        return 'Ação simulada';
      },
      addImovel: (i) => set((s) => {
        const entities = { ...s.data.entities, imoveis: [i, ...s.data.entities.imoveis] };
        const point: ImovelPoint = { id: i.id, nome: `${i.tipo.toUpperCase()} ${i.codigo}`, lat: i.geo.lat, lng: i.geo.lng, status: i.statusOcupa };
        const data = { ...s.data, entities, imoveisMapa: [point, ...s.data.imoveisMapa] };
        return { data };
      }),
      updateImovel: (i) => set((s) => {
        const imoveis = s.data.entities.imoveis.map((x) => (x.id === i.id ? i : x));
        const entities = { ...s.data.entities, imoveis };
        const imoveisMapa = s.data.imoveisMapa.map((p) => (p.id === i.id ? { ...p, nome: `${i.tipo.toUpperCase()} ${i.codigo}`, lat: i.geo.lat, lng: i.geo.lng, status: i.statusOcupa } : p));
        const data = { ...s.data, entities, imoveisMapa };
        return { data };
      }),
      deleteImovel: (id) => set((s) => {
        const entities = { ...s.data.entities, imoveis: s.data.entities.imoveis.filter((x) => x.id !== id) };
        const imoveisMapa = s.data.imoveisMapa.filter((p) => p.id !== id);
        const data = { ...s.data, entities, imoveisMapa };
        return { data };
      }),
      setContratoStatus: (id, status) => set((s) => {
        const contratos = s.data.entities.contratos.map((c) => (c.id === id ? { ...c, status } : c));
        const entities = { ...s.data.entities, contratos };
        const data = { ...s.data, entities };
        return { data };
      }),
      addContratoArquivo: (id, dataUrl) => set((s) => {
        const contratos = s.data.entities.contratos.map((c) => (c.id === id ? { ...c, arquivos: [dataUrl, ...c.arquivos] } : c));
        const entities = { ...s.data.entities, contratos };
        const data = { ...s.data, entities };
        return { data };
      }),
      addContratoEvento: (id, texto) => set((s) => {
        const current = s.contractEvents[id] ?? [];
        const next = { ...s.contractEvents, [id]: [{ data: new Date().toISOString(), texto }, ...current] };
        return { contractEvents: next };
      }),
      addContrato: (input) => {
        const id = crypto.randomUUID();
        const inicio = input.inicio ?? new Date().toISOString();
        const fimDate = input.fim ? new Date(input.fim) : new Date();
        if (!input.fim) fimDate.setFullYear(fimDate.getFullYear() + 1);
        const fim = fimDate.toISOString();
        const valorAluguel = input.valorAluguel ?? 2000;
        const valorCondominio = input.valorCondominio ?? 300;
        const status: Contrato['status'] = input.status ?? 'rascunho';
        const contrato: Contrato = {
          id,
          imovelId: input.imovelId,
          inquilinoId: input.inquilinoId,
          proprietarioId: input.proprietarioId,
          inicio,
          fim,
          valorAluguel,
          valorCondominio,
          reajuste: input.reajuste ?? 'anual',
          status,
          arquivos: [],
        };
        set((s) => {
          const contratos = [contrato, ...s.data.entities.contratos];
          const imoveis = s.data.entities.imoveis.map((i) => (i.id === input.imovelId ? { ...i, statusOcupa: status === 'vigente' ? 'ocupado' : i.statusOcupa, contratoVigenteId: status === 'vigente' ? id : i.contratoVigenteId } : i));
          const entities = { ...s.data.entities, contratos, imoveis };
          return { data: { ...s.data, entities } };
        });
        return id;
      },
      generateBoletosMes: (competencia) => {
        let created = 0;
        set((s) => {
          const existsKey = new Set(s.data.entities.boletos.map(b=>`${b.contratoId}-${b.competencia}`));
          const add: typeof s.data.entities.boletos = [];
          for (const ct of s.data.entities.contratos) {
            const key = `${ct.id}-${competencia}`;
            if (!existsKey.has(key)) {
              const venc = new Date(parseInt(competencia.slice(0,4)), parseInt(competencia.slice(5))-1, 10);
              add.push({ id: crypto.randomUUID(), contratoId: ct.id, competencia, vencimento: venc.toISOString(), valor: ct.valorAluguel + ct.valorCondominio, juros: 0, multa: 0, desconto: 0, status: 'aberto' });
              created++;
            }
          }
          const entities = { ...s.data.entities, boletos: [...s.data.entities.boletos, ...add] };
          const data = { ...s.data, entities };
          return { data };
        });
        return created;
      },
      applyPenalty: (boletoId) => set((s) => {
        const boletos = s.data.entities.boletos.map((b) => {
          if (b.id !== boletoId) return b;
          const j = Math.round(b.valor * 0.02);
          const m = Math.round(b.valor * 0.01);
          return { ...b, juros: b.juros + j, multa: b.multa + m };
        });
        const entities = { ...s.data.entities, boletos };
        return { data: { ...s.data, entities } };
      }),
      sendReminder: (_boletoId) => {
        // no-op mock
      },
      registerPayment: (boletoId, valorPago, comprovante) => set((s) => {
        const boletos = s.data.entities.boletos.map((b) => {
          if (b.id !== boletoId) return b;
          const total = b.valor + b.juros + b.multa - b.desconto;
          const novoStatus = valorPago >= total ? 'pago' : b.status;
          return { ...b, status: novoStatus, valorPago, dataPagamento: new Date().toISOString(), comprovante: comprovante ?? b.comprovante };
        });
        const entities = { ...s.data.entities, boletos };
        return { data: { ...s.data, entities } };
      }),
      liquidarRepasse: (repasseId) => set((s) => {
        const repasses: Repasse[] = s.data.entities.repasses.map((r) => (r.id === repasseId ? { ...r, status: 'pago' as const } : r));
        const entities = { ...s.data.entities, repasses };
        return { data: { ...s.data, entities } };
      }),
      addManutencao: (input) => set((s) => {
        const m: Manutencao = {
          id: crypto.randomUUID(),
          contratoId: input.contratoId,
          imovelId: input.imovelId,
          criadoPor: 'inquilino',
          descricao: input.descricao,
          fotos: input.fotos ?? [],
          prioridade: input.prioridade,
          tecnico: undefined,
          status: 'aberto',
          sla: 5,
          eventos: [{ data: new Date().toISOString(), texto: 'Chamado aberto pelo inquilino' }],
        };
        const entities = { ...s.data.entities, manutencoes: [m, ...s.data.entities.manutencoes] };
        return { data: { ...s.data, entities } };
      }),
      addManutencaoEvento: (id, texto) => set((s) => {
        const manutencoes = s.data.entities.manutencoes.map((m) => (m.id === id ? { ...m, eventos: [{ data: new Date().toISOString(), texto }, ...m.eventos] } : m));
        const entities = { ...s.data.entities, manutencoes };
        return { data: { ...s.data, entities } };
      }),
      setManutencaoStatus: (id, status) => set((s) => {
        const manutencoes = s.data.entities.manutencoes.map((m) => (m.id === id ? { ...m, status } : m));
        const entities = { ...s.data.entities, manutencoes };
        return { data: { ...s.data, entities } };
      }),
      setManutencaoTecnico: (id, tecnico) => set((s) => {
        const manutencoes = s.data.entities.manutencoes.map((m) => (m.id === id ? { ...m, tecnico } : m));
        const entities = { ...s.data.entities, manutencoes };
        return { data: { ...s.data, entities } };
      }),
      setManutencaoSla: (id, sla) => set((s) => {
        const manutencoes = s.data.entities.manutencoes.map((m) => (m.id === id ? { ...m, sla } : m));
        const entities = { ...s.data.entities, manutencoes };
        return { data: { ...s.data, entities } };
      }),
      setManutencaoPrioridade: (id, prioridade) => set((s) => {
        const manutencoes = s.data.entities.manutencoes.map((m) => (m.id === id ? { ...m, prioridade } : m));
        const entities = { ...s.data.entities, manutencoes };
        return { data: { ...s.data, entities } };
      }),
      addManutencaoFoto: (id, dataUrl) => set((s) => {
        const manutencoes = s.data.entities.manutencoes.map((m) => (m.id === id ? { ...m, fotos: [dataUrl, ...m.fotos] } : m));
        const entities = { ...s.data.entities, manutencoes };
        return { data: { ...s.data, entities } };
      }),
      confirmarAvisoLeitura: (avisoId, userId) => set((s) => {
        const avisos = s.data.entities.avisos.map((a) => (a.id === avisoId && !a.leituraConfirmadaPor.includes(userId) ? { ...a, leituraConfirmadaPor: [...a.leituraConfirmadaPor, userId] } : a));
        const entities = { ...s.data.entities, avisos };
        return { data: { ...s.data, entities } };
      }),
      addAviso: (input) => set((s) => {
        const a: Aviso = { id: crypto.randomUUID(), titulo: input.titulo, corpo: input.corpo, grupos: input.grupos, publicoAlvo: input.publicoAlvo, expiracao: input.expiracao, anexos: [], leituraConfirmadaPor: [], segmentoDetalhe: input.segmentoDetalhe };
        const entities = { ...s.data.entities, avisos: [a, ...s.data.entities.avisos] };
        return { data: { ...s.data, entities } };
      }),
      updateAviso: (aviso) => set((s) => {
        const avisos = s.data.entities.avisos.map((a) => (a.id === aviso.id ? aviso : a));
        const entities = { ...s.data.entities, avisos };
        return { data: { ...s.data, entities } };
      }),
      deleteAviso: (id) => set((s) => {
        const avisos = s.data.entities.avisos.filter((a) => a.id !== id);
        const entities = { ...s.data.entities, avisos };
        return { data: { ...s.data, entities } };
      }),
      addCorrespondencia: (input) => set((s) => {
        const c: Correspondencia = {
          id: crypto.randomUUID(),
          imovelId: input.imovelId,
          unidadeId: input.unidadeId,
          recebedor: input.recebedor,
          remetente: input.remetente,
          foto: input.fotoDataUrl,
          dataRecebimento: new Date().toISOString(),
          statusRetirada: 'pendente',
          dataRetirada: undefined,
        };
        const entities = { ...s.data.entities, correspondencias: [c, ...s.data.entities.correspondencias] };
        const im = s.data.entities.imoveis.find(i=>i.id===input.imovelId);
        const aviso: Aviso = {
          id: crypto.randomUUID(),
          titulo: `Correspondência recebida para ${input.recebedor}`,
          corpo: `Remetente: ${input.remetente}. Imóvel: ${im?.codigo ?? ''}.` ,
          grupos: ['unidade'],
          publicoAlvo: 'inquilinos',
          expiracao: undefined,
          anexos: [],
          leituraConfirmadaPor: [],
          segmentoDetalhe: im?.codigo,
        };
        const entities2 = { ...entities, avisos: [aviso, ...entities.avisos] };
        return { data: { ...s.data, entities: entities2 } };
      }),
      confirmarRetiradaCorrespondencia: (id, responsavel) => set((s) => {
        const correspondencias = s.data.entities.correspondencias.map((c) => (c.id === id ? { ...c, statusRetirada: 'retirado' as const, dataRetirada: new Date().toISOString(), recebedor: responsavel || c.recebedor } : c));
        const entities = { ...s.data.entities, correspondencias };
        return { data: { ...s.data, entities } };
      }),
    }),
    {
      name: 'imobgest-demo',
      storage: createJSONStorage(() => localforage),
      partialize: (s) => ({ persona: s.persona, scenarios: s.scenarios, data: s.data, contractEvents: s.contractEvents, currentInquilinoId: s.currentInquilinoId, currentProprietarioId: s.currentProprietarioId }),
      // hydration flag will be flipped from a client-side effect in Providers
    }
  )
);
