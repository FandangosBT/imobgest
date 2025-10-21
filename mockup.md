# Mockup – Imobiliária Digital (Frontend com Dados Mockados)

Objetivo: entregar um protótipo hospedado na Vercel, totalmente navegável e visualmente impactante, cobrindo os módulos do PRD apenas com dados mockados (sem backend). O foco é demonstrar fluxos críticos para Admin, Inquilino e Proprietário.

## ✅ Escopo e Diretrizes

- [x] Hospedagem em `Vercel` com build estável (Next.js + TypeScript)
- [x] Apenas frontend com dados mockados e persistência local
- [x] Alto impacto visual: gráficos, mapa, tabelas avançadas, animações leves
- [x] Personas com RBAC mock: `Admin`, `Inquilino`, `Proprietário` (com switching)
- [x] “Modo Demonstração”: resets, cenários e botões “Simular …”

## 🧱 Stack e Fundações

- [x] Criar app `Next.js (App Router) + TypeScript`
- [x] `TailwindCSS` configurado com tokens de cor e tema `dark/light`
- [x] `shadcn/ui` + `Radix` + `Lucide` (design system e ícones)
- [x] Tabelas: `TanStack Table` com paginação, filtros, colunas dinâmicas
- [x] Gráficos: `Recharts` (linhas, barras, pizza, KPI sparklines)
- [x] Mapa: `MapLibre/Mapbox` com clusters e popup por imóvel
- [x] Estado: `Zustand` + persistência (`localforage`) e seed inicial
- [x] Mock de APIs: `MSW` (mirando futuro shape REST/Supabase)
- [x] Upload/preview client-side (mock) com compressão básica
- [x] Animações: `Framer Motion` discreto em cards/modais
- [x] Comandos: busca global (`Cmd/Ctrl + K`) com atalhos

## 🗃️ Modelo de Dados (mock)

- [x] Definir tipos TS e relacionamentos
  - `Imovel { id, codigo, tipo, endereco, cidade, uf, geo, metragem, quartos, banheiros, vagas, fotos[], statusOcupa, proprietarioId, contratoVigenteId }`
  - `Unidade (opcional) { id, imovelId, identificador, ... }`
  - `Proprietario { id, nome, doc, contato, banco, repasses[] }`
  - `Inquilino { id, nome, doc, contato, preferenciaNotificacao }`
  - `Contrato { id, imovelId, inquilinoId, proprietarioId, inicio, fim, valorAluguel, valorCondominio, reajuste, status, arquivos[] }`
  - `Boleto/Pagamento { id, contratoId, competencia, vencimento, valor, juros, multa, desconto, status, comprovante? }`
  - `Repasse { id, proprietarioId, competencia, valorBruto, taxas, valorLiquido, status }`
  - `Manutencao { id, contratoId|imovelId, criadoPor, descricao, fotos[], prioridade, tecnico, status, sla, eventos[] }`
  - `Correspondencia { id, imovelId|unidadeId, recebedor, remetente, foto?, dataRecebimento, statusRetirada, dataRetirada? }`
  - `Aviso { id, titulo, corpo, grupos: [geral|predio|unidade], publicoAlvo, expiracao?, anexos[], leituraConfirmadaPor[] }`
- [x] Semeadura com `@faker-js/faker`
  - 150–300 imóveis; 60–80 proprietários; 120–200 contratos; 2500+ boletos; 300+ chamados; 400+ correspondências; 60+ avisos
- [x] Persistir mocks no `IndexedDB` (localforage) + botão “Resetar dados”

## 🔐 Autenticação & RBAC (mock)

- [x] `Persona Switcher` no topo: Admin, Inquilino, Proprietário
- [x] Guardas de rota por papel (condicionar menu e ações)
- [x] Banner “Sessão de demonstração – dados fictícios”

## 🗺️ Navegação e Layout

- [x] Layout base: `Sidebar + Header + Conteúdo + Drawer/Modal`
- [x] Breadcrumbs, busca global e notificações (mock)
- [x] Atalhos de teclado (e.g., `N` novo imóvel, `/` buscar)
- [x] Componentes reutilizáveis: `Button, Input, Select, DatePicker, FileUpload, Dialog, Drawer, Badge, Tabs, Steps, Toast`

## 📊 Dashboard (Admin)

- [x] KPIs: contratos vigentes, taxa de ocupação, inadimplência, vencendo em 7 dias
- [x] Gráficos: inadimplência por mês, recebimentos vs. projeção, repasses
- [x] Mapa de imóveis (clusters) com status e popover de contrato
- [x] Tabela “Ações rápidas”: boletos em atraso, chamados urgentes, correspondências pendentes
- [x] Botões de simulação: “Gerar boletos do mês”, “Enviar lembrete” (mock)

## 🏠 Gestão de Imóveis

- [x] Tabela de imóveis com foto, endereço, proprietário, inquilino/contrato e status de ocupação
- [x] Filtros: cidade/UF, tipo, status, faixa de aluguel, disponibilidade
- [x] Detalhe do imóvel: galeria (carousel), mapa, atributos, anexos e histórico
- [x] CRUD (mock) com validações e feedback (toast)
- [x] Acesso rápido ao contrato vigente e ao inquilino

## 🧾 Contratos e Assinatura Digital (mock)

- [x] Lista de contratos: rascunho, pendente assinatura, vigente, encerrado
- [x] Gerar contrato a partir de template (merge de variáveis)
- [x] Upload de PDF de contrato (preview) + armazenamento mock
- [x] “Simular fluxo de assinatura” com etapas (assinante 1/2, carimbo de tempo)
- [x] Linha do tempo do contrato (criado → enviado → assinado → vigente)

## 💸 Financeiro (Aluguel e Condomínio)

- [x] Geração mock de boletos mensais por contrato (competências)
- [x] Painel de inadimplência com aging (0–30, 31–60, 61–90, +90)
- [x] Ações: “Enviar lembrete”, “Aplicar multa/juros” (mock)
- [x] Registro de pagamentos (total/parcial) e baixa com comprovante (mock)
- [x] Extrato de repasses ao proprietário com taxas e liquidação
- [x] Exportação CSV/PDF de boletos e extratos

## 🧑‍💻 Portal do Inquilino

- [x] Home com próximos vencimentos e status de pagamentos
- [x] Lista de boletos (gerar 2ª via, baixar PDF mock)
- [x] Contrato (visualização/preview e aditivos)
- [x] Abrir chamado de manutenção com fotos e prioridade
- [x] Acompanhar andamento do chamado (timeline) e avaliar serviço
- [x] Avisos e confirmação de leitura

## 👨‍💼 Portal do Proprietário

 - [x] Extrato de repasses por competência (filtros e exportação)
 - [x] Visão dos imóveis e contratos (status, vacância)
 - [x] Notificações importantes (ex.: contrato a vencer)

## 📣 Avisos e Comunicados

- [x] CRUD de avisos (editor rich text markdown simples)
- [x] Segmentação por grupo: geral, por prédio/unidade
- [x] Confirmação de leitura (carimbo na conta do usuário)
- [x] Destaque no feed e no header (badge)

## 📦 Controle de Correspondências

- [x] Registro por unidade com foto e remetente
- [x] Notificação de chegada (mock) ao inquilino
- [x] Confirmação de retirada com data e responsável

## 🛠️ Solicitações de Manutenção

- [x] Board Kanban por status (Aberto, Em andamento, Aguardando, Concluído)
- [x] Atribuição de técnico, SLA e prioridade
- [x] Timeline de eventos e chat/observações do chamado
- [x] Anexos (fotos) e avaliação do atendimento

## 🗺️ Mapa e Geolocalização

- [x] Mapa com clusters por região e legenda de status
- [x] Popup do imóvel com CTA para contrato/detalhe
- [x] Filtros geográficos (raio, cidade)

## 📈 Relatórios e Exportações

- [x] Relatório mensal de inadimplência (gráfico + tabela)
- [x] Relatório de repasses por proprietário
- [x] Exportações CSV/PDF (mock) em tabelas principais

## 🎛️ Experiência de Demonstração

- [x] Painel “Demo Controls”: reset de dados, persona, cenários
- [x] Cenários: “Alta inadimplência”, “Alta demanda de manutenção”, “Vacância elevada”
- [x] Tour guiado (onboarding)
- [x] Toasters e tooltips explicativos em ações-chave

## ♿ Acessibilidade e Qualidade

- [x] Navegação por teclado e `aria-*` nos componentes críticos
- [x] Contraste AA, foco visível e labels
- [x] ESLint + Prettier + tsconfig rigoroso
- [x] Testes básicos de interação com `@testing-library/react` (críticos)

## 🚀 Deploy e Operação

- [ ] Deploy em Vercel (preview e produção)
- [ ] Variáveis de ambiente mock-safe (ex.: `NEXT_PUBLIC_APP_ENV=demo`)
- [ ] Imagens otimizadas (`next/image`) e lazy loading
- [ ] Lighthouse (Performance/Access/Best Practices/SEO ≥ 90)

## 📁 Estrutura de Pastas (sugerida)

- [x] `/app` (rotas, layouts, templates)
- [x] `/components/ui` (design system shadcn)
- [x] `/components/features/*` (módulos por domínio)
- [x] `/mocks` (schemas, seeds, handlers MSW)
- [x] `/stores` (zustand + persist)
- [x] `/lib` (utils, form validators, formatters)
- [x] `/public` (imagens mock e ícones)

## 🔄 Fluxos de Demonstração (End-to-End)

- [x] Admin cadastra imóvel → cria contrato → gera boletos → envia aviso
- [x] Inquilino acessa portal → baixa boleto → abre manutenção → confirma aviso
- [x] Proprietário consulta extrato → visualiza repasse → exporta relatório
- [x] Correspondência registrada → inquilino notificado → retirada confirmada
- [x] Contrato em rascunho → simula assinatura digital → passa a vigente

## 🧩 Integrações (Mockadas)

- [x] Clicksign: endpoints simulados (criar envelope, assinar, status)
- [x] Asaas/Juno: emissão/baixa de boleto (status e webhooks fake)
- [x] OneSignal/Firebase: notificações locais simuladas no header

## 📌 Critérios de Aceite do Protótipo

- [x] Todas as rotas principais acessíveis e navegáveis (sem 404s)
- [x] Dados coerentes e relacionais (imóvel ↔ contrato ↔ inquilino ↔ proprietário)
- [x] Ações críticas simuladas com feedback (toasts, badges, timelines)
- [x] Mapa, gráficos e tabelas presentes e funcionais
- [x] Exportações (mock) e uploads (preview) operando
- [x] Modo demo com reset e troca de persona
- [x] Deploy público na Vercel (config pronta) compartilhável com leads
