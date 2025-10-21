export type Persona = 'admin' | 'inquilino' | 'proprietario';

export type ScenarioFlags = {
  highInadimplencia: boolean;
  highManutencao: boolean;
  highVacancia: boolean;
};

// Domínio principal
export type Imovel = {
  id: string;
  codigo: string;
  tipo: 'apto' | 'casa' | 'studio' | 'sala' | 'terreno';
  endereco: string;
  cidade: string;
  uf: string;
  geo: { lat: number; lng: number };
  metragem: number;
  quartos: number;
  banheiros: number;
  vagas: number;
  fotos: string[];
  statusOcupa: 'ocupado' | 'vago' | 'manutencao';
  proprietarioId: string;
  contratoVigenteId?: string;
};

export type Unidade = {
  id: string;
  imovelId: string;
  identificador: string; // ex: Bloco A, 101
};

export type Proprietario = {
  id: string;
  nome: string;
  doc: string;
  contato: { email: string; phone: string };
  banco: { banco: string; agencia: string; conta: string };
};

export type Inquilino = {
  id: string;
  nome: string;
  doc: string;
  contato: { email: string; phone: string };
  preferenciaNotificacao: 'email' | 'sms' | 'push';
};

export type Contrato = {
  id: string;
  imovelId: string;
  inquilinoId: string;
  proprietarioId: string;
  inicio: string; // ISO date
  fim: string; // ISO date
  valorAluguel: number;
  valorCondominio: number;
  reajuste: 'anual' | 'igpm' | 'ipca' | 'nenhum';
  status: 'rascunho' | 'pendente_assinatura' | 'vigente' | 'encerrado';
  arquivos: string[];
};

export type ContratoEvento = { data: string; texto: string };

export type Boleto = {
  id: string;
  contratoId: string;
  competencia: string; // YYYY-MM
  vencimento: string; // ISO date
  valor: number;
  juros: number;
  multa: number;
  desconto: number;
  status: 'em_atraso' | 'pago' | 'aberto';
  comprovante?: string;
  valorPago?: number;
  dataPagamento?: string;
};

export type Repasse = {
  id: string;
  proprietarioId: string;
  competencia: string; // YYYY-MM
  valorBruto: number;
  taxas: number;
  valorLiquido: number;
  status: 'pendente' | 'pago';
};

export type ManutencaoEvento = { data: string; texto: string };
export type Manutencao = {
  id: string;
  contratoId?: string;
  imovelId?: string;
  criadoPor: 'admin' | 'inquilino';
  descricao: string;
  fotos: string[];
  prioridade: 'baixa' | 'media' | 'alta';
  tecnico?: string;
  status: 'aberto' | 'andamento' | 'aguardando' | 'concluido';
  sla: number; // dias
  eventos: ManutencaoEvento[];
};

export type Correspondencia = {
  id: string;
  imovelId?: string;
  unidadeId?: string;
  recebedor: string;
  remetente: string;
  foto?: string;
  dataRecebimento: string;
  statusRetirada: 'pendente' | 'retirado';
  dataRetirada?: string;
};

export type Aviso = {
  id: string;
  titulo: string;
  corpo: string;
  grupos: Array<'geral' | 'predio' | 'unidade'>;
  publicoAlvo: 'todos' | 'inquilinos' | 'proprietarios';
  expiracao?: string;
  anexos: string[];
  leituraConfirmadaPor: string[]; // user ids
  segmentoDetalhe?: string; // ex.: prédio ou unidade
};

// Agregados para o dashboard
export type Kpis = {
  contratosVigentes: number;
  taxaOcupacao: number; // 0..1
  inadimplenciaPercent: number; // 0..1
  vencendo7dias: number;
};

export type InadimplenciaSerie = Array<{
  mes: string; // e.g., 'Jan'
  esperado: number;
  recebido: number;
}>;

export type ImovelPoint = { id: string; nome: string; lat: number; lng: number; status: 'ocupado' | 'vago' | 'manutencao' };

export type BoletoRow = { id: string; contrato: string; inquilino: string; competencia: string; valor: number; diasAtraso: number; status: 'em_atraso' | 'pago' | 'aberto' };

export type Entities = {
  imoveis: Imovel[];
  unidades: Unidade[];
  proprietarios: Proprietario[];
  inquilinos: Inquilino[];
  contratos: Contrato[];
  boletos: Boleto[];
  repasses: Repasse[];
  manutencoes: Manutencao[];
  correspondencias: Correspondencia[];
  avisos: Aviso[];
};

export type DemoData = {
  entities: Entities;
  kpis: Kpis;
  inadimplenciaSerie: InadimplenciaSerie;
  imoveisMapa: ImovelPoint[];
  boletosAtraso: BoletoRow[];
};
