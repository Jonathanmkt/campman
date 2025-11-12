import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { InsertEncarregadoAssociado } from '@/types';

const supabase = createClient();

export function useVincularAssociado() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ 
      encarregadoId, 
      associadoId 
    }: { 
      encarregadoId: string; 
      associadoId: string; 
    }) => {
      // Verifica se o relacionamento já existe
      const { data: existente } = await supabase
        .from('encarregados_associados')
        .select('id')
        .eq('encarregado_id', encarregadoId)
        .eq('associado_id', associadoId)
        .single();

      if (existente) {
        throw new Error('Este associado já está vinculado a este encarregado');
      }

      // Cria o novo relacionamento
      const novoRelacionamento: InsertEncarregadoAssociado = {
        encarregado_id: encarregadoId,
        associado_id: associadoId,
      };

      const { data, error } = await supabase
        .from('encarregados_associados')
        .insert([novoRelacionamento])
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao vincular associado: ${error.message}`);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      // Invalida as queries relacionadas para recarregar os dados
      queryClient.invalidateQueries({
        queryKey: ['guardadores-por-encarregado', variables.encarregadoId]
      });
    },
  });

  return {
    vincularAssociado: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}
