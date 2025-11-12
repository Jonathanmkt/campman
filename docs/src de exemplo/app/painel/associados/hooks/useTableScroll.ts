import { useCallback } from 'react';

interface UseTableScrollProps {
  fetchNextPage: () => void;
  hasNextPage: boolean | undefined;
  isLoading: boolean;
  isFetchingNextPage: boolean;
}

/**
 * Hook para gerenciar a lógica de scroll infinito em tabelas
 */
export const useTableScroll = ({
  fetchNextPage,
  hasNextPage,
  isLoading,
  isFetchingNextPage,
}: UseTableScrollProps) => {
  
  /**
   * Gerencia o evento de scroll e carrega mais itens quando necessário
   */
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // Calcula a posição de rolagem relativa (0 a 1)
    const scrollPosition = (scrollTop + clientHeight) / scrollHeight;
    
    // Dispara o carregamento quando o usuário chegar a 80% da lista
    if (scrollPosition > 0.8 && hasNextPage && !isLoading && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isLoading, isFetchingNextPage]);

  return {
    handleScroll,
  };
};

export default useTableScroll;
