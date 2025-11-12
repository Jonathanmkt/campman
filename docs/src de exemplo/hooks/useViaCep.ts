import { useState } from 'react';

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string; // cidade
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

interface ViaCepResult {
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
}

interface UseViaCepReturn {
  buscarCep: (cep: string) => Promise<ViaCepResult | null>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook para buscar endereço a partir do CEP usando a API ViaCEP
 * @see https://viacep.com.br
 */
export function useViaCep(): UseViaCepReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Formata o CEP removendo caracteres não numéricos
   */
  const formatarCep = (cep: string): string => {
    return cep.replace(/\D/g, '');
  };

  /**
   * Busca o endereço a partir do CEP
   * @param cep CEP a ser consultado (pode conter formatação)
   * @returns Dados do endereço ou null em caso de erro
   */
  const buscarCep = async (cep: string): Promise<ViaCepResult | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const cepFormatado = formatarCep(cep);
      
      // Valida se o CEP tem 8 dígitos
      if (cepFormatado.length !== 8) {
        setError('CEP deve conter 8 dígitos');
        return null;
      }
      
      const response = await fetch(`https://viacep.com.br/ws/${cepFormatado}/json/`);
      const data: ViaCepResponse = await response.json();
      
      // Verifica se a API retornou erro
      if (data.erro) {
        setError('CEP não encontrado');
        return null;
      }
      
      return {
        logradouro: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        uf: data.uf
      };
    } catch (err) {
      setError('Erro ao buscar CEP');
      console.error('Erro ao buscar CEP:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  return { buscarCep, loading, error };
}
