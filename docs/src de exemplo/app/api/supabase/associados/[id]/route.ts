import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import log from '@/lib/logger';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  formatSupabaseError,
  TABLES,
  HTTP_STATUS
} from '../../index';

// GET - Obter um associado específico
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from(TABLES.ASSOCIADOS)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      log.error(`API /supabase/associados/${id}: Erro ao buscar associado:`, error);
      return NextResponse.json(
        createErrorResponse(`Associado não encontrado: ${formatSupabaseError(error)}`),
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }
    
    return NextResponse.json(createSuccessResponse(data));
  } catch (error) {
    log.error('API /supabase/associados/[id]: Erro inesperado:', error);
    return NextResponse.json(
      createErrorResponse('Erro interno do servidor'),
      { status: HTTP_STATUS.INTERNAL_ERROR }
    );
  }
}

// PUT - Atualizar um associado
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const associadoData = await request.json();
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from(TABLES.ASSOCIADOS)
      .update(associadoData)
      .eq('id', id)
      .select('id')
      .single();
    
    if (error) {
      log.error(`API /supabase/associados/${id}: Erro ao atualizar associado:`, error);
      return NextResponse.json(
        createErrorResponse(`Erro ao atualizar associado: ${formatSupabaseError(error)}`),
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    
    log.info(`API /supabase/associados/${id}: Associado atualizado com sucesso`);
    
    return NextResponse.json(
      createSuccessResponse({ id: data.id }, 'Associado atualizado com sucesso')
    );
  } catch (error) {
    log.error('API /supabase/associados/[id]: Erro inesperado:', error);
    return NextResponse.json(
      createErrorResponse('Erro interno do servidor'),
      { status: HTTP_STATUS.INTERNAL_ERROR }
    );
  }
}

// DELETE - Excluir um associado
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    
    const { error } = await supabase
      .from(TABLES.ASSOCIADOS)
      .delete()
      .eq('id', id);
    
    if (error) {
      log.error(`API /supabase/associados/${id}: Erro ao excluir associado:`, error);
      return NextResponse.json(
        createErrorResponse(`Erro ao excluir associado: ${formatSupabaseError(error)}`),
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    
    log.info(`API /supabase/associados/${id}: Associado excluído com sucesso`);
    
    return NextResponse.json(
      createSuccessResponse(null, 'Associado excluído com sucesso')
    );
  } catch (error) {
    log.error('API /supabase/associados/[id]: Erro inesperado:', error);
    return NextResponse.json(
      createErrorResponse('Erro interno do servidor'),
      { status: HTTP_STATUS.INTERNAL_ERROR }
    );
  }
}
