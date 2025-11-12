import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

/**
 * Hook para buscar a próxima matrícula disponível (maior matrícula + 1)
 */
export function useNextMatricula() {
  return useQuery({
    queryKey: ['next-matricula'],
    queryFn: async () => {
      // Busca a maior matrícula na tabela de associados
      const { data, error } = await supabase
        .from('associados')
        .select('matricula')
        .order('matricula', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Erro ao buscar maior matrícula:', error);
        return '1001'; // Valor padrão caso ocorra erro
      }

      // Se não houver registros, começa com 1001
      if (!data || data.length === 0) {
        return '1001';
      }

      // Pega a maior matrícula e adiciona 1
      const maiorMatricula = parseInt(data[0].matricula, 10);
      return (maiorMatricula + 1).toString();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
