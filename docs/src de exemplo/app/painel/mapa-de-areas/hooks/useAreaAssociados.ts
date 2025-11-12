import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface Associado {
  id: string;
  nome: string;
  matricula: number;
  foto?: string;
  sexo?: string;
}

export function useAreaAssociados(areaId: number | null) {
  const [associados, setAssociados] = useState<Associado[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!areaId) {
      setAssociados([]);
      return;
    }

    async function fetchAssociados() {
      try {
        setLoading(true);
        setError(null);
        const supabase = createClient();
        
        // Usando SQL direto para evitar problemas com a API do Supabase
        const { data, error } = await supabase.rpc('get_associados_by_area', {
          area_id_param: areaId
        });

        if (error) {
          throw error;
        }

        // Transformar os dados para o formato esperado
        const associadosData = data?.map(item => ({
          id: item.id,
          nome: item.nome_completo,
          matricula: item.matricula,
          foto: item.foto,
          sexo: item.sexo
        })) || [];

        setAssociados(associadosData);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Erro ao buscar associados da área:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setAssociados([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAssociados();
  }, [areaId]);

  return { associados, loading, error };
}
