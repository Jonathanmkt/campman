import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import log from '@/lib/logger';

/**
 * API para fornecer dados públicos do usuário para o cliente
 * Lê os dados do header x-user-data que o middleware adicionou
 */
export async function GET() {
  try {
    // Obter headers
    const headersList = headers();
    // @ts-expect-error - O Next.js tem problemas de tipagem com headers()
    const userDataHeader = headersList.get('x-user-data');
    
    if (!userDataHeader) {
      log.warn('[API User Data] Nenhum dado encontrado no header x-user-data');
      return NextResponse.json(
        { error: 'Dados do usuário não encontrados' },
        { status: 404 }
      );
    }
    
    // Parsear dados do usuário
    const userData = JSON.parse(userDataHeader);
    
    log.info('[API User Data] Dados obtidos com sucesso', {
      keys: Object.keys(userData),
      isAdmin: !!userData.is_chatwoot_admin
    });
    
    // Retornar dados públicos para o cliente
    return NextResponse.json(userData);
    
  } catch (error) {
    log.error('[API User Data] Erro ao processar dados do usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao processar dados do usuário' },
      { status: 500 }
    );
  }
}
