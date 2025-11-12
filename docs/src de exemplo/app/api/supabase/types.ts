/**
 * Tipos comuns para as APIs do Supabase
 */

/**
 * Resposta padrão da API
 * @template T Tipo dos dados retornados
 */
export interface ApiResponse<T = any> {
  /** Indica se a operação foi bem-sucedida */
  success: boolean;
  
  /** Mensagem de sucesso (opcional) */
  message?: string;
  
  /** Mensagem de erro (apenas quando success=false) */
  error?: string;
  
  /** Dados retornados pela API (apenas quando success=true) */
  data?: T;
}

/**
 * Opções de paginação para endpoints que retornam listas
 */
export interface PaginationOptions {
  /** Número da página (começa em 1) */
  page?: number;
  
  /** Quantidade de itens por página */
  pageSize?: number;
  
  /** Campo para ordenação */
  orderBy?: string;
  
  /** Direção da ordenação (asc ou desc) */
  orderDirection?: 'asc' | 'desc';
}

/**
 * Informações de paginação retornadas pela API
 */
export interface PaginationInfo {
  /** Número da página atual */
  page: number;
  
  /** Quantidade de itens por página */
  pageSize: number;
  
  /** Total de itens disponíveis */
  totalItems: number;
  
  /** Total de páginas */
  totalPages: number;
  
  /** Indica se há uma próxima página */
  hasNextPage: boolean;
  
  /** Indica se há uma página anterior */
  hasPrevPage: boolean;
}

/**
 * Resposta paginada da API
 * @template T Tipo dos itens na lista
 */
export interface PaginatedResponse<T = any> {
  /** Lista de itens */
  items: T[];
  
  /** Informações de paginação */
  pagination: PaginationInfo;
}

/**
 * Erro da API
 */
export interface ApiError {
  /** Código do erro */
  code?: string;
  
  /** Mensagem de erro */
  message: string;
  
  /** Detalhes adicionais do erro */
  details?: any;
}
