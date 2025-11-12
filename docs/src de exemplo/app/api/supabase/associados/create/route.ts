import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import log from '@/lib/logger';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  formatSupabaseError,
  formatUserFriendlyError,
  TABLES,
  HTTP_STATUS
} from '../../index';

export async function POST(request: NextRequest) {
  try {
    // Obter os dados do corpo da requisição
    const associadoData = await request.json();
    
    // Criar cliente Supabase com a chave de serviço (server-side)
    const supabase = await createClient();
    
    // Inserir o associado no banco de dados
    const { data, error } = await supabase
      .from(TABLES.ASSOCIADOS)
      .insert(associadoData)
      .select('id')
      .single();
    
    if (error) {
      log.error('API /supabase/associados/create: Erro ao inserir associado:', error);
      const userFriendlyMessage = formatUserFriendlyError(error);
      return NextResponse.json(
        createErrorResponse(userFriendlyMessage),
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    
    log.info('API /supabase/associados/create: Associado cadastrado com sucesso', { 
      associadoId: data.id 
    });
    
    return NextResponse.json(
      createSuccessResponse({ id: data.id }, 'Associado cadastrado com sucesso')
    );
  } catch (error) {
    log.error('API /supabase/associados/create: Erro inesperado:', error);
    return NextResponse.json(
      createErrorResponse('Erro interno do servidor'),
      { status: HTTP_STATUS.INTERNAL_ERROR }
    );
  }
}
