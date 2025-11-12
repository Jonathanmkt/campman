import type { EnderecoData } from '@/types/associados';

/**
 * Função auxiliar para acessar os dados de endereço de forma segura
 */
export const getEnderecoData = (data: unknown): EnderecoData | null => {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return data as EnderecoData;
  }
  return null;
};
