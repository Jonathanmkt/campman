import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import log from '@/lib/logger';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  formatSupabaseError,
  BUCKET_NAMES, 
  TABLES,
  HTTP_STATUS
} from '../../../index';

// POST - Upload de foto para um associado específico
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    // Verificar se a requisição é multipart/form-data
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        createErrorResponse('Formato de requisição inválido. Use multipart/form-data.'),
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    
    // Obter o formulário
    const formData = await request.formData();
    const file = formData.get('foto') as File;
    
    if (!file) {
      return NextResponse.json(
        createErrorResponse('Nenhum arquivo enviado'),
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    
    // Verificar se é uma imagem
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        createErrorResponse('O arquivo deve ser uma imagem'),
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    
    // Criar cliente Supabase com a chave de serviço (server-side)
    const supabase = await createClient();
    
    // Buscar o CPF do associado para usar no nome do arquivo
    const { data: associado, error: associadoError } = await supabase
      .from(TABLES.ASSOCIADOS)
      .select('cpf')
      .eq('id', id)
      .single();
    
    if (associadoError) {
      log.error(`API /supabase/associados/${id}/upload-foto: Associado não encontrado:`, associadoError);
      return NextResponse.json(
        createErrorResponse('Associado não encontrado'),
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }
    
    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${associado.cpf}-${Date.now()}.${fileExt}`;
    
    // Converter o arquivo para ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    // Fazer upload para o bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAMES.ASSOCIADOS_FOTOS)
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600'
      });
    
    if (uploadError) {
      log.error(`API /supabase/associados/${id}/upload-foto: Erro ao fazer upload:`, uploadError);
      return NextResponse.json(
        createErrorResponse(`Erro ao fazer upload da foto: ${formatSupabaseError(uploadError)}`),
        { status: HTTP_STATUS.INTERNAL_ERROR }
      );
    }
    
    // Obter a URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAMES.ASSOCIADOS_FOTOS)
      .getPublicUrl(fileName);
    
    // Atualizar o campo foto do associado
    const { error: updateError } = await supabase
      .from(TABLES.ASSOCIADOS)
      .update({ foto: publicUrl })
      .eq('id', id);
    
    if (updateError) {
      log.error(`API /supabase/associados/${id}/upload-foto: Erro ao atualizar associado:`, updateError);
      return NextResponse.json(
        createErrorResponse(`Erro ao atualizar foto do associado: ${formatSupabaseError(updateError)}`),
        { status: HTTP_STATUS.INTERNAL_ERROR }
      );
    }
    
    log.info(`API /supabase/associados/${id}/upload-foto: Foto atualizada com sucesso`);
    
    return NextResponse.json(
      createSuccessResponse({ foto_url: publicUrl }, 'Foto atualizada com sucesso')
    );
  } catch (error) {
    log.error('API /supabase/associados/[id]/upload-foto: Erro inesperado:', error);
    return NextResponse.json(
      createErrorResponse('Erro interno do servidor'),
      { status: HTTP_STATUS.INTERNAL_ERROR }
    );
  }
}
