import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { CreateAreaData } from '../modals/CreateAreaModal';

export function useCreateArea() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createArea = async (areaData: CreateAreaData): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Preparar dados para inserção
      const insertData = {
        codigo_singaerj: areaData.codigo_singaerj,
        endereco_legado: areaData.endereco_legado,
        vagas: areaData.vagas,
        posicao: areaData.posicao || null,
        rotatividade: areaData.rotatividade || null,
        referencia: areaData.referencia || null,
        latitude: areaData.latitude || null,
        longitude: areaData.longitude || null,
        ativo: true,
        geocoding_sucesso: areaData.latitude && areaData.longitude ? true : false,
        processado_em: new Date().toISOString()
      };

      // Se temos coordenadas, vamos tentar fazer o geocoding reverso para obter mais detalhes
      if (areaData.latitude && areaData.longitude) {
        try {
          const response = await fetch(
            `/api/geocode?lat=${areaData.latitude}&lng=${areaData.longitude}&reverse=true`
          );
          
          if (response.ok) {
            const geocodeData = await response.json();
            if (geocodeData.success && geocodeData.results?.[0]) {
              const result = geocodeData.results[0];
              
              // Extrair componentes do endereço
              const addressComponents = result.address_components || [];
              
              const getComponent = (types: string[]) => {
                const component = addressComponents.find((comp: any) => 
                  comp.types.some((type: string) => types.includes(type))
                );
                return component?.long_name || null;
              };

              // Atualizar dados com informações do geocoding
              insertData.endereco_formatado = result.formatted_address;
              insertData.bairro = getComponent(['sublocality', 'neighborhood']);
              insertData.logradouro = getComponent(['route']);
              insertData.numero = getComponent(['street_number']);
              insertData.cep = getComponent(['postal_code']);
            }
          }
        } catch (geocodeError) {
          console.warn('Erro no geocoding reverso:', geocodeError);
          // Continuar mesmo se o geocoding falhar
        }
      }

      const { error: insertError } = await supabase
        .from('areas')
        .insert([insertData]);

      if (insertError) {
        throw insertError;
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createArea,
    loading,
    error
  };
}
