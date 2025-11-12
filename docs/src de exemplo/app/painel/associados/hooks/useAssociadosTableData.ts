import { useState } from 'react';
import { useAssociadosInfiniteScroll } from './useAssociadosInfiniteScroll';
import type { Associado } from '@/types';

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

export function useAssociadosTableData() {
  const [searchQuery, setSearchQuery] = useState('');
  const [situacaoFilter, setSituacaoFilter] = useState('todos');
  const [sortBy, setSortBy] = useState<SortOption>(sortOptions[0]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useAssociadosInfiniteScroll(['associados'], {
    initialPageSize: 50,
    nextPageSize: 25,
    searchQuery,
    situacaoFilter,
    orderBy: { 
      column: sortBy.column, 
      ascending: sortOrder === 'asc' 
    }
  });

  const allItems: Associado[] = data?.pages.flatMap(page => page.items) || [];
  
  // Filtra associados com IDs duplicados - mantendo apenas a primeira ocorrência de cada ID
  const uniqueItems = allItems
    .filter((item, index, self) => index === self.findIndex(t => t.id === item.id))
    .sort((a, b) => a.nome_completo.localeCompare(b.nome_completo));

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    refetch();
  };

  const handleFilterChange = (value: string) => {
    setSituacaoFilter(value);
    refetch();
  };

  const handleSortChange = (option: SortOption) => {
    const isSameColumn = sortBy.column === option.column;
    const newSortOrder = isSameColumn && sortOrder === 'asc' ? 'desc' : 'asc';
    
    setSortBy(option);
    setSortOrder(newSortOrder);
    
    // A refetch será acionada automaticamente pelo React Query
    // devido à mudança nas dependências do useAssociadosInfiniteScroll
  };

  return {
    items: uniqueItems,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    searchQuery,
    setSearchQuery: handleSearchChange,
    situacaoFilter,
    setSituacaoFilter: handleFilterChange,
    sortBy,
    sortOrder,
    onSortChange: handleSortChange,
    totalCount: data?.pages[0]?.totalCount || 0,
    refetch
  };
}
