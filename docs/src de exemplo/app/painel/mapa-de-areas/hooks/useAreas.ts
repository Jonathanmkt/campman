import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface Area {
  id: number;
  codigo_singaerj: string;
  endereco_legado: string;
  endereco_formatado: string | null;
  bairro: string | null;
  logradouro: string | null;
  cep: string | null;
  numero: string | null;
  latitude: string | null;
  longitude: string | null;
  vagas: number | null;
  posicao: string | null;
  rotatividade: string | null;
  ativo: boolean | null;
  geocoding_sucesso: boolean | null;
}

export function useAreas() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAreas() {
      try {
        setLoading(true);
        const supabase = createClient();
        
        const { data, error } = await supabase
          .from('areas')
          .select(`
            id,
            codigo_singaerj,
            endereco_legado,
            endereco_formatado,
            bairro,
            logradouro,
            cep,
            numero,
            latitude,
            longitude,
            vagas,
            posicao,
            rotatividade,
            ativo,
            geocoding_sucesso
          `)
          .eq('ativo', true)
          .not('latitude', 'is', null)
          .not('longitude', 'is', null)
          .eq('geocoding_sucesso', true)
          .order('codigo_singaerj');

        if (error) {
          throw error;
        }

        setAreas(data || []);
      } catch (err) {
        console.error('Erro ao buscar áreas:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }

    fetchAreas();
  }, []);

  return { areas, loading, error };
}
