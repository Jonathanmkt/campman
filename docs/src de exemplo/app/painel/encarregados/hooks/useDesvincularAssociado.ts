import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export function useDesvincularAssociado() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ 
      encarregadoId, 
      associadoId 
    }: { 
      encarregadoId: string; 
      associadoId: string; 
    }) => {
      // Remove o relacionamento específico
      const { error } = await supabase
        .from('encarregados_associados')
        .delete()
        .eq('encarregado_id', encarregadoId)
        .eq('associado_id', associadoId);

      if (error) {
        throw new Error(`Erro ao desvincular associado: ${error.message}`);
      }

      return { success: true };
    },
    onSuccess: (_, variables) => {
      // Invalida as queries relacionadas para recarregar os dados
      queryClient.invalidateQueries({
        queryKey: ['guardadores-por-encarregado', variables.encarregadoId]
      });
    },
  });

  return {
    desvincularAssociado: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}
