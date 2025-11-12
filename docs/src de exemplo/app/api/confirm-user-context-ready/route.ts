import { NextRequest, NextResponse } from 'next/server';
import { getSession, saveSessionData } from '@/lib/session';
import logger from '@/lib/logger';

/**
 * API para confirmar que o UserContext recebeu os dados da sessão
 * Esta API é chamada pelo UserContext após receber dados da Server Action
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ready } = body;
    
    if (ready !== true) {
      return NextResponse.json(
        { error: 'Parâmetro ready deve ser true' },
        { status: 400 }
      );
    }
    
    // Obter sessão atual
    const session = await getSession();
    
    // Marcar na sessão que o UserContext está pronto
    await saveSessionData({
      ...session,
      userContextReady: true,
      userContextReadyTimestamp: new Date().toISOString()
    });
    
    logger.info('[API] UserContext confirmou recebimento de dados', {
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('[API] Erro ao processar confirmação do UserContext', { error });
    
    return NextResponse.json(
      { error: 'Erro ao processar confirmação' },
      { status: 500 }
    );
  }
}
