/**
 * Constantes usadas nas APIs do Supabase
 */

/**
 * Nomes dos buckets no Storage do Supabase
 */
export const BUCKET_NAMES = {
  /** Bucket para fotos de associados */
  ASSOCIADOS_FOTOS: 'associados-fotos',
  
  /** Bucket para documentos */
  DOCUMENTOS: 'documentos',
  
  /** Bucket para produtos */
  PRODUTOS: 'produtos'
};

/**
 * Tabelas do banco de dados
 */
export const TABLES = {
  /** Tabela de associados */
  ASSOCIADOS: 'associados',
  
  /** Tabela de encarregados */
  ENCARREGADOS: 'encarregados',
  
  /** Tabela de produtos */
  PRODUTOS: 'produtos',
  
  /** Tabela de usuários */
  USERS: 'users',
  
  /** Tabela de perfis */
  PROFILES: 'profiles',

  /** Tabela de relacionamento entre associados e áreas */
  ASSOCIADOS_AREAS: 'associados_areas',

  /** Tabela de áreas */
  AREAS: 'areas'
};

/**
 * Códigos de erro da API
 */
export const ERROR_CODES = {
  /** Erro de validação */
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  
  /** Recurso não encontrado */
  NOT_FOUND: 'NOT_FOUND',
  
  /** Erro de autenticação */
  UNAUTHORIZED: 'UNAUTHORIZED',
  
  /** Erro de permissão */
  FORBIDDEN: 'FORBIDDEN',
  
  /** Erro interno do servidor */
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  
  /** Erro de conflito (ex: recurso já existe) */
  CONFLICT: 'CONFLICT'
};

/**
 * Códigos HTTP
 */
export const HTTP_STATUS = {
  /** OK */
  OK: 200,
  
  /** Criado com sucesso */
  CREATED: 201,
  
  /** Requisição inválida */
  BAD_REQUEST: 400,
  
  /** Não autorizado */
  UNAUTHORIZED: 401,
  
  /** Proibido */
  FORBIDDEN: 403,
  
  /** Não encontrado */
  NOT_FOUND: 404,
  
  /** Conflito */
  CONFLICT: 409,
  
  /** Erro interno do servidor */
  INTERNAL_ERROR: 500
};
