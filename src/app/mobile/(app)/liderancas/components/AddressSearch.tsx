'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Search, MapPin, X, Loader2 } from 'lucide-react';

export interface AddressData {
  endereco_formatado: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  latitude: number;
  longitude: number;
}

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface SearchResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address_components?: AddressComponent[];
}

interface GoogleGeocodeResult {
  place_id?: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components?: AddressComponent[];
}

interface AddressSearchProps {
  onAddressSelect: (address: AddressData) => void;
  placeholder?: string;
  cityFilter?: string | null;
  uf?: string;
  disabled?: boolean;
}

export function AddressSearch({
  onAddressSelect,
  placeholder = "Digite o endereço da liderança...",
  cityFilter,
  uf = 'DF',
  disabled = false,
}: AddressSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const getComponentValue = (
    components: AddressComponent[] | undefined,
    types: string[]
  ): string => {
    if (!components) return '';
    const component = components.find((comp) =>
      comp.types.some((type) => types.includes(type))
    );
    return component?.long_name || '';
  };

  const getComponentShortValue = (
    components: AddressComponent[] | undefined,
    types: string[]
  ): string => {
    if (!components) return '';
    const component = components.find((comp) =>
      comp.types.some((type) => types.includes(type))
    );
    return component?.short_name || '';
  };

  const searchAddresses = useCallback(async (searchQuery: string) => {
    if (disabled) return;
    if (!cityFilter?.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const context = `${searchQuery}, ${cityFilter.trim()}, ${uf}, Brasil`;
      const params = new URLSearchParams({
        address: context,
        city: cityFilter.trim(),
        uf,
        result_types: 'neighborhood|sublocality|sublocality_level_1|sublocality_level_2|administrative_area_level_3|administrative_area_level_4'
      });

      const response = await fetch(`/api/geocode?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Erro na busca de endereços');
      }

      const data = await response.json();

      if (data.success && data.results) {
        const convertedResults: SearchResult[] = (data.results as GoogleGeocodeResult[])
          .map((result, index) => {
            const bairroOuDistrito =
              getComponentValue(result.address_components, ['sublocality_level_1']) ||
              getComponentValue(result.address_components, ['sublocality_level_2']) ||
              getComponentValue(result.address_components, ['neighborhood']) ||
              getComponentValue(result.address_components, ['administrative_area_level_3']) ||
              getComponentValue(result.address_components, ['administrative_area_level_4']) ||
              getComponentValue(result.address_components, ['sublocality']);

            if (!bairroOuDistrito) {
              return null;
            }

            const cidade =
              getComponentValue(result.address_components, ['administrative_area_level_2']) ||
              getComponentValue(result.address_components, ['locality']);

            return {
              place_id: result.place_id || `result-${index}`,
              display_name: cidade ? `${bairroOuDistrito} - ${cidade}` : bairroOuDistrito,
              lat: result.geometry.location.lat.toString(),
              lon: result.geometry.location.lng.toString(),
              address_components: result.address_components
            } as SearchResult;
          })
          .filter((result): result is SearchResult => Boolean(result));

        const normalizeText = (text: string) =>
          text
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim()
            .toLowerCase();

        const filteredResults = cityFilter?.trim()
          ? convertedResults.filter((result) => {
              const components = result.address_components;
              if (!components) return false;

              const getComponent = (types: string[]) => {
                const component = components.find((comp) => comp.types.some((t) => types.includes(t)));
                return component?.long_name || null;
              };

              const cidadeDetectada =
                getComponent(['administrative_area_level_2']) ||
                getComponent(['locality']) ||
                getComponent(['administrative_area_level_3']);

              if (!cidadeDetectada) return false;

              return normalizeText(cidadeDetectada) === normalizeText(cityFilter);
            })
          : convertedResults;

        setResults(filteredResults);
        setShowResults(filteredResults.length > 0);
      } else {
        setResults([]);
        setShowResults(false);
      }
    } catch (err) {
      setError('Erro ao buscar endereços. Tente novamente.');
      console.error('Erro na busca de endereços:', err);
    } finally {
      setIsLoading(false);
    }
  }, [cityFilter, uf, disabled]);

  // Debounce para busca
  useEffect(() => {
    if (disabled) {
      setResults([]);
      setShowResults(false);
      return;
    }

    if (!query.trim() || selectedAddress === query) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchAddresses(query);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query, selectedAddress, searchAddresses, disabled]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    // Extrair componentes do endereço
    const bairroOuDistrito =
      getComponentValue(result.address_components, ['sublocality_level_1']) ||
      getComponentValue(result.address_components, ['sublocality_level_2']) ||
      getComponentValue(result.address_components, ['neighborhood']) ||
      getComponentValue(result.address_components, ['administrative_area_level_3']) ||
      getComponentValue(result.address_components, ['administrative_area_level_4']) ||
      getComponentValue(result.address_components, ['sublocality']) ||
      result.display_name;

    const addressData: AddressData = {
      endereco_formatado: bairroOuDistrito,
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: bairroOuDistrito,
      cidade:
        getComponentValue(result.address_components, ['administrative_area_level_2']) ||
        getComponentValue(result.address_components, ['locality']),
      estado: getComponentShortValue(result.address_components, ['administrative_area_level_1']),
      cep: '',
      latitude: lat,
      longitude: lng,
    };
    
    setQuery(addressData.endereco_formatado);
    setSelectedAddress(addressData.endereco_formatado);
    setShowResults(false);
    onAddressSelect(addressData);
  };

  const clearSearch = () => {
    setQuery('');
    setSelectedAddress(null);
    setResults([]);
    setShowResults(false);
    setError(null);
  };

  return (
    <div ref={searchContainerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (selectedAddress) setSelectedAddress(null);
          }}
          className="pl-10 pr-10 h-12"
          disabled={disabled || !cityFilter}
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Buscando endereços...
        </div>
      )}

      {selectedAddress && (
        <div className="mt-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg flex items-center gap-2">
          <MapPin className="h-4 w-4 text-green-600" />
          Endereço selecionado
        </div>
      )}

      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.place_id}
              type="button"
              onClick={() => handleResultClick(result)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:bg-gray-50 focus:outline-none"
            >
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900">
                    {result.display_name}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && !isLoading && query.trim() && !selectedAddress && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="text-sm text-gray-500 text-center">
            Nenhum endereço encontrado para &ldquo;{query}&rdquo;
          </div>
        </div>
      )}
    </div>
  );
}
