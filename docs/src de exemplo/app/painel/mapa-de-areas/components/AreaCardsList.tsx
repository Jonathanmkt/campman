import React, { useRef, useEffect, useCallback, useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AssociadosCarousel } from './AssociadosCarousel';
import { Users, History, Car, MapPinned, Plus, Edit } from 'lucide-react';
import type { Area } from '../hooks/useAreas';

interface AreaCardsListProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  areas: Area[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onCreateArea?: () => void;
  onEditArea?: (areaId: number) => void;
}

export function AreaCardsList({ onLocationSelect, areas, loading, hasMore, onLoadMore, onCreateArea, onEditArea }: AreaCardsListProps) {
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [associadosCounts, setAssociadosCounts] = useState<Record<number, number>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const countCallbacksRef = useRef<Record<number, (count: number) => void>>({});
  
  // Criar um callback memoizado para cada área
  const getCountCallback = useCallback((areaId: number) => {
    if (!countCallbacksRef.current[areaId]) {
      countCallbacksRef.current[areaId] = (count: number) => {
        setAssociadosCounts(prev => ({
          ...prev,
          [areaId]: count
        }));
      };
    }
    return countCallbacksRef.current[areaId];
  }, []);

  const formatAddressLine = useCallback((area: Area) => {
    if (area.logradouro) {
      const numeroPart = area.numero ? `,${area.numero}` : '';
      const cepPart = area.cep ? ` - CEP ${area.cep}` : '';
      return `${area.logradouro}${numeroPart}${cepPart}`;
    }

    if (area.endereco_legado) {
      return area.endereco_legado;
    }

    if (area.endereco_formatado) {
      return area.endereco_formatado;
    }
    return '';
  }, []);

  const handleScroll = useCallback(() => {
    const element = scrollRef.current;
    if (!element || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = element;

    if (scrollHeight - scrollTop - clientHeight < 100) {
      onLoadMore();
    }
  }, [hasMore, onLoadMore]);
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <Button 
          onClick={onCreateArea}
          className="w-full"
          size="lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Criar Nova Área
        </Button>
      </div>
      
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="space-y-5 pr-4">
          {loading && areas.length === 0 && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Carregando áreas...</p>
            </div>
          )}
          
          {!loading && areas.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">Nenhuma área encontrada</p>
            </div>
          )}
          
          {areas.map((area) => (
            <div 
              key={area.id}
              onClick={() => setSelectedAreaId(area.id === selectedAreaId ? null : area.id)}
              className={`cursor-pointer p-4 rounded-lg border transition-colors ${area.id === selectedAreaId ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}
            >
              <div className="flex gap-5">
                {/* Carousel de associados à esquerda */}
                <div className="flex-shrink-0 h-full">
                  <AssociadosCarousel 
                    areaId={area.id} 
                    onCountChange={getCountCallback(area.id)}
                  />
                </div>
                
                {/* Informações da área à direita */}
                <div className="flex-1 min-w-0 flex flex-col space-y-2">
                  {/* Cabeçalho: Código e Ações */}
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{area.codigo_singaerj}</h3>
                    <div className="flex items-center gap-2">
                      {(associadosCounts[area.id] || 0) > 0 && (
                        <div className="flex items-center space-x-1 bg-gray-100 rounded-full px-2 py-0.5">
                          <Users className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-600">{associadosCounts[area.id]}</span>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditArea?.(area.id);
                        }}
                        className="h-6 w-6 p-0 hover:bg-gray-200"
                      >
                        <Edit className="h-3 w-3 text-gray-500" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Endereço */}
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 leading-snug">
                      {formatAddressLine(area)}
                    </p>
                    {area.bairro && (
                      <p className="text-xs text-gray-500">Bairro: {area.bairro}</p>
                    )}
                  </div>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap gap-x-3 gap-y-2 pt-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200 flex items-center gap-1.5 py-1 px-2">
                      <Car className="h-3.5 w-3.5" />
                      <span className="font-medium">{area.vagas || 'N/A'}</span>
                    </Badge>
                    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200 flex items-center gap-1.5 py-1 px-2">
                      <MapPinned className="h-3.5 w-3.5" />
                      <span className="font-medium">{area.posicao || 'N/A'}</span>
                    </Badge>
                    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200 flex items-center gap-1.5 py-1 px-2">
                      <History className="h-3.5 w-3.5" />
                      <span className="font-medium">{area.rotatividade || 'N/A'}</span>
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {loading && areas.length > 0 && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-xs text-gray-500 mt-1">Carregando mais áreas...</p>
            </div>
          )}
          
          {hasMore && !loading && (
            <div className="text-center py-4">
              <button 
                onClick={onLoadMore}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                Carregar mais áreas
              </button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
