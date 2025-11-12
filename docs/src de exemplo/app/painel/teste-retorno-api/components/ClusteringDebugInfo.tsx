import React from 'react';

interface ClusteredArea {
  id: string;
  latitude: number;
  longitude: number;
  areas: unknown[];
  totalVagas: number;
  isCluster: boolean;
}

interface ClusteringDebugInfoProps {
  totalAreas: number;
  clusteredAreas: ClusteredArea[];
  loading: boolean;
  zoom: number;
  isVisible?: boolean;
}

/**
 * Componente temporário para debug do sistema de clustering
 * Mostra estatísticas em tempo real sobre o agrupamento de áreas
 */
export function ClusteringDebugInfo({ 
  totalAreas, 
  clusteredAreas, 
  loading, 
  zoom,
  isVisible = true 
}: ClusteringDebugInfoProps) {
  if (!isVisible) return null;
  
  // Calcular estatísticas dos clusters
  const individualAreas = clusteredAreas.filter(c => !c.isCluster).length;
  const clusters = clusteredAreas.filter(c => c.isCluster).length;
  const totalAreasInClusters = clusteredAreas
    .filter(c => c.isCluster)
    .reduce((sum, c) => sum + c.areas.length, 0);
  
  const compressionRatio = totalAreas > 0 ? 
    ((totalAreas - clusteredAreas.length) / totalAreas * 100).toFixed(1) : '0';
  
  return (
    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200 z-50 max-w-sm">
      <div className="text-center mb-2 font-bold text-gray-700 border-b pb-1">
        Debug Clustering (Temporário)
      </div>
      
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="font-medium">Status:</span>
          <span className={`font-mono px-2 rounded ${
            loading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
          }`}>
            {loading ? 'CARREGANDO' : 'PRONTO'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-medium">Áreas Carregadas:</span>
          <span className="font-mono bg-gray-100 px-2 rounded">{totalAreas}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-medium">Marcadores Individuais:</span>
          <span className="font-mono bg-blue-100 text-blue-800 px-2 rounded">
            {individualAreas}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-medium">Clusters Criados:</span>
          <span className="font-mono bg-red-100 text-red-800 px-2 rounded">
            {clusters}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-medium">Áreas em Clusters:</span>
          <span className="font-mono bg-orange-100 text-orange-800 px-2 rounded">
            {totalAreasInClusters}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-medium">Total Marcadores:</span>
          <span className="font-mono bg-purple-100 text-purple-800 px-2 rounded">
            {clusteredAreas.length}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-medium">Compressão:</span>
          <span className="font-mono bg-green-100 text-green-800 px-2 rounded">
            {compressionRatio}%
          </span>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-gray-500 border-t pt-1">
        Zoom {zoom.toFixed(1)} • {totalAreas} → {clusteredAreas.length} marcadores
      </div>
    </div>
  );
}
