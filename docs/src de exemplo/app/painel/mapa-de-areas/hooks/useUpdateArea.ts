import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { UpdateAreaData } from '../modals/EditAreaModal';

export function useUpdateArea() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateArea = async (areaId: number, areaData: UpdateAreaData): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Preparar dados para atualização
      const updateData: any = {
        ...areaData,
        processado_em: new Date().toISOString()
      };

      // Se temos novas coordenadas, vamos fazer o geocoding reverso
      if (areaData.latitude && areaData.longitude) {
        updateData.geocoding_sucesso = true;
        
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
              updateData.endereco_formatado = result.formatted_address;
              updateData.bairro = getComponent(['sublocality', 'neighborhood']);
              updateData.logradouro = getComponent(['route']);
              updateData.numero = getComponent(['street_number']);
              updateData.cep = getComponent(['postal_code']);
            }
          }
        } catch (geocodeError) {
          console.warn('Erro no geocoding reverso:', geocodeError);
          // Continuar mesmo se o geocoding falhar
        }
      }

      const { error: updateError } = await supabase
        .from('areas')
        .update(updateData)
        .eq('id', areaId);

      if (updateError) {
        throw updateError;
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
    updateArea,
    loading,
    error
  };
}
