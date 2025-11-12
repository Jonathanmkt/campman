'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search, MapPin, X } from 'lucide-react';

interface SearchResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}

interface MapSearchProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}

export function MapSearch({ onLocationSelect }: MapSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounce para busca
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchAddresses(query);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

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

  const searchAddresses = async (searchQuery: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Usar Google Geocoding API via nossa API route
      const response = await fetch(
        `/api/geocode?address=${encodeURIComponent(searchQuery + ', Rio de Janeiro, RJ, Brasil')}`
      );

      if (!response.ok) {
        throw new Error('Erro na busca de endereços');
      }

      const data = await response.json();
      
      if (data.success && data.results) {
        // Converter resultados do Google para o formato esperado
        const convertedResults: SearchResult[] = data.results.map((result: any, index: number) => ({
          place_id: result.place_id || `result-${index}`,
          display_name: result.formatted_address,
          lat: result.geometry.location.lat.toString(),
          lon: result.geometry.location.lng.toString()
        }));

        setResults(convertedResults);
        setShowResults(convertedResults.length > 0);
      } else {
        setResults([]);
        setShowResults(false);
      }
    } catch (err) {
      setError('Erro ao buscar endereços');
    } finally {
      setIsLoading(false);
    }
  };

  const simplifyAddress = (fullAddress: string): string => {
    const parts = fullAddress.split(', ');
    
    if (parts.length < 3) return fullAddress;
    
    let street = parts[0];
    let neighborhood = '';
    let postalCode = '';
    
    // Identificar bairro (segunda parte se não for "Rio de Janeiro")
    if (parts.length > 1 && !parts[1].includes('Rio de Janeiro')) {
      neighborhood = parts[1];
    } else if (parts.length > 2 && !parts[2].includes('Rio de Janeiro')) {
      neighborhood = parts[2];
    }
    
    // Procurar CEP
    const postalCodeMatch = fullAddress.match(/(\d{5}-\d{3}|\d{8})/);
    if (postalCodeMatch) {
      postalCode = postalCodeMatch[0];
      if (postalCode.length === 8 && !postalCode.includes('-')) {
        postalCode = `${postalCode.substring(0, 5)}-${postalCode.substring(5)}`;
      }
    }
    
    // Montar endereço simplificado
    let simplifiedAddress = street;
    if (neighborhood) simplifiedAddress += `, ${neighborhood}`;
    if (postalCode) simplifiedAddress += `, ${postalCode}`;
    
    return simplifiedAddress;
  };

  const handleSelectResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const simplifiedAddress = simplifyAddress(result.display_name);
    
    setQuery(simplifiedAddress);
    setShowResults(false);
    onLocationSelect(lat, lng, simplifiedAddress);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div ref={searchContainerRef} className="relative w-full">
      <div className="relative">
        <Input
          type="text"
          placeholder="Buscar endereço no Rio de Janeiro..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setShowResults(true)}
          className="pr-16 pl-4 h-11 shadow-md bg-white/95 backdrop-blur-sm"
        />
        
        {/* Ícone de busca ou loading */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {query && (
            <button
              onClick={clearSearch}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}
          
          {isLoading ? (
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
          ) : (
            <Search className="h-4 w-4 text-gray-500" />
          )}
        </div>
      </div>

      {/* Dropdown de resultados */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {error ? (
            <div className="p-3 text-center text-red-600 text-sm">
              {error}
            </div>
          ) : results.length === 0 ? (
            <div className="p-3 text-center text-gray-500 text-sm">
              Nenhum endereço encontrado no Rio de Janeiro
            </div>
          ) : (
            <ul className="py-1">
              {results.map((result) => (
                <li key={result.place_id}>
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-start gap-2"
                    onClick={() => handleSelectResult(result)}
                  >
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                    <span className="line-clamp-2">{simplifyAddress(result.display_name)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
