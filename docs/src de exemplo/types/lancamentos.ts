/**
 * Tipo para a tabela lançamentos
 */
export interface Lancamento {
  /** ID único do lançamento (UUID) */
  id: string;
  /** ID sequencial do lançamento */
  lancamento_id: number;
  /** Número da série */
  serie: number;
  /** Número do ticket inicial */
  ticket_inicial: number;
  /** Número do ticket final */
  ticket_final: number;
  /** Quantidade de tickets (pode ser nulo) */
  quantidade: number | null;
  /**
   * UUID do usuário que criou o lançamento
   * Referencia a tabela auth.users do Supabase
   */
  criado_por: string;
  /** Data de criação no formato ISO string */
  criado_em: string;
  /** Data da última atualização no formato ISO string */
  atualizado_em: string;
}

/**
 * Tipo para inserção de um lançamento
 */
export type InsertLancamento = Omit<Lancamento, 'id' | 'lancamento_id' | 'criado_em' | 'atualizado_em'> & {
  quantidade?: number; // Campo opcional no banco
};

export type UpdateLancamento = Partial<Omit<Lancamento, 'id' | 'lancamento_id' | 'criado_por' | 'criado_em' | 'atualizado_em'>> & {
  // Adicione campos específicos de atualização, se necessário
  serie?: number;
  ticket_inicial?: number;
  ticket_final?: number;
};
