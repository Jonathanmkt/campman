import { useState, useCallback, useMemo, useEffect } from 'react';
import EncarregadosTable from './EncarregadosTable';
import { EncarregadoDetail } from './EncarregadoDetail';
import { Encarregado } from '@/types';
import { useEncarregadosData } from '../hooks/useEncarregadosData';

export function EncarregadosContent() {
  const [sortOrder] = useState<'asc' | 'desc'>('asc');
  const [encarregadoSelecionado, setEncargadoSelecionado] = useState<Encarregado | null>(null);
  
  // Busca os dados dos encarregados do Supabase
  const { data: encarregados = [], isLoading, error } = useEncarregadosData();
  
  // Seleciona o primeiro encarregado quando os dados são carregados
  useEffect(() => {
    if (encarregados.length > 0 && !encarregadoSelecionado) {
      setEncargadoSelecionado(encarregados[0]);
    }
  }, [encarregados, encarregadoSelecionado]);
  
  // Ordena os encarregados
  const encarregadosOrdenados = useMemo(() => {
    return [...encarregados].sort((a, b) => {
      return sortOrder === 'asc' 
        ? a.nome_completo.localeCompare(b.nome_completo)
        : b.nome_completo.localeCompare(a.nome_completo);
    });
  }, [encarregados, sortOrder]);

  const handleEncarregadoClick = useCallback((encarregado: Encarregado) => {
    setEncargadoSelecionado(encarregado);
  }, []);
  
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-red-500">
        Erro ao carregar encarregados: {error.message}
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col overflow-hidden'>
      <div className='h-full flex flex-col bg-gray-200 rounded-lg shadow flex-1' style={{ minHeight: 0 }}>


        {/* Área principal com tabela e detalhes */}
        <div className='flex-1 flex p-4 gap-4 overflow-hidden'>
          <div className="w-1/4 min-w-[200px] flex flex-col">
            <div className="flex-1 overflow-y-auto border-r border-gray-200 pr-4">
              <EncarregadosTable 
                encarregados={encarregadosOrdenados} 
                isLoading={isLoading}
                onEncarregadoClick={handleEncarregadoClick}
                encarregadoSelecionadoId={encarregadoSelecionado?.id}
              />
            </div>
          </div>
          <div className="w-3/4 flex-1 flex flex-col">
            <EncarregadoDetail encarregado={encarregadoSelecionado} />
          </div>
        </div>
      </div>
    </div>
  );
}
