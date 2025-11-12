import { useInfiniteQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Associado } from '@/types';
import { TABLES } from '@/app/api/supabase';

const supabaseClient = createClient();

interface PageData {
  items: Associado[];
  nextPage: number | undefined;
  totalCount: number;
}

interface UseInfiniteScrollOptions {
  initialPageSize?: number;
  nextPageSize?: number;
  searchQuery?: string;
  situacaoFilter?: string;
  orderBy?: { column: string; ascending: boolean };
}

export function useAssociadosInfiniteScroll(
  queryKey: string[],
  options: UseInfiniteScrollOptions = {}
) {
  const {
    initialPageSize = 50,
    nextPageSize = 25,
    searchQuery = '',
    situacaoFilter = 'todos',
    orderBy = { column: 'nome_completo', ascending: true }
  } = options;
  
  // Determina o tamanho da página com base no número da página
  const getPageSize = (pageIndex: number) => 
    pageIndex === 0 ? initialPageSize : nextPageSize;
    
  // Calcula o deslocamento baseado no índice da página
  const getOffset = (pageIndex: number) => {
    if (pageIndex === 0) return 0;
    // Para a primeira página, carregamos 50 itens
    // Nas páginas seguintes, carregamos 25 itens a partir do 25º item da janela atual
    return initialPageSize + (pageIndex - 1) * nextPageSize;
  };

  return useInfiniteQuery<PageData, Error>({
    queryKey: [...queryKey, searchQuery, situacaoFilter, orderBy.column, orderBy.ascending],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const pageIndex = pageParam as number;
      const currentPageSize = getPageSize(pageIndex);
      const startRow = getOffset(pageIndex);
      const endRow = startRow + currentPageSize - 1;

      let query = supabaseClient
        .from(TABLES.ASSOCIADOS)
        .select('*', { count: 'exact' })
        .range(startRow, endRow)
        .order(orderBy.column, { ascending: orderBy.ascending });

      // Aplicar filtro de pesquisa se houver
      if (searchQuery && searchQuery.trim() !== '') {
        const term = searchQuery.trim();
        
        // Construir filtros para campos de texto
        const textFilters = [
          `nome_completo.ilike.%${term}%`,
          `cpf.ilike.%${term}%`,
          `email.ilike.%${term}%`
        ];
        
        // Para campos numéricos, verificar se o termo é numérico
        const numericTerm = parseInt(term, 10);
        if (!isNaN(numericTerm)) {
          textFilters.push(`matricula.eq.${numericTerm}`);
          textFilters.push(`drt.eq.${numericTerm}`);
        }
        
        const filterExpression = textFilters.join(',');
        
        // Log para debug
        console.log('Termo de busca:', term);
        console.log('Expressão de filtro:', filterExpression);
        
        query = query.or(filterExpression);
      }

      // Aplicar filtro por situação
      if (situacaoFilter !== 'todos') {
        if (situacaoFilter === 'inadimplente') {
          query = query.eq('inadimplente', true);
        } else if (['ativo', 'inativo', 'pendente'].includes(situacaoFilter)) {
          query = query.eq('situacao', situacaoFilter);
        }
      }

      const { data, error, count } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return {
        items: data || [],
        nextPage: data && data.length === currentPageSize ? pageIndex + 1 : undefined,
        totalCount: count || 0
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 30, // 30 segundos
    gcTime: 1000 * 60 * 5, // 5 minutos
  });
}
