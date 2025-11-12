import { useState } from 'react';

/**
 * Hook para gerenciar o estado de linhas expandidas em tabelas
 */
export const useTableExpansion = () => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  /**
   * Alterna o estado de expansão de uma linha
   */
  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return {
    expandedRow,
    setExpandedRow,
    toggleRow,
  };
};

export default useTableExpansion;
