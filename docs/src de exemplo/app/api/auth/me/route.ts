import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import log from '@/lib/logger';

// Interface para os dados consolidados do usuário
interface ConsolidatedUserData {
  supabase_id?: string;
  roles?: string[];
  is_chatwoot_admin?: boolean;
  nome_completo?: string;
  foto_url?: string | null;
  api_access_token?: string;
  account_id?: number;
  chatwoot_id?: number;
  pubsub_token?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Obter o cookie HTTP-Only definido pelo middleware
    const cookieStore = cookies();
    const userDataCookie = cookieStore.get('user_consolidated_data');
    
    log.info('API /auth/me: Verificando cookie user_consolidated_data', { 
      cookieExists: !!userDataCookie,
      cookieLength: userDataCookie ? userDataCookie.value.length : 0
    });

    if (!userDataCookie) {
      log.warn('API /auth/me: Cookie user_consolidated_data não encontrado');
      return NextResponse.json({ 
        error: 'Dados do usuário não encontrados' 
      }, { status: 404 });
    }

    // Decodificar o cookie e converter para objeto
    try {
      const decodedCookie = decodeURIComponent(userDataCookie.value);
      const userData: ConsolidatedUserData = JSON.parse(decodedCookie);
      
      log.info('API /auth/me: Dados do usuário obtidos com sucesso', {
        keys: Object.keys(userData),
        hasApiAccessToken: !!userData.api_access_token,
        hasAccountId: !!userData.account_id,
        isAdmin: !!userData.is_chatwoot_admin,
        userId: userData.supabase_id
      });

      // Retornar os dados do usuário
      return NextResponse.json(userData);
    } catch (err) {
      log.error('API /auth/me: Erro ao decodificar cookie:', err);
      return NextResponse.json({ 
        error: 'Erro ao processar dados do usuário' 
      }, { status: 500 });
    }
  } catch (error) {
    log.error('API /auth/me: Erro inesperado:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
