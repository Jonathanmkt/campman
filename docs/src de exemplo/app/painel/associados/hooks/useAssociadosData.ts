import { useState, useEffect, useCallback } from 'react';
import { useAssociadosInfiniteScroll } from './useAssociadosInfiniteScroll';
import type { Associado } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';

// Define as colunas ordenáveis baseadas nas propriedades de Associado
type SortableColumn = keyof Pick<Associado, 'nome_completo' | 'matricula' | 'cpf' | 'drt'>;

export type SortOption = {
  column: SortableColumn;
  label: string;
};

export const sortOptions: SortOption[] = [
  { column: 'nome_completo', label: 'Nome' },
  { column: 'matricula', label: 'Matrícula' },
  { column: 'cpf', label: 'CPF' },
  { column: 'drt', label: 'DRT' },
];



interface UseAssociadosDataOptions {
  pageSize?: number;
  searchQuery?: string;
  situacao?: string;
  orderBy?: { column: string; ascending: boolean };
}

export function useAssociadosData(options?: UseAssociadosDataOptions) {
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearchQuery = useDebounce(searchInput, 500); // Debounce de 500ms
  const [situacaoFilter, setSituacaoFilter] = useState<string | undefined>(options?.situacao);
  const [sortBy, setSortBy] = useState<SortOption>(sortOptions[0]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Log para debug
  useEffect(() => {
    console.log('Termo de busca debounced:', debouncedSearchQuery);
  }, [debouncedSearchQuery]);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useAssociadosInfiniteScroll(['associados'], {
    initialPageSize: 100,
    searchQuery: debouncedSearchQuery,
    situacaoFilter,
    orderBy: {
      column: sortBy.column,
      ascending: sortOrder === 'asc'
    }
  });

  const allItems: Associado[] = data?.pages.flatMap(page => page.items) || [];
  
  // Filtra associados com IDs duplicados - mantendo apenas a primeira ocorrência de cada ID
  const uniqueItems = allItems
    .filter((item, index, self) => index === self.findIndex(t => t.id === item.id));
    
  // A ordenação agora é feita diretamente na query do Supabase

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    // O refetch será acionado automaticamente pelo React Query
    // devido à mudança na searchQuery que é uma dependência do queryKey
  };

  const handleSituacaoFilterChange = (value: string | undefined) => {
    setSituacaoFilter(value);
    refetch();
  };

  const handleSortChange = (option: SortOption) => {
    const isSameColumn = sortBy.column === option.column;
    const newSortOrder = isSameColumn ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc';
    
    setSortBy(option);
    setSortOrder(newSortOrder);
    
    // A refetch será acionada automaticamente pelo React Query
    // devido à mudança nas dependências do useInfiniteQuery
  };

  return {
    items: uniqueItems,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    searchQuery: searchInput, // Retorna o valor do input para manter a interface consistente
    setSearchQuery: handleSearchChange,
    situacaoFilter,
    setSituacaoFilter: handleSituacaoFilterChange,
    sortBy,
    sortOrder,
    onSortChange: handleSortChange,
    totalCount: data?.pages[0]?.totalCount || 0,
    refetch
  };
}
