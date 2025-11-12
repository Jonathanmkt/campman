// src/lib/chatwoot.ts

/**
 * URL base para a API do Chatwoot
 * Usado em todas as chamadas diretas à API
 */
export const API_URL = 'https://chatwoot.virtuetech.com.br';

/**
 * Nome do header para autenticação com a API Chatwoot
 */
export const API_TOKEN_HEADER = 'api_access_token';

/**
 * Cria os headers padrão para chamadas à API Chatwoot
 * @param token Token de API bruto
 * @returns Object com headers para fetch
 */
export function getChatwootHeaders(token: string | null | undefined): Record<string, string> {
  const normalizedToken = normalizeToken(token || '');
  
  return {
    [API_TOKEN_HEADER]: normalizedToken,
    'Content-Type': 'application/json'
  };
}

/**
 * Normaliza o token de API para uso seguro em headers HTTP
 * - Remove caracteres inválidos para headers HTTP
 * - Trata codificação URI se necessário
 * - Remove espaços e quebras de linha
 *
 * @param token Token bruto obtido da query string ou outro lugar
 * @returns Token normalizado seguro para uso em headers HTTP
 */
export function normalizeToken(token: string): string {
  if (!token) return '';
  
  try {
    // Passo 1: Tentar decodificar caso esteja URI encoded
    let normalizedToken = token;
    // Tenta decodificar se estiver URI encoded
    if (token.includes('%')) {
      try {
        normalizedToken = decodeURIComponent(token);
      } catch {
        // Se falhar ao decodificar, mantém o token original
        normalizedToken = token;
      }
    }
    
    // Passo 2: Remover caracteres inválidos para headers HTTP
    // Remover quebras de linha, tabs e outros caracteres de controle
    normalizedToken = normalizedToken
      .replace(/[\r\n\t\f\v]/g, '') // Remove quebras de linha e tabs
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove outros caracteres de controle
      .trim(); // Remove espaços no início e fim
    
    return normalizedToken;
  } catch {
    // Em caso de qualquer erro, retorna string vazia para evitar erros de runtime
    return '';
  }
}
