import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Encarregado } from '@/types';

const supabaseClient = createClient();

export function useEncarregadosData() {
  return useQuery<Encarregado[], Error>({
    queryKey: ['encarregados', 'lista'],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from('encarregados')
        .select('*')
        .order('nome_completo', { ascending: true });

      if (error) {
        throw new Error(`Erro ao buscar encarregados: ${error.message}`);
      }

      // Retorna os dados como estão, pois o tipo já garante os campos obrigatórios
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
