'use client';

import React from 'react';
import { Associado } from '@/types';
import AssociadosTableRow from './AssociadosTableRow';

interface AssociadosTableProps {
  associados: Associado[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  hasNextPage: boolean | undefined;
}

const AssociadosTable: React.FC<AssociadosTableProps> = ({ 
  associados, 
  isLoading, 
  isFetchingNextPage,
  fetchNextPage, 
  hasNextPage 
}) => {
  // Função para lidar com o scroll infinito
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const scrollPosition = scrollTop + clientHeight;
    const triggerPosition = scrollHeight - (25 * 60); // Considerando ~60px por item
    
    if (scrollPosition >= triggerPosition && hasNextPage && !isLoading && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Exibir spinner de carregamento enquanto carrega os dados iniciais
  if (isLoading && !associados.length) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Cabeçalho da tabela */}
      <div className="grid grid-cols-12 gap-3 px-4 py-3 text-sm font-medium text-muted-foreground">
        <div className="col-span-1"></div> {/* Espaço para chevron */}
        <div className="col-span-1"></div> {/* Espaço para avatar */}
        <div className="col-span-2">Nome Completo</div>
        <div className="col-span-2">Matrícula</div>
        <div className="col-span-2">DRT</div>
        <div className="col-span-2">Bairro</div>
        <div className="col-span-1">Mensalidades</div>
        <div className="col-span-1 text-center">Ações</div>
      </div>

      {/* Container das rows com scroll */}
      <div 
        className="flex-1 overflow-y-auto space-y-2"
        onScroll={handleScroll}
        style={{ minHeight: 0 }}
      >
        {associados.map((associado: Associado) => (
          <AssociadosTableRow 
            key={associado.id} 
            associado={associado}
          />
        ))}

        {/* Indicador de carregamento quando estiver carregando mais items */}
        <div className="py-4 text-center">
          {isFetchingNextPage && (
            <span>Carregando mais itens...</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssociadosTable;
