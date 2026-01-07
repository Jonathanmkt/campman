'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Search, MapPin, X, Loader2 } from 'lucide-react';

export interface MunicipioData {
  id: string;
  nome: string;
  uf: string;
  codigo_ibge: string | null;
}

interface MunicipioSearchProps {
  onMunicipioSelect: (municipio: MunicipioData) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MunicipioSearch({
  onMunicipioSelect,
  placeholder = "Digite o nome do município...",
  disabled = false,
}: MunicipioSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MunicipioData[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMunicipio, setSelectedMunicipio] = useState<string | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const searchMunicipios = useCallback(async (searchQuery: string) => {
    if (disabled) return;
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/mobile/municipios?q=${encodeURIComponent(searchQuery)}`);

      if (!response.ok) {
        throw new Error('Erro na busca de municípios');
      }

      const data = await response.json();

      if (data.success && data.data) {
        setResults(data.data);
        setShowResults(data.data.length > 0);
      } else {
        setResults([]);
        setShowResults(false);
      }
    } catch (err) {
      setError('Erro ao buscar municípios. Tente novamente.');
      console.error('Erro na busca de municípios:', err);
    } finally {
      setIsLoading(false);
    }
  }, [disabled]);

  // Debounce para busca
  useEffect(() => {
    if (disabled) {
      setResults([]);
      setShowResults(false);
      return;
    }

    if (!query.trim() || selectedMunicipio === query) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchMunicipios(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, selectedMunicipio, searchMunicipios, disabled]);

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

  const handleResultClick = (municipio: MunicipioData) => {
    setQuery(`${municipio.nome} - ${municipio.uf}`);
    setSelectedMunicipio(`${municipio.nome} - ${municipio.uf}`);
    setShowResults(false);
    onMunicipioSelect(municipio);
  };

  const clearSearch = () => {
    setQuery('');
    setSelectedMunicipio(null);
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
            if (selectedMunicipio) setSelectedMunicipio(null);
          }}
          className="pl-10 pr-10 h-12"
          disabled={disabled}
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
          Buscando municípios...
        </div>
      )}

      {selectedMunicipio && (
        <div className="mt-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg flex items-center gap-2">
          <MapPin className="h-4 w-4 text-green-600" />
          Município selecionado
        </div>
      )}

      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((municipio) => (
            <button
              key={municipio.id}
              type="button"
              onClick={() => handleResultClick(municipio)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:bg-gray-50 focus:outline-none"
            >
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    {municipio.nome}
                  </div>
                  <div className="text-xs text-gray-500">
                    {municipio.uf}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && !isLoading && query.trim() && !selectedMunicipio && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="text-sm text-gray-500 text-center">
            Nenhum município encontrado para &ldquo;{query}&rdquo;
          </div>
        </div>
      )}
    </div>
  );
}
