import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

/**
 * Hook para buscar as áreas (bairros) associadas a um associado
 */
export function useAssociadoAreas(associadoId: string) {
  return useQuery({
    queryKey: ['associado-areas', associadoId],
    queryFn: async () => {
      // Busca as áreas associadas ao associado
      const { data, error } = await supabase
        .from('associados_areas')
        .select(`
          area_id,
          areas:area_id (
            id,
            logradouro,
            bairro
          )
        `)
        .eq('associado_id', associadoId);

      if (error) {
        console.error('Erro ao buscar áreas do associado:', error);
        return [];
      }

      // Extrai os nomes dos bairros das áreas
      return data?.map((item: any) => item.areas?.bairro).filter(Boolean) || [];
    },
    enabled: !!associadoId,
  });
}

/**
 * Hook para buscar as áreas (bairros) de múltiplos associados de uma vez
 */
export function useAssociadosAreas(associadoIds: string[]) {
  return useQuery({
    queryKey: ['associados-areas-batch', associadoIds],
    queryFn: async () => {
      if (!associadoIds.length) return {};

      // Busca as áreas associadas aos associados
      const { data, error } = await supabase
        .from('associados_areas')
        .select(`
          associado_id,
          area_id,
          areas:area_id (
            id,
            logradouro,
            bairro
          )
        `)
        .in('associado_id', associadoIds);

      if (error) {
        console.error('Erro ao buscar áreas dos associados:', error);
        return {};
      }

      // Agrupa os bairros por associado_id
      const result: Record<string, string[]> = {};
      
      data?.forEach((item: any) => {
        if (!item.associado_id || !item.areas?.bairro) return;
        
        if (!result[item.associado_id]) {
          result[item.associado_id] = [];
        }
        
        if (item.areas.bairro) {
          result[item.associado_id].push(item.areas.bairro);
        }
      });

      return result;
    },
    enabled: associadoIds.length > 0,
  });
}
