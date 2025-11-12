import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';

const supabase = createClient();

// Tipo para os dados básicos de associados na busca
type AssociadoBusca = {
  id: string;
  matricula: number;
  nome_completo: string;
  cpf: string;
  foto: string | null;
};

export function useAssociadoSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: associados = [], isLoading, error } = useQuery<AssociadoBusca[]>({
    queryKey: ['associados-search', debouncedSearchTerm],
    queryFn: async (): Promise<AssociadoBusca[]> => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 3) return [];
      
      let query = supabase
        .from('associados')
        .select('id, matricula, nome_completo, cpf, foto')
        .limit(10);

      // Busca por matrícula ou nome
      if (/^\d+$/.test(debouncedSearchTerm)) {
        // Se for apenas números, busca por matrícula
        query = query.eq('matricula', parseInt(debouncedSearchTerm));
      } else {
        // Caso contrário, busca por nome
        query = query.ilike('nome_completo', `%${debouncedSearchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Erro ao buscar associados: ${error.message}`);
      }

      return data || [];
    },
    enabled: debouncedSearchTerm.length >= 3,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    searchTerm,
    setSearchTerm,
    associados,
    isLoading,
    error,
  };
}
