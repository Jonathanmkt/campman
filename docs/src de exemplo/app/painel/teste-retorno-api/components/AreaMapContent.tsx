import React, { useState, useCallback } from 'react';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { MapContainer } from './MapContainer';
import { ApiResponseDisplay } from './ApiResponseDisplay';
import type { PlaceSearchResult } from './GoogleMap';

export function AreaMapContent() {
  // Mantemos a referência ao mapa para uso futuro se necessário
  const [, setMapInstance] = useState<google.maps.Map | null>(null);
  const [searchResult, setSearchResult] = useState<PlaceSearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCenterChanged = useCallback(() => {
    // Centro do mapa agora é gerenciado automaticamente pelo hook otimizado
  }, []);

  const handlePlaceSearchResult = useCallback((result: PlaceSearchResult) => {
    // eslint-disable-next-line no-console
    console.log('Resultado da busca:', result);
    setLoading(true);
    // Simular um pequeno delay para mostrar o loading
    setTimeout(() => {
      setSearchResult(result);
      setLoading(false);
    }, 300);
  }, []);

  return (
    <div className='h-full flex flex-col overflow-hidden'>
      <div className='h-full flex flex-col bg-gray-200 rounded-lg shadow flex-1' style={{ minHeight: 0 }}>
        {/* Layout resizable com duas colunas */}
        <div className="flex-1 p-6 overflow-hidden">
          <ResizablePanelGroup
            direction="horizontal"
            className="h-full rounded-lg border bg-white"
          >
            {/* Painel esquerdo - Mapa */}
            <ResizablePanel defaultSize={60} minSize={40}>
              <div className="h-full p-4" style={{ minHeight: '500px' }}>
                {/* Console log para debug */}
                {/* eslint-disable-next-line no-console */}
                <div className="sr-only" aria-hidden="true">
                  Renderizando container do mapa
                  {(() => { 
                    // eslint-disable-next-line no-console
                    console.log('Renderizando container do mapa'); 
                    return null; 
                  })()}
                </div>
                <MapContainer 
                  onMapReady={setMapInstance} 
                  onCenterChanged={handleCenterChanged}
                  onPlaceSearchResult={handlePlaceSearchResult}
                />
              </div>
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            {/* Painel direito - Lista de cards */}
            <ResizablePanel defaultSize={40} minSize={30}>
              <div className="h-full p-4">
                <ApiResponseDisplay 
                  data={searchResult} 
                  loading={loading} 
                />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>

      {/* Sem modais nesta versão */}
    </div>
  );
}
