'use server';

import { getSession } from '@/lib/session';
import log from '@/lib/logger';

// Definir interface estendida para a sessão
interface ExtendedSessionData {
  nome_completo?: string;
  foto_url?: string | null;
  is_chatwoot_admin?: boolean;
  [key: string]: any; // Para outros campos que possam existir
}

/**
 * Server Action para obter dados públicos do usuário da Iron Session
 * Usada pelo UserContext para obter dados públicos sem depender de headers
 * Retorna apenas os dados públicos necessários: is_chatwoot_admin, nome_completo e foto_url
 */
export async function getUserPublicData() {
  const actionId = Math.random().toString(36).substring(2, 8);
  log.info(`[ServerAction:${actionId}] getUserPublicData iniciada`);
  
  try {
    // Obter sessão com tipagem estendida
    const session = await getSession() as unknown as ExtendedSessionData;
    
    if (!session) {
      log.warn(`[ServerAction:${actionId}] Sessão não encontrada`);
      return {
        success: false,
        error: 'Sessão não encontrada'
      };
    }
    
    log.info(`[ServerAction:${actionId}] Sessão obtida com sucesso`, {
      hasSession: !!session,
      sessionKeys: Object.keys(session)
    });
    
    // Dados públicos necessários - APENAS os três campos especificados
    const publicData = {
      nome_completo: session.nome_completo,
      foto_url: session.foto_url,
      is_chatwoot_admin: session.is_chatwoot_admin || false
    };
    
    // Verificar se há dados básicos
    if (session.nome_completo || session.is_chatwoot_admin !== undefined) {
      log.info(`[ServerAction:${actionId}] Retornando dados públicos necessários`, {
        campos: Object.keys(publicData)
      });
      return {
        success: true,
        data: publicData
      };
    }
    
    // Caso não tenha dados na sessão
    log.warn(`[ServerAction:${actionId}] Dados insuficientes na sessão`);
    return {
      success: false,
      error: 'Dados insuficientes na sessão'
    };
  } catch (error) {
    log.error(`[ServerAction:${actionId}] Erro ao acessar dados da sessão:`, error);
    return {
      success: false,
      error: 'Erro ao acessar a sessão'
    };
  }
}
