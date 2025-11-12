import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { AssociadoPorEncarregado } from '@/types';
import type { Associado } from '@/types/associados';

const supabase = createClient();

// Tipo que define os campos que queremos buscar da tabela de associados
type CamposAssociado = Pick<
  Associado,
  | 'id'
  | 'matricula'
  | 'nome_completo'
  | 'cpf'
  | 'data_nascimento'
  | 'telefone'
  | 'email'
  | 'rg_data'
  | 'data_drt'
  | 'data_expedicao'
  | 'data_registro'
  | 'foto'
>;

// Função auxiliar para extrair dados do RG de forma segura
function extrairDadosRg(rgData: unknown): { numero?: string; orgao_emissor?: string } {
  if (!rgData || typeof rgData !== 'object') return {};
  
  const rg = rgData as Record<string, unknown>;
  return {
    numero: typeof rg.numero === 'string' ? rg.numero : undefined,
    orgao_emissor: typeof rg.orgao_emissor === 'string' ? rg.orgao_emissor : undefined
  };
}

/**
 * Obtém os campos para a consulta SQL baseado nas chaves do tipo CamposAssociado
 */
function obterCamposConsulta(): string {
  // Criamos um objeto temporário do tipo CamposAssociado para extrair as chaves
  const campos: Record<keyof CamposAssociado, true> = {
    id: true,
    matricula: true,
    nome_completo: true,
    cpf: true,
    data_nascimento: true,
    telefone: true,
    email: true,
    rg_data: true,
    data_drt: true,
    data_expedicao: true,
    data_registro: true,
    foto: true
  };

  // Retorna os campos como uma string separada por vírgulas para a consulta SQL
  return Object.keys(campos).join(',');
}

export function useGuardadoresPorEncarregado(encarregadoId?: string) {
  return useQuery<AssociadoPorEncarregado[]>({
    queryKey: ['guardadores-por-encarregado', encarregadoId],
    queryFn: async (): Promise<AssociadoPorEncarregado[]> => {
      if (!encarregadoId) return [];
      
      // Primeiro, buscamos os IDs dos associados relacionados ao encarregado
      const { data: relacoes, error: errorRelacoes } = await supabase
        .from('encarregados_associados')
        .select('associado_id')
        .eq('encarregado_id', encarregadoId);

      if (errorRelacoes) {
        throw new Error(`Erro ao buscar relações: ${errorRelacoes.message}`);
      }

      if (!relacoes || relacoes.length === 0) return [];

      // Extraímos os IDs dos associados
      const associadosIds = relacoes.map(r => r.associado_id);

      // Buscamos os dados completos dos associados usando os campos tipados
      const { data: associados, error: errorAssociados } = await supabase
        .from('associados')
        .select(obterCamposConsulta())
        .in('id', associadosIds)
        .order('nome_completo', { ascending: true });

      if (errorAssociados) {
        throw new Error(`Erro ao buscar dados dos associados: ${errorAssociados.message}`);
      }

      if (!associados) return [];

      // Mapeamos os resultados para o formato esperado
      return (associados as unknown as Array<Omit<Associado, 'updated_at' | 'created_at'>>).map((associado) => {
        // Extrai os dados do RG de forma segura
        const rgData = associado.rg_data;
        const { numero: rgNumero, orgao_emissor: rgOrgaoEmissor } = extrairDadosRg(rgData);
        
        // Cria o objeto com os dados do associado
        const associadoResult: AssociadoPorEncarregado = {
          id: associado.id,
          matricula: associado.matricula,
          nome_completo: associado.nome_completo,
          cpf: associado.cpf,
          data_nascimento: associado.data_nascimento,
          telefone: associado.telefone,
          email: associado.email,
          rg_data: rgData,
          rg_numero: rgNumero,
          rg_orgao_emissor: rgOrgaoEmissor,
          data_drt: associado.data_drt || null,
          data_expedicao: associado.data_expedicao || null,
          data_registro: associado.data_registro || null,
          foto: associado.foto || null
        };
        
        return associadoResult;
      });
    },
    enabled: !!encarregadoId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false
  });
}
