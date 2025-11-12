// Interface principal do Encarregado
export interface Encarregado {
  // Identificação
  id: string;
  matricula: number;
  
  // Dados Pessoais
  nome_completo: string;
  cpf?: string | null;
  drt?: number | null;
  
  // Dados de Contato
  telefone?: string | null;
  
  // Dados de Acesso
  foto_url?: string | null;
  
  // Dados Administrativos
  limite_estoque?: number | null;
  
  // Metadados
  created_at: string; // formato ISO
  updated_at: string; // formato ISO
}

// Interface para criar um novo encarregado
export interface NovoEncarregado
  extends Omit<Encarregado, 'id' | 'created_at' | 'updated_at'> {
  // Campos opcionais para criação
  // (pode ser igual a Encarregado, mas sem os campos gerados automaticamente)
}

// Interface para atualização parcial de um encarregado
export interface AtualizacaoEncarregado
  extends Partial<Omit<Encarregado, 'id' | 'created_at' | 'updated_at'>> {
  // Campos opcionais para atualização
  // (todos os campos são opcionais, exceto os que não podem ser atualizados)
}

// Interface para filtros de busca
export interface FiltrosEncarregado {
  nome?: string;
  cpf?: string;
  matricula?: number;
  drt?: number;
  ativo?: boolean;
}

// Interface para resposta da API
export interface RespostaAPI<T> {
  success: boolean;
  message: string;
  data?: T;
}

// Tipos para operações da API
export type ListaEncarregados = Encarregado[];
export type EncarregadoUnico = Encarregado;

// Tipo para formulários
export type FormularioEncarregado = Omit<Encarregado, 'id' | 'created_at' | 'updated_at'>;
