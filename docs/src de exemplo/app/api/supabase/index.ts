// Este arquivo serve como ponto de entrada para documentação e exportações comuns
// relacionadas às APIs do Supabase

// Exporta todos os tipos
export * from './types';

// Exporta funções utilitárias
export * from './utils';

// Exporta constantes
export * from './constants';

// Utilitários para respostas padronizadas
export const createSuccessResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  success: true,
  data,
  message
});

export const createErrorResponse = (error: string): ApiResponse => ({
  success: false,
  error
});

// Constantes
export const BUCKET_NAMES = {
  ASSOCIADOS_FOTOS: 'associados-fotos',
  DOCUMENTOS: 'documentos',
  PRODUTOS: 'produtos'
};
