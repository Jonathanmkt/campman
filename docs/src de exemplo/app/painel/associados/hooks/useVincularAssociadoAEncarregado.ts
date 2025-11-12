import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

interface VincularEncarregadoParams {
  associadoId: string;
  encarregadoId: string;
}

/**
 * Hook para vincular associado a encarregado
 * Permite múltiplos encarregados por associado
 */
export function useVincularAssociadoAEncarregado() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ associadoId, encarregadoId }: VincularEncarregadoParams) => {
      console.log('👨‍💼 Iniciando vinculação de encarregado:', { associadoId, encarregadoId });

      // Verifica se o relacionamento já existe
      console.log('🔍 Verificando se relacionamento já existe...');
      const { data: existente, error: errorCheck } = await supabase
        .from('encarregados_associados')
        .select('id')
        .eq('associado_id', associadoId)
        .eq('encarregado_id', encarregadoId)
        .maybeSingle();

      if (errorCheck) {
        console.error('❌ Erro ao verificar relacionamento existente:', errorCheck);
        throw new Error(`Erro ao verificar relacionamento: ${errorCheck.message}`);
      }

      if (existente) {
        console.log('⚠️ Relacionamento já existe:', existente);
        throw new Error('Este associado já está vinculado a este encarregado');
      }

      console.log('✅ Relacionamento não existe, criando novo...');
      
      // Cria o novo relacionamento
      const novoRelacionamento = {
        associado_id: associadoId,
        encarregado_id: encarregadoId,
      };
      
      console.log('📝 Dados para inserção:', novoRelacionamento);

      const { data, error } = await supabase
        .from('encarregados_associados')
        .insert([novoRelacionamento])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao inserir relacionamento:', error);
        console.error('📋 Detalhes do erro:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Erro ao vincular associado ao encarregado: ${error.message}`);
      }

      console.log('✅ Relacionamento criado com sucesso:', data);
      console.log('📊 Retorno completo da API de inserção:', { data, error, status: 'success' });
      return data;
    },
    onSuccess: (data, variables) => {
      console.log('🎉 Vinculação de encarregado concluída com sucesso!');
      console.log('📋 Dados finais da vinculação:', { data, variables });
      console.log('🔄 Invalidando queries relacionadas...');
      // Invalida queries relacionadas
      queryClient.invalidateQueries({
        queryKey: ['guardadores-por-encarregado', variables.encarregadoId]
      });
      queryClient.invalidateQueries({
        queryKey: ['associados-por-encarregado']
      });
      console.log('✅ Queries invalidadas com sucesso!');
    },
    onError: (error) => {
      console.error('💥 Erro na vinculação de encarregado:', error);
    }
  });

  return {
    vincularEncarregado: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}
