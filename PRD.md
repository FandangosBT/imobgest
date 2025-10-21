**PRD - Sistema de Gestão de Imobiliária Digital**

---

## 📆 Data: 20/10/2025

## 👨‍💼 Responsável: Product Owner

## 📖 Versão: 1.0

---

## 🌐 Visão Geral

Um sistema completo de gestão para imobiliárias que operam com aluguel de imóveis. A plataforma terá funcionalidades para controle de contratos, cobranças, comunicação com inquilinos e proprietários, gerenciamento de manutenções, correspondências e integração com serviços externos.

---

## ✨ Objetivos do Produto

* Digitalizar e automatizar processos internos da imobiliária
* Facilitar a comunicação entre inquilino, proprietário e administração
* Reduzir inadimplência através de cobranças inteligentes
* Garantir segurança e validade legal de contratos eletrônicos

---

## 🎯 Público-Alvo

* Pequenas e médias imobiliárias
* Administradoras de condomínio com foco em aluguel
* Propriedades com mais de um imóvel locado

---

## 🔄 Fluxos de Usuário

### 1. **Admin da Imobiliária**

* Cadastra imóveis e contratos
* Emite cobranças
* Acompanha inadimplência
* Responde a chamados de manutenção
* Publica avisos e atualizações

### 2. **Inquilino**

* Visualiza contratos
* Baixa boletos
* Registra manutenções
* Recebe notificacões
* Confirma retirada de correspondências

### 3. **Proprietário**

* Acompanha extratos e repasses
* Visualiza contratos vigentes
* Recebe avisos

---

## 📊 Módulos Funcionais

### 1. **Gestão de Imóveis**

* Cadastro completo com fotos, metragem, localização, tipo e status
* Relacionamento com contrato vigente e inquilino

### 2. **Contratos e Assinatura Digital**

* Upload ou geração automatizada de contrato
* Fluxo de assinatura (integração com Clicksign ou similar)
* Validação e armazenamento seguro

### 3. **Financeiro (Aluguel e Condomínio)**

* Geração de boletos automáticos
* Integração com intermediários de pagamento (Asaas, Juno, etc.)
* Painel de inadimplência e cobranças automáticas
* Extrato de repasses

### 4. **Portal do Inquilino**

* Tela com boletos, pagamentos e vencimentos
* Registro de manutenções com foto
* Visualização de contrato
* Comunicados e avisos

### 5. **Portal do Proprietário**

* Extrato de valores recebidos
* Visualização de contratos e status do imóvel
* Notificações importantes

### 6. **Feed de Avisos e Comunicados**

* Avisos por grupo (geral, por prédio ou por unidade)
* Confirmar leitura

### 7. **Controle de Correspondências**

* Registro de correspondência recebida
* Notificação para retirada
* Registro de confirmação

### 8. **Solicitações de Manutenção**

* Abertura de chamados com fotos e descrição
* Atribuição a técnicos
* Notificação de andamento ao inquilino

---

## ⚙️ Requisitos Técnicos

* **Frontend Web:** React
* **App Mobile:** React Native (Inquilino/Proprietário)
* **Backend:** Node.js ou Python (FastAPI)
* **Banco de Dados:** PostgreSQL
* **Armazenamento de Arquivos:** Amazon S3
* **Autenticação:** JWT com RBAC
* **Integrações:**

  * Clicksign (assinatura digital)
  * Asaas / Juno (emissão de boletos)
  * Firebase / OneSignal (notificações)

---

## 📊 Métricas de Sucesso

* Redução de inadimplência
* Aumento na taxa de contratos assinados digitalmente
* Redução do tempo de resposta a chamados
* Engajamento nos comunicados

---

## 🔗 Roadmap Inicial

| Sprint   | Entregas                                |
| -------- | --------------------------------------- |
| Sprint 1 | Cadastro de imóveis e contratos         |
| Sprint 2 | Financeiro (boletos e extratos)         |
| Sprint 3 | Assinatura Digital e Notificações       |
| Sprint 4 | Portais do Inquilino e Proprietário     |
| Sprint 5 | Módulo de Manutenção e Correspondências |

---

## 🎨 Wireframes (próxima etapa)

* Serão criados para cada tela principal com foco em usabilidade e responsividade.
