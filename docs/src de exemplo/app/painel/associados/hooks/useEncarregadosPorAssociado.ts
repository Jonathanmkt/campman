import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface EncarregadoPorAssociado {
  id: string;
  matricula: string;
  nome_completo: string;
  drt: string;
  foto_url?: string;
}

/**
 * Hook para buscar encarregados relacionados a um associado específico
 */
export function useEncarregadosPorAssociado(associadoId?: string) {
  return useQuery<EncarregadoPorAssociado[]>({
    queryKey: ['encarregados-por-associado', associadoId],
    queryFn: async (): Promise<EncarregadoPorAssociado[]> => {
      if (!associadoId) return [];
      
      // Busca os IDs dos encarregados relacionados ao associado
      const { data: relacoes, error: errorRelacoes } = await supabase
        .from('encarregados_associados')
        .select('encarregado_id')
        .eq('associado_id', associadoId);

      if (errorRelacoes) {
        throw new Error(`Erro ao buscar relações: ${errorRelacoes.message}`);
      }

      if (!relacoes || relacoes.length === 0) return [];

      // Extrai os IDs dos encarregados
      const encarregadosIds = relacoes.map(r => r.encarregado_id);

      // Busca os dados completos dos encarregados
      const { data: encarregados, error: errorEncarregados } = await supabase
        .from('encarregados')
        .select('id, matricula, nome_completo, drt, foto_url')
        .in('id', encarregadosIds)
        .order('nome_completo', { ascending: true });

      if (errorEncarregados) {
        throw new Error(`Erro ao buscar dados dos encarregados: ${errorEncarregados.message}`);
      }

      return encarregados || [];
    },
    enabled: !!associadoId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false
  });
}
