import React from 'react';

interface ApiResponseDisplayProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any; // Mantemos 'any' pois o formato exato pode variar
  loading?: boolean;
}

// Função para remover propriedades obsoletas dos objetos do Google Maps
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitizeGoogleMapsData(obj: any): unknown {
  if (!obj) return obj;
  
  // Se for um array, sanitize cada item
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeGoogleMapsData(item));
  }
  
  // Se for um objeto, sanitize suas propriedades
  if (typeof obj === 'object') {
    const result = { ...obj };
    
    // Remover propriedades obsoletas
    if ('utc_offset' in result) {
      delete result.utc_offset;
    }
    
    // Processar recursivamente todas as propriedades
    Object.keys(result).forEach(key => {
      if (typeof result[key] === 'object' && result[key] !== null) {
        result[key] = sanitizeGoogleMapsData(result[key]);
      }
    });
    
    return result;
  }
  
  return obj;
}

export function ApiResponseDisplay({ data, loading = false }: ApiResponseDisplayProps) {
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="ml-2 text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <p className="text-gray-500 text-center">
          Busque um endereço no campo acima para ver o retorno da API.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4">
      <h2 className="text-lg font-semibold mb-4">Resposta da API de Busca</h2>
      <pre className="bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-auto text-sm">
        {JSON.stringify(sanitizeGoogleMapsData(data), null, 2)}
      </pre>
    </div>
  );
}
