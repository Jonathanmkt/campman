import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import log from '@/lib/logger';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  extractPaginationParams, 
  calculateRange,
  formatSupabaseError,
  PaginatedResponse,
  TABLES,
  HTTP_STATUS
} from '../index';

// GET - Listar associados com paginação e filtros
export async function GET(request: NextRequest) {
  try {
    // Extrair parâmetros de paginação
    const { page, pageSize, orderBy = 'nome_completo', orderDirection } = extractPaginationParams(request);
    
    // Parâmetros de filtro
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const situacao = searchParams.get('situacao') || undefined;
    
    // Calcular o range para paginação
    const { from, to } = calculateRange(page, pageSize);
    
    // Criar cliente Supabase com a chave de serviço (server-side)
    const supabase = await createClient();
    
    // Construir a query
    let query = supabase
      .from(TABLES.ASSOCIADOS)
      .select('*', { count: 'exact' })
      .range(from, to)
      .order(orderBy, { ascending: orderDirection === 'asc' });
    
    // Aplicar filtro de pesquisa se houver
    if (search && search.trim() !== '') {
      const term = search.trim();
      query = query.or(
        `nome_completo.ilike.%${term}%,` +
        `cpf.ilike.%${term}%,` +
        `matricula::text.ilike.%${term}%,` +
        `email.ilike.%${term}%,` +
        `drt::text.ilike.%${term}%`
      );
    }
    
    // Aplicar filtro por situação
    if (situacao && situacao !== 'todos') {
      if (situacao === 'inadimplente') {
        query = query.eq('inadimplente', true);
      } else if (['ativo', 'inativo', 'pendente'].includes(situacao)) {
        query = query.eq('situacao', situacao);
      }
    }
    
    // Executar a query
    const { data, error, count } = await query;
    
    if (error) {
      const errorMessage = formatSupabaseError(error);
      log.error('API /supabase/associados: Erro ao listar associados:', error);
      return NextResponse.json(
        createErrorResponse(`Erro ao listar associados: ${errorMessage}`),
        { status: 400 }
      );
    }
    
    // Calcular informações de paginação
    const totalPages = Math.ceil((count || 0) / pageSize);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    // Criar resposta paginada tipada
    const paginatedResponse: PaginatedResponse = {
      items: data || [],
      pagination: {
        page,
        pageSize,
        totalItems: count || 0,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    };
    
    return NextResponse.json(
      createSuccessResponse(paginatedResponse)
    );
  } catch (error) {
    log.error('API /supabase/associados: Erro inesperado:', error);
    return NextResponse.json(
      createErrorResponse('Erro interno do servidor'),
      { status: HTTP_STATUS.INTERNAL_ERROR }
    );
  }
}
