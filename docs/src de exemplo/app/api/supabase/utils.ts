import { NextRequest } from 'next/server';
import { PaginationOptions } from './types';

/**
 * Extrai parâmetros de paginação da URL da requisição
 * @param request Requisição Next.js
 * @returns Opções de paginação
 */
export function extractPaginationParams(request: NextRequest): PaginationOptions {
  const searchParams = request.nextUrl.searchParams;
  
  return {
    page: parseInt(searchParams.get('page') || '1'),
    pageSize: parseInt(searchParams.get('pageSize') || '50'),
    orderBy: searchParams.get('orderBy') || undefined,
    orderDirection: (searchParams.get('orderDirection') || 'asc') as 'asc' | 'desc'
  };
}

/**
 * Calcula o range para paginação no Supabase
 * @param page Número da página (começa em 1)
 * @param pageSize Tamanho da página
 * @returns Objeto com from e to para usar no método range() do Supabase
 */
export function calculateRange(page: number, pageSize: number) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
}

/**
 * Formata um erro do Supabase para log
 * @param error Erro do Supabase
 * @returns String formatada para log
 */
export function formatSupabaseError(error: any): string {
  if (!error) return 'Erro desconhecido';
  
  if (typeof error === 'string') return error;
  
  if (error.message) return error.message;
  
  return JSON.stringify(error);
}

/**
 * Converte erros do Supabase para mensagens amigáveis em português
 * @param error Erro do Supabase
 * @returns String com mensagem amigável
 */
export function formatUserFriendlyError(error: any): string {
  if (!error) return 'Erro desconhecido';
  
  const errorCode = error.code;
  const errorMessage = error.message || '';
  
  // Erros de violação de unicidade (UNIQUE constraint)
  if (errorCode === '23505') {
    // Verificar qual campo teve violação
    if (errorMessage.includes('associados_cpf_unique')) {
      return 'Este CPF já está cadastrado no sistema. Verifique se o associado já existe.';
    }
    if (errorMessage.includes('associados_drt_unique')) {
      return 'Este número de DRT já está cadastrado no sistema. Verifique se o associado já existe.';
    }
    if (errorMessage.includes('associados_matricula_key')) {
      return 'Esta matrícula já está em uso. Por favor, use uma matrícula diferente.';
    }
    if (errorMessage.includes('associados_rg_numero_unique')) {
      return 'Este número de RG já está cadastrado no sistema. Verifique se o associado já existe.';
    }
    return 'Já existe um registro com essas informações. Verifique os dados informados.';
  }
  
  // Erro de violação de NOT NULL
  if (errorCode === '23502') {
    return 'Alguns campos obrigatórios não foram preenchidos. Verifique os dados informados.';
  }
  
  // Erro de violação de CHECK constraint
  if (errorCode === '23514') {
    return 'Alguns dados não estão no formato correto. Verifique os campos preenchidos.';
  }
  
  // Erro de tipo de dados inválido
  if (errorCode === '22P02') {
    return 'Formato de dados inválido. Verifique se os campos numéricos e datas estão corretos.';
  }
  
  // Erro de permissão
  if (errorCode === '42501') {
    return 'Você não tem permissão para realizar esta operação.';
  }
  
  // Erro de conexão com banco
  if (errorCode === '08000' || errorCode === '08006') {
    return 'Erro de conexão com o banco de dados. Tente novamente em alguns instantes.';
  }
  
  // Para erros não mapeados, retornar uma mensagem genérica
  return 'Erro ao processar os dados. Verifique as informações preenchidas e tente novamente.';
}

/**
 * Verifica se uma string é um UUID válido
 * @param id String a ser verificada
 * @returns true se for um UUID válido
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}
