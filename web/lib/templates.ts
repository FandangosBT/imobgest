import { type Contrato, type Imovel, type Inquilino, type Proprietario } from './types';

export function generateContractTemplate(params: { contrato: Contrato; imovel: Imovel; inquilino: Inquilino; proprietario: Proprietario }): string {
  const { contrato, imovel, inquilino, proprietario } = params;
  const total = contrato.valorAluguel + contrato.valorCondominio;
  return `CONTRATO DE LOCAÇÃO RESIDENCIAL\n\n`
    + `Locador: ${proprietario.nome} (doc: ${proprietario.doc})\n`
    + `Locatário: ${inquilino.nome} (doc: ${inquilino.doc})\n`
    + `Imóvel: ${imovel.codigo} – ${imovel.endereco}, ${imovel.cidade}/${imovel.uf}\n`
    + `Metragem: ${imovel.metragem} m² | Quartos: ${imovel.quartos} | Vagas: ${imovel.vagas}\n\n`
    + `Vigência: ${new Date(contrato.inicio).toLocaleDateString('pt-BR')} a ${new Date(contrato.fim).toLocaleDateString('pt-BR')}\n`
    + `Valor Aluguel: R$ ${contrato.valorAluguel.toLocaleString('pt-BR')}\n`
    + `Condomínio: R$ ${contrato.valorCondominio.toLocaleString('pt-BR')}\n`
    + `Total Mensal: R$ ${total.toLocaleString('pt-BR')}\n`
    + `Reajuste: ${contrato.reajuste.toUpperCase()}\n\n`
    + `Cláusulas Principais:\n`
    + `1. O locatário se compromete a cumprir o regulamento interno do condomínio.\n`
    + `2. O pagamento deverá ocorrer até o dia 10 de cada mês.\n`
    + `3. Em caso de atraso, incidirão multa de 2% e juros de 1% ao mês.\n\n`
    + `Assinaturas:\n`
    + `_______________________________ (Locador)\n`
    + `_______________________________ (Locatário)\n`;
}

