import { faker } from '@faker-js/faker';
// Ensure deterministic seed across SSR/CSR to avoid hydration mismatches
faker.seed(42);
// Use a fixed reference date so time-based generators are stable across SSR/CSR
// in Faker v10+
(faker as unknown as { setDefaultRefDate?: (d: Date) => void }).setDefaultRefDate?.(new Date('2025-01-01'));
import { type DemoData, type Entities, type Imovel, type Proprietario, type Inquilino, type Contrato, type Boleto, type Repasse, type Manutencao, type Correspondencia, type Aviso, type ImovelPoint, type BoletoRow, type Kpis, type InadimplenciaSerie } from './types';

const REF_NOW = new Date('2025-01-01T00:00:00.000Z');

// Use faker's seeded helper instead of Math.random to keep SSR/CSR deterministic
function randomFrom<T>(arr: T[]): T { return faker.helpers.arrayElement(arr as T[]); }

export function generateSeed(): DemoData {
  // counts within requested ranges
  const nImoveis = faker.number.int({ min: 150, max: 300 });
  const nProps = faker.number.int({ min: 60, max: 80 });
  const nContratos = faker.number.int({ min: 120, max: 200 });
  const nInquilinos = faker.number.int({ min: nContratos + 10, max: nContratos + 60 });

  const proprietarios: Proprietario[] = Array.from({ length: nProps }).map(() => ({
    id: faker.string.uuid(),
    nome: faker.person.fullName(),
    doc: faker.finance.accountNumber(),
    contato: { email: faker.internet.email(), phone: faker.phone.number() },
    banco: { banco: faker.finance.accountName(), agencia: faker.finance.accountNumber(4), conta: faker.finance.accountNumber(6) },
  }));

  const imoveis: Imovel[] = Array.from({ length: nImoveis }).map((_, i) => {
    const tipo = faker.helpers.arrayElement(['apto','casa','studio','sala','terreno'] as const);
    const cidade = faker.location.city();
    const uf = faker.location.state({ abbreviated: true });
    const lat = -23.7 + faker.number.float({ min: 0, max: 0.3, fractionDigits: 6 }); // SP area approx.
    const lng = -46.8 + faker.number.float({ min: 0, max: 0.3, fractionDigits: 6 });
    return {
      id: faker.string.uuid(),
      codigo: `IM-${1000 + i}`,
      tipo,
      endereco: faker.location.streetAddress(),
      cidade,
      uf,
      geo: { lat, lng },
      metragem: faker.number.int({ min: 28, max: 250 }),
      quartos: faker.number.int({ min: 0, max: 5 }),
      banheiros: faker.number.int({ min: 1, max: 4 }),
      vagas: faker.number.int({ min: 0, max: 3 }),
      fotos: [],
      statusOcupa: 'vago',
      proprietarioId: randomFrom(proprietarios).id,
    };
  });

  const inquilinos: Inquilino[] = Array.from({ length: nInquilinos }).map(() => ({
    id: faker.string.uuid(),
    nome: faker.person.fullName(),
    doc: faker.finance.accountNumber(),
    contato: { email: faker.internet.email(), phone: faker.phone.number() },
    preferenciaNotificacao: faker.helpers.arrayElement(['email','sms','push'] as const),
  }));

  const contratos: Contrato[] = [];
  const imoveisLivres = [...imoveis];
  for (let i=0;i<nContratos;i++) {
    const idx = faker.number.int({ min: 0, max: Math.max(0, imoveisLivres.length - 1) });
    const imovel = imoveisLivres.splice(idx,1)[0];
    if (!imovel) break;
    const inq = randomFrom(inquilinos);
    const prop = proprietarios.find(p=>p.id===imovel.proprietarioId)!;
    const inicio = faker.date.past({ years: 2 });
    const fim = faker.date.future({ years: 1, refDate: inicio });
    const status = faker.helpers.arrayElement(['vigente','vigente','vigente','pendente_assinatura','encerrado'] as const);
    const ct: Contrato = {
      id: faker.string.uuid(),
      imovelId: imovel.id,
      inquilinoId: inq.id,
      proprietarioId: prop.id,
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
      valorAluguel: faker.number.int({ min: 1200, max: 8000 }),
      valorCondominio: faker.number.int({ min: 0, max: 1200 }),
      reajuste: faker.helpers.arrayElement(['anual','igpm','ipca'] as const),
      status,
      arquivos: [],
    };
    contratos.push(ct);
    // mark imovel status
    imovel.statusOcupa = status === 'encerrado' ? 'vago' : 'ocupado';
    imovel.contratoVigenteId = status === 'vigente' ? ct.id : undefined;
  }

  // boletos: 12 meses por contrato
  const boletos: Boleto[] = [];
  const now = REF_NOW;
  contratos.forEach((ct) => {
    for (let m=11;m>=0;m--) {
      const d = new Date(now.getFullYear(), now.getMonth()-m, 5);
      const competencia = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const valor = ct.valorAluguel + ct.valorCondominio;
      const venc = new Date(d.getFullYear(), d.getMonth(), 10);
      const status = faker.helpers.arrayElement(['pago','pago','aberto','em_atraso'] as const);
      const juros = status==='em_atraso' ? Math.round(valor*0.02) : 0;
      const multa = status==='em_atraso' ? Math.round(valor*0.01) : 0;
      const desconto = 0;
      boletos.push({ id: faker.string.uuid(), contratoId: ct.id, competencia, vencimento: venc.toISOString(), valor, juros, multa, desconto, status });
    }
  });

  // repasses: somatório mensal de pagos por proprietário
  const repasses: Repasse[] = [];
  const competencias = new Set(boletos.map(b=>b.competencia));
  const compArray = Array.from(competencias);
  proprietarios.forEach((p) => {
    compArray.forEach((comp)=>{
      const contratosDoProp = contratos.filter(ct=>ct.proprietarioId===p.id);
      const valorBruto = boletos
        .filter(b=>contratosDoProp.some(ct=>ct.id===b.contratoId) && b.competencia===comp && b.status==='pago')
        .reduce((acc,b)=>acc + b.valor,0);
      const taxas = Math.round(valorBruto*0.03);
      const valorLiquido = Math.max(0, valorBruto - taxas);
      const status = valorLiquido>0 ? 'pago' : 'pendente';
      repasses.push({ id: faker.string.uuid(), proprietarioId: p.id, competencia: comp, valorBruto, taxas, valorLiquido, status });
    });
  });

  // manutencoes
  const manutencoes: Manutencao[] = Array.from({ length: 300 }).map(() => {
    const ct = randomFrom(contratos);
    const status = faker.helpers.arrayElement(['aberto','andamento','aguardando','concluido'] as const);
    return {
      id: faker.string.uuid(),
      contratoId: ct.id,
      imovelId: ct.imovelId,
      criadoPor: faker.helpers.arrayElement(['admin','inquilino'] as const),
      descricao: faker.commerce.productDescription(),
      fotos: [],
      prioridade: faker.helpers.arrayElement(['baixa','media','alta'] as const),
      tecnico: faker.person.fullName(),
      status,
      sla: faker.number.int({ min: 2, max: 10 }),
      eventos: [
        { data: faker.date.recent({ days: 30 }).toISOString(), texto: 'Chamado aberto' },
      ],
    };
  });

  // correspondencias
  const correspondencias: Correspondencia[] = Array.from({ length: 400 }).map(() => {
    const im = randomFrom(imoveis);
    const retirado = faker.datatype.boolean({ probability: 0.6 });
    return {
      id: faker.string.uuid(),
      imovelId: im.id,
      unidadeId: undefined,
      recebedor: faker.person.fullName(),
      remetente: faker.company.name(),
      foto: undefined,
      dataRecebimento: faker.date.recent({ days: 60 }).toISOString(),
      statusRetirada: retirado ? 'retirado' : 'pendente',
      dataRetirada: retirado ? faker.date.recent({ days: 30 }).toISOString() : undefined,
    };
  });

  // avisos
  const avisos: Aviso[] = Array.from({ length: 60 }).map(() => ({
    id: faker.string.uuid(),
    titulo: faker.lorem.sentence({ min: 3, max: 6 }),
    corpo: faker.lorem.paragraph(),
    grupos: [faker.helpers.arrayElement(['geral','predio','unidade'] as const)],
    publicoAlvo: faker.helpers.arrayElement(['todos','inquilinos','proprietarios'] as const),
    expiracao: faker.datatype.boolean({ probability: 0.3 }) ? faker.date.future().toISOString() : undefined,
    anexos: [],
    leituraConfirmadaPor: [],
    segmentoDetalhe: faker.datatype.boolean({ probability: 0.5 }) ? faker.string.alpha(3).toUpperCase() : undefined,
  }));

  const entities: Entities = { imoveis, unidades: [], proprietarios, inquilinos, contratos, boletos, repasses, manutencoes, correspondencias, avisos };

  // computed aggregations for dashboard
  const contratosVigentes = contratos.filter(c=>c.status==='vigente').length;
  const taxaOcupacao = imoveis.filter(i=>i.statusOcupa==='ocupado').length / imoveis.length;
  const totalEsperado = boletos.filter(b=>b.competencia===compArray[compArray.length-1]).reduce((a,b)=>a+b.valor,0);
  const totalRecebido = boletos.filter(b=>b.competencia===compArray[compArray.length-1] && b.status==='pago').reduce((a,b)=>a+b.valor,0);
  const inadimplenciaPercent = totalEsperado ? 1 - totalRecebido/totalEsperado : 0;
  const vencendo7dias = boletos.filter(b=>{
    const v = new Date(b.vencimento).getTime();
    const now = Date.now();
    const seven = 7*24*3600*1000;
    return v>now && (v-now)<=seven;
  }).length;
  const kpis: Kpis = { contratosVigentes, taxaOcupacao, inadimplenciaPercent, vencendo7dias };

  const inadimplenciaSerie: InadimplenciaSerie = compArray.slice(-10).map((comp) => {
    const esperado = boletos.filter(b=>b.competencia===comp).reduce((a,b)=>a+b.valor,0);
    const recebido = boletos.filter(b=>b.competencia===comp && b.status==='pago').reduce((a,b)=>a+b.valor,0);
    const mes = comp.split('-')[1];
    const label = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][parseInt(mes)-1];
    return { mes: label, esperado, recebido };
  });

  const imoveisMapa: ImovelPoint[] = imoveis.slice(0, 200).map(i=>({ id: i.id, nome: `${i.tipo.toUpperCase()} ${i.codigo}`, lat: i.geo.lat, lng: i.geo.lng, status: i.statusOcupa }));

  const boletosAtraso: BoletoRow[] = boletos.filter(b=>b.status==='em_atraso').slice(0, 50).map(b=>{
    const ct = contratos.find(c=>c.id===b.contratoId)!;
    const inq = inquilinos.find(i=>i.id===ct.inquilinoId)!;
    const due = new Date(b.vencimento);
    const diff = Math.max(0, Math.floor((REF_NOW.getTime()-due.getTime())/(24*3600*1000)));
    return { id: b.id, contrato: ct.id.slice(0,8).toUpperCase(), inquilino: inq.nome, competencia: b.competencia, valor: b.valor, diasAtraso: diff, status: b.status };
  });

  return { entities, kpis, inadimplenciaSerie, imoveisMapa, boletosAtraso };
}
