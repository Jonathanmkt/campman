import type { Encarregado } from './encarregados';
import type { Associado, JsonValue } from './associados';

/**
 * Tipo base para o relacionamento entre encarregados e associados
 */
export interface EncarregadoAssociado {
  /** ID único do relacionamento */
  id: string;
  
  /** ID do encarregado */
  encarregado_id: string;
  
  /** ID do associado/guardador */
  associado_id: string;
  
  /** Data de criação do registro */
  created_at: string; // Date em formato ISO
  
  /** Data da última atualização */
  updated_at: string; // Date em formato ISO
}

/**
 * Tipo para criar um novo relacionamento entre encarregado e associado
 */
export type InsertEncarregadoAssociado = Omit<EncarregadoAssociado, 'id' | 'created_at' | 'updated_at'>;

/**
 * Tipo para atualizar um relacionamento existente
 * Apenas campos atualizáveis devem ser incluídos aqui
 */
export type UpdateEncarregadoAssociado = Partial<
  Omit<EncarregadoAssociado, 'id' | 'encarregado_id' | 'associado_id' | 'created_at' | 'updated_at'>
> & {
  _dummy?: never; // Campo fictício para evitar tipos vazios
};

/**
 * Tipo para o resultado de consultas que incluem os objetos relacionados
 */
export interface EncarregadoAssociadoComRelacionamentos extends EncarregadoAssociado {
  encarregado?: Pick<Encarregado, 'id' | 'nome_completo' | 'matricula' | 'foto_url'>;
  associado?: Pick<Associado, 'id' | 'nome_completo' | 'matricula' | 'cpf'>;
}

/**
 * Tipo para o resultado de consultas que incluem apenas os dados do associado
 * (usado na listagem de associados por encarregado)
 */
export type AssociadoPorEncarregado = {
  id: string;
  matricula: number;
  nome_completo: string;
  cpf: string;
  data_nascimento: string | null;
  telefone: string | null;
  email: string | null;
  rg_data: JsonValue;
  rg_numero?: string;
  rg_orgao_emissor?: string;
  data_drt?: string | null;
  data_expedicao?: string | null;
  data_registro?: string | null;
  foto?: string | null;
};
