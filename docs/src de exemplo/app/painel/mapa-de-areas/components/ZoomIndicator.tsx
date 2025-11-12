import React from 'react';
import { MAP_CONFIG, getClusterDistance } from '../config/mapConfig';

interface ZoomIndicatorProps {
  zoom: number;
  isVisible?: boolean;
}

/**
 * Componente temporário para mostrar informações de zoom e clustering
 * Útil para calibrar as configurações do sistema
 */
export function ZoomIndicator({ zoom, isVisible = true }: ZoomIndicatorProps) {
  if (!isVisible) return null;
  
  // Calcular distância de clustering baseada no zoom atual
  const clusterDistance = getClusterDistance(zoom);
  
  // Determinar o nível de zoom (região, bairro, rua)
  const getZoomLevel = () => {
    if (zoom <= MAP_CONFIG.ZOOM.LEVELS.REGION.max) return 'REGIÃO';
    if (zoom <= MAP_CONFIG.ZOOM.LEVELS.NEIGHBORHOOD.max) return 'BAIRRO';
    return 'RUA';
  };
  
  // Determinar o máximo de áreas para este zoom
  const getMaxAreas = () => {
    if (zoom <= MAP_CONFIG.ZOOM.LEVELS.REGION.max) 
      return MAP_CONFIG.ZOOM.LEVELS.REGION.maxAreas;
    if (zoom <= MAP_CONFIG.ZOOM.LEVELS.NEIGHBORHOOD.max) 
      return MAP_CONFIG.ZOOM.LEVELS.NEIGHBORHOOD.maxAreas;
    return MAP_CONFIG.ZOOM.LEVELS.STREET.maxAreas;
  };
  
  // Verificar se marcadores são mostrados neste zoom
  const markersVisible = zoom >= MAP_CONFIG.ZOOM.MIN_MARKERS;
  
  return (
    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200 z-50 max-w-xs">
      <div className="text-center mb-2 font-bold text-gray-700 border-b pb-1">
        Indicador de Zoom (Temporário)
      </div>
      
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="font-medium">Nível de Zoom:</span>
          <span className="font-mono bg-gray-100 px-2 rounded">{zoom.toFixed(1)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-medium">Tipo de Vista:</span>
          <span className={`font-mono px-2 rounded ${
            zoom <= 12 ? 'bg-blue-100 text-blue-800' : 
            zoom <= 16 ? 'bg-green-100 text-green-800' : 
            'bg-amber-100 text-amber-800'
          }`}>
            {getZoomLevel()}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-medium">Distância Clustering:</span>
          <span className="font-mono bg-gray-100 px-2 rounded">
            {clusterDistance}m
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-medium">Máx. Áreas:</span>
          <span className="font-mono bg-gray-100 px-2 rounded">
            {getMaxAreas()}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-medium">Marcadores:</span>
          <span className={`font-mono px-2 rounded ${
            markersVisible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {markersVisible ? 'VISÍVEIS' : 'OCULTOS'}
          </span>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-gray-500 border-t pt-1">
        Ajuste o zoom para calibrar as configurações do sistema
      </div>
    </div>
  );
}
