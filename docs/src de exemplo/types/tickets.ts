/**
 * Tipos para a tabela tickets
 */

/**
 * Tipo para um registro da tabela tickets
 */
export interface Ticket {
  id: string;
  id_sequencial: number;
  serie: number;
  numero_ticket: number;
  ticket_identifier?: string | null;
  talao_id?: string | null;
  associado_id?: string | null;
  data_compra?: string | null;
  data_venda?: string | null;
  duracao_horas?: number | null;
  area_id?: string | null;
  sessao_id?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Tipo para inserção na tabela tickets
 */
export type TicketInsert = Omit<Ticket, 'id' | 'id_sequencial' | 'created_at' | 'updated_at'>;

/**
 * Tipo para atualização na tabela tickets
 */
export type TicketUpdate = Partial<Omit<Ticket, 'id' | 'id_sequencial'>>;

/**
 * Interface para representar um ticket de estacionamento
 * @property {string} id - UUID único do ticket
 * @property {number} id_sequencial - Número sequencial único
 * @property {number} serie - Série do talão gerador
 * @property {number} numero_ticket - Número individual do ticket
 * @property {string} ticket_identifier - Identificador no formato "serie/numero_ticket"
 * @property {string} talao_id - UUID do talão de origem
 * @property {string} [associado_id] - UUID do associado que possui o ticket
 * @property {string} [data_compra] - Data/hora em que o ticket saiu do sindicato
 * @property {string} [data_venda] - Data/hora em que foi vendido ao cidadão
 * @property {number} [duracao_horas] - Quantidade de horas que este ticket oferece
 * @property {string} [area_id] - UUID da área onde foi vendido
 * @property {string} [sessao_id] - UUID da sessão de estacionamento
 * @property {'disponivel' | 'vendido' | 'usado'} status - Status atual do ticket
 * @property {string} created_at - Data de criação do registro
 * @property {string} updated_at - Data da última atualização
 */
export interface ITicket {
  id: string;
  id_sequencial: number;
  serie: number;
  numero_ticket: number;
  ticket_identifier: string;
  talao_id: string;
  associado_id?: string | null;
  data_compra?: string | null;
  data_venda?: string | null;
  duracao_horas?: number | null;
  area_id?: string | null;
  sessao_id?: string | null;
  status: 'disponivel' | 'vendido' | 'usado';
  created_at: string;
  updated_at: string;
}

/**
 * Tipo para criar um novo ticket
 * Omitindo campos gerados automaticamente
 */
export type NovoTicket = Omit<ITicket, 
  'id' | 
  'id_sequencial' | 
  'ticket_identifier' | 
  'created_at' | 
  'updated_at'
>;

/**
 * Valida se um objeto de ticket é válido
 * @param ticket - Objeto de ticket a ser validado
 * @returns string | null - Mensagem de erro ou null se válido
 */
export function validarTicket(ticket: Partial<ITicket>): string | null {
  if (!ticket.serie || ticket.serie <= 0) return 'Série inválida';
  if (!ticket.numero_ticket || ticket.numero_ticket <= 0) return 'Número do ticket inválido';
  if (!ticket.talao_id) return 'Talão de origem é obrigatório';
  
  const statusValidos = ['disponivel', 'vendido', 'usado'];
  if (ticket.status && !statusValidos.includes(ticket.status)) {
    return `Status inválido. Use: ${statusValidos.join(', ')}`;
  }
  
  // Se tem data de venda, valida campos obrigatórios para venda
  if (ticket.data_venda) {
    if (!ticket.associado_id) return 'Associado é obrigatório para tickets vendidos';
    if (!ticket.duracao_horas) return 'Duração é obrigatória para tickets vendidos';
    if (!ticket.area_id) return 'Área é obrigatória para tickets vendidos';
  }
  
  return null;
}

/**
 * Gera o identificador do ticket no formato "série/numero_ticket"
 * @param serie - Série do talão
 * @param numeroTicket - Número do ticket
 * @returns string - Identificador formatado
 */
export function gerarIdentificadorTicket(serie: number, numeroTicket: number): string {
  return `${serie}/${numeroTicket.toString().padStart(6, '0')}`;
}

/**
 * Calcula o horário de expiração do ticket
 * @param dataVenda - Data/hora da venda
 * @param duracaoHoras - Duração em horas
 * @returns string - Data/hora de expiração em formato ISO
 */
export function calcularExpiracao(dataVenda: string, duracaoHoras: number): string {
  const dataVendaObj = new Date(dataVenda);
  const expiracao = new Date(dataVendaObj.getTime() + duracaoHoras * 60 * 60 * 1000);
  return expiracao.toISOString();
}
