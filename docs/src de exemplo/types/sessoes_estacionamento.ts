/**
 * Tipos para a tabela sessoes_estacionamento
 */

/**
 * Tipo para um registro da tabela sessoes_estacionamento
 */
export interface SessaoEstacionamento {
  id: string;
  id_sequencial: number;
  operador_id?: string | null;
  veiculo_id?: string | null;
  area_id?: string | null;
  inicio?: string | null;
  expira_em?: string | null;
  status?: string | null;
  total_tickets_usados?: number | null;
  tempo_total_comprado?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Tipo para inserção na tabela sessoes_estacionamento
 */
export type SessaoEstacionamentoInsert = Omit<SessaoEstacionamento, 'id' | 'id_sequencial' | 'created_at' | 'updated_at'>;

/**
 * Tipo para atualização na tabela sessoes_estacionamento
 */
export type SessaoEstacionamentoUpdate = Partial<Omit<SessaoEstacionamento, 'id' | 'id_sequencial'>>;

/**
 * Interface para representar uma sessão de estacionamento
 * @property {string} id - UUID único da sessão
 * @property {number} id_sequencial - Número sequencial único
 * @property {string} operador_id - UUID do associado responsável pela sessão
 * @property {string} veiculo_id - UUID do veículo
 * @property {string} area_id - UUID da área de estacionamento
 * @property {string} inicio - Data/hora do início da sessão
 * @property {string} expira_em - Data/hora de expiração da sessão
 * @property {'ativa' | 'encerrada' | 'expirada'} status - Status da sessão
 * @property {number} total_tickets_usados - Número de tickets utilizados na sessão
 * @property {string} tempo_total_comprado - Duração total adquirida (formato ISO de intervalo)
 * @property {string} created_at - Data de criação
 * @property {string} updated_at - Data da última atualização
 */
export interface ISessaoEstacionamento {
  id: string;
  id_sequencial: number;
  operador_id: string;
  veiculo_id: string;
  area_id: string;
  inicio: string;
  expira_em: string;
  status: 'ativa' | 'encerrada' | 'expirada';
  total_tickets_usados: number;
  tempo_total_comprado: string;
  created_at: string;
  updated_at: string;
}

/**
 * Tipo para criar uma nova sessão
 * Omitindo campos gerados automaticamente
 */
export type NovaSessao = Omit<ISessaoEstacionamento, 
  'id' | 
  'id_sequencial' | 
  'created_at' | 
  'updated_at' | 
  'total_tickets_usados' | 
  'tempo_total_comprado'
>;

/**
 * Valida se um objeto de sessão é válido
 * @param sessao - Objeto de sessão a ser validado
 * @returns string | null - Mensagem de erro ou null se válido
 */
export function validarSessao(sessao: Partial<ISessaoEstacionamento>): string | null {
  if (!sessao.operador_id) return 'Operador é obrigatório';
  if (!sessao.veiculo_id) return 'Veículo é obrigatório';
  if (!sessao.area_id) return 'Área é obrigatória';
  if (!sessao.inicio) return 'Data/hora de início é obrigatória';
  if (!sessao.expira_em) return 'Data/hora de expiração é obrigatória';
  
  const statusValidos = ['ativa', 'encerrada', 'expirada'];
  if (sessao.status && !statusValidos.includes(sessao.status)) {
    return `Status inválido. Use: ${statusValidos.join(', ')}`;
  }
  
  return null;
}

/**
 * Calcula o tempo restante da sessão
 * @param expira_em - Data/hora de expiração
 * @returns number - Minutos restantes (negativo se expirado)
 */
export function calcularTempoRestante(expira_em: string): number {
  const agora = new Date();
  const expiracao = new Date(expira_em);
  const diferencaMs = expiracao.getTime() - agora.getTime();
  
  return Math.floor(diferencaMs / 60000); // Converte para minutos
}

/**
 * Verifica se uma sessão está expirada
 * @param expira_em - Data/hora de expiração
 * @returns boolean - Verdadeiro se expirada
 */
export function verificarExpirada(expira_em: string): boolean {
  return calcularTempoRestante(expira_em) < 0;
}
