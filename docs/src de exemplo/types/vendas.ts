/**
 * Tipos para a tabela vendas
 */

/**
 * Tipo para um registro da tabela vendas
 */
export interface Venda {
  id: number;
  uuid?: string | null;
  criado_por: string;
  criado_em: string;
  primeiro_talao: string;
  ultimo_talao: string;
  quantidade: number;
  vendedor: string;
  comprador: string;
  encarregado_comprador?: string | null;
  associado_comprador?: string | null;
  encarregado_vendedor?: string | null;
}

/**
 * Tipo para inserção na tabela vendas
 */
export type VendaInsert = Omit<Venda, 'id' | 'uuid' | 'criado_em'>;

/**
 * Tipo para atualização na tabela vendas
 */
export type VendaUpdate = Partial<Omit<Venda, 'id'>>;

/**
 * Interface para representar uma venda de talões
 * @property {number} id - ID numérico sequencial da venda
 * @property {string} uuid - UUID único da venda
 * @property {string} criado_por - UUID do usuário que registrou a venda
 * @property {string} criado_em - Data e hora do registro no formato ISO
 * @property {string} primeiro_talao - UUID do primeiro talão do lote
 * @property {string} ultimo_talao - UUID do último talão do lote
 * @property {number} quantidade - Quantidade de talões no lote (deve ser > 0)
 * @property {string} vendedor - Nome do vendedor
 * @property {string} comprador - Nome do comprador
 * @property {string} [encarregado_comprador] - UUID do encarregado comprador (se aplicável)
 * @property {string} [associado_comprador] - UUID do associado comprador (se aplicável)
 * @property {string} [encarregado_vendedor] - UUID do encarregado vendedor (se aplicável)
 */
export interface IVenda {
  id: number;
  uuid: string;
  criado_por: string; // UUID do usuário
  criado_em: string; // ISO date string
  primeiro_talao: string; // UUID do talão
  ultimo_talao: string; // UUID do talão
  quantidade: number;
  vendedor: string;
  comprador: string;
  encarregado_comprador?: string | null; // UUID do encarregado
  associado_comprador?: string | null; // UUID do associado
  encarregado_vendedor?: string | null; // UUID do encarregado
}

/**
 * Tipo para criar uma nova venda
 * Omitindo campos gerados automaticamente (id, uuid, criado_em)
 */
export type NovaVenda = Omit<IVenda, 'id' | 'uuid' | 'criado_em'>;

/**
 * Valida se o objeto de venda tem um comprador válido
 * @param venda - Objeto de venda a ser validado
 * @returns boolean - Verdadeiro se a venda tem exatamente um comprador definido
 */
export function temCompradorValido(venda: Pick<IVenda, 'encarregado_comprador' | 'associado_comprador'>): boolean {
  const temEncComp = venda.encarregado_comprador ? 1 : 0;
  const temAssocComp = venda.associado_comprador ? 1 : 0;
  return (temEncComp + temAssocComp) === 1;
}

/**
 * Valida se os dados da venda são válidos
 * @param venda - Objeto de venda a ser validado
 * @returns string | null - Mensagem de erro ou null se válido
 */
export function validarVenda(venda: Partial<IVenda>): string | null {
  if (!venda.primeiro_talao) return 'Primeiro talão é obrigatório';
  if (!venda.ultimo_talao) return 'Último talão é obrigatório';
  if (!venda.quantidade || venda.quantidade <= 0) return 'Quantidade deve ser maior que zero';
  if (!venda.vendedor) return 'Nome do vendedor é obrigatório';
  if (!venda.comprador) return 'Nome do comprador é obrigatório';
  if (!temCompradorValido(venda)) {
    return 'Deve haver exatamente um comprador (encarregado ou associado)';
  }
  return null;
}

/**
 * Mapeia os tipos de venda possíveis
 */
export enum TipoVenda {
  TESOURARIA_PARA_ENCA = 'TESOURARIA_PARA_ENCA',
  TESOURARIA_PARA_ASSOC = 'TESOURARIA_PARA_ASSOC',
  ENCA_PARA_ASSOC = 'ENCA_PARA_ASSOC'
}

/**
 * Determina o tipo de venda com base nos campos preenchidos
 * @param venda - Objeto de venda
 * @returns TipoVenda | null - Tipo da venda ou null se inválido
 */
export function determinarTipoVenda(venda: Pick<IVenda, 'encarregado_comprador' | 'associado_comprador' | 'encarregado_vendedor'>): TipoVenda | null {
  if (venda.encarregado_comprador && !venda.encarregado_vendedor) {
    return TipoVenda.TESOURARIA_PARA_ENCA;
  }
  if (venda.associado_comprador && !venda.encarregado_vendedor) {
    return TipoVenda.TESOURARIA_PARA_ASSOC;
  }
  if (venda.associado_comprador && venda.encarregado_vendedor) {
    return TipoVenda.ENCA_PARA_ASSOC;
  }
  return null;
}
