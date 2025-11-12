/**
 * Tipos para a tabela taloes
 */

/**
 * Tipo para um registro da tabela taloes
 */
export interface Talao {
  id: string;
  serie: number;
  ticket_inicial: number;
  ticket_final: number;
  identificador: string;
  ordem: number;
  em_posse_de: string;
  encarregado_id?: string | null;
  associado_uuid?: string | null;
  lancamento?: string | null;
  data_ultima_atualizacao: string;
}

/**
 * Tipo para inserção na tabela taloes
 */
export type TalaoInsert = Omit<Talao, 'id' | 'data_ultima_atualizacao'>;

/**
 * Tipo para atualização na tabela taloes
 */
export type TalaoUpdate = Partial<Omit<Talao, 'id'>>;

/**
 * Interface para representar um talão de estacionamento
 * @property {string} id - UUID único do talão
 * @property {number} serie - Número da série (cada 1 milhão de tickets)
 * @property {number} ticket_inicial - Número do primeiro ticket do talão
 * @property {number} ticket_final - Número do último ticket do talão
 * @property {string} identificador - Identificador no formato "série/ticket_inicial" (ex: "150/957001")
 * @property {number} ordem - Posição do talão na série, calculada por ((ticket_inicial - 1) / 50) + 1
 * @property {'tesouraria' | 'encarregado' | 'associado'} em_posse_de - Localização atual do talão
 * @property {string} [encarregado_id] - UUID do encarregado atual (se aplicável)
 * @property {string} [associado_uuid] - UUID do associado atual (se aplicável)
 * @property {string} [lancamento] - UUID da operação de lançamento do talão
 * @property {string} data_ultima_atualizacao - Data da última atualização do registro
 */
export interface ITalao {
  id: string;
  serie: number;
  ticket_inicial: number;
  ticket_final: number;
  identificador: string;
  ordem: number;
  em_posse_de: 'tesouraria' | 'encarregado' | 'associado';
  encarregado_id?: string | null;
  associado_uuid?: string | null;
  lancamento?: string | null;
  data_ultima_atualizacao: string;
}

/**
 * Tipo para criar um novo talão
 * Omitindo campos gerados automaticamente
 */
export type NovoTalao = Omit<ITalao, 'id' | 'data_ultima_atualizacao'>;

/**
 * Valida se um objeto de talão é válido
 * @param talao - Objeto de talão a ser validado
 * @returns string | null - Mensagem de erro ou null se válido
 */
export function validarTalao(talao: Partial<ITalao>): string | null {
  if (!talao.serie || talao.serie <= 0) return 'Série inválida';
  if (!talao.ticket_inicial || talao.ticket_inicial <= 0) return 'Ticket inicial inválido';
  if (!talao.ticket_final || talao.ticket_final <= talao.ticket_inicial) 
    return 'Ticket final deve ser maior que o inicial';
  if (!talao.identificador) return 'Identificador é obrigatório';
  if (!talao.ordem || talao.ordem <= 0) return 'Ordem inválida';
  if (!talao.em_posse_de) return 'Localização atual é obrigatória';
  
  const localizacoesValidas = ['tesouraria', 'encarregado', 'associado'];
  if (!localizacoesValidas.includes(talao.em_posse_de)) {
    return `Localização inválida. Use: ${localizacoesValidas.join(', ')}`;
  }
  
  return null;
}

/**
 * Gera o identificador do talão no formato "série/ticket_inicial"
 */
export function gerarIdentificador(serie: number, ticketInicial: number): string {
  return `${serie}/${ticketInicial.toString().padStart(6, '0')}`;
}

/**
 * Calcula a ordem do talão com base no ticket inicial
 */
export function calcularOrdem(ticketInicial: number): number {
  return Math.floor((ticketInicial - 1) / 50) + 1;
}
