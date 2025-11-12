import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

interface VincularAreaParams {
  associadoId: string;
  areaId: string;
}

export function useVincularAssociadoAArea() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ associadoId, areaId }: VincularAreaParams) => {
      console.log('🔗 Iniciando vinculação:', { associadoId, areaId });
      
      // Converte para números se necessário (algumas tabelas podem usar int)
      const associadoIdFinal = associadoId;
      const areaIdFinal = parseInt(areaId, 10);
      
      console.log('📋 IDs processados:', { associadoIdFinal, areaIdFinal });

      // Verifica se o relacionamento já existe
      console.log('🔍 Verificando se relacionamento já existe...');
      const { data: existente, error: errorCheck } = await supabase
        .from('associados_areas')
        .select('id')
        .eq('associado_id', associadoIdFinal)
        .eq('area_id', areaIdFinal)
        .maybeSingle();

      if (errorCheck) {
        console.error('❌ Erro ao verificar relacionamento existente:', errorCheck);
        throw new Error(`Erro ao verificar relacionamento: ${errorCheck.message}`);
      }

      if (existente) {
        console.log('⚠️ Relacionamento já existe:', existente);
        throw new Error('Este associado já está vinculado a esta área');
      }

      console.log('✅ Relacionamento não existe, criando novo...');
      
      // Cria o novo relacionamento
      const novoRelacionamento = {
        associado_id: associadoIdFinal,
        area_id: areaIdFinal,
      };
      
      console.log('📝 Dados para inserção:', novoRelacionamento);

      const { data, error } = await supabase
        .from('associados_areas')
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
        throw new Error(`Erro ao vincular associado à área: ${error.message}`);
      }

      console.log('✅ Relacionamento criado com sucesso:', data);
      console.log('📊 Retorno completo da API de inserção:', { data, error, status: 'success' });
      return data;
    },
    onSuccess: (data, variables) => {
      console.log('🎉 Vinculação de área concluída com sucesso!');
      console.log('📋 Dados finais da vinculação:', { data, variables });
      console.log('🔄 Invalidando queries relacionadas...');
      // Invalida queries relacionadas
      queryClient.invalidateQueries({
        queryKey: ['associado-areas', variables.associadoId]
      });
      queryClient.invalidateQueries({
        queryKey: ['associados-areas-batch']
      });
      console.log('✅ Queries invalidadas com sucesso!');
    },
    onError: (error) => {
      console.error('💥 Erro na vinculação:', error);
    }
  });

  return {
    vincularArea: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}
