import { useState, useEffect, useCallback } from 'react';
import { Area } from './useAreas';

// Função para calcular a distância entre dois pontos geográficos (fórmula de Haversine)
function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distância em km
}

interface UseProximityAreasProps {
  areas: Area[];
  mapCenter: { lat: number; lng: number } | null;
  batchSize?: number;
}

export function useProximityAreas({
  areas,
  mapCenter,
  batchSize = 20
}: UseProximityAreasProps) {
  const [visibleAreas, setVisibleAreas] = useState<Area[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  // Ordenar áreas por proximidade ao centro do mapa
  const sortAreasByProximity = useCallback(() => {
    if (!mapCenter || areas.length === 0) return [];
    
    return [...areas].filter(area => {
      return area.latitude && area.longitude;
    }).map(area => {
      const lat = parseFloat(area.latitude || '0');
      const lng = parseFloat(area.longitude || '0');
      const distance = calculateDistance(
        mapCenter.lat, 
        mapCenter.lng, 
        lat, 
        lng
      );
      return { ...area, distance };
    }).sort((a, b) => {
      return (a.distance || Infinity) - (b.distance || Infinity);
    });
  }, [areas, mapCenter]);
  
  // Atualizar áreas visíveis quando o centro do mapa mudar
  useEffect(() => {
    if (mapCenter) {
      const sortedAreas = sortAreasByProximity();
      setVisibleAreas(sortedAreas.slice(0, batchSize));
      setHasMore(sortedAreas.length > batchSize);
      setPage(1);
    }
  }, [mapCenter, sortAreasByProximity, batchSize]);
  
  // Função para carregar mais áreas
  const loadMore = useCallback(() => {
    const sortedAreas = sortAreasByProximity();
    const nextPage = page + 1;
    const nextBatch = sortedAreas.slice(0, nextPage * batchSize);
    
    setVisibleAreas(nextBatch);
    setHasMore(nextBatch.length < sortedAreas.length);
    setPage(nextPage);
  }, [page, batchSize, sortAreasByProximity]);
  
  return {
    visibleAreas,
    hasMore,
    loadMore,
    resetPagination: () => {
      setPage(1);
      const sortedAreas = sortAreasByProximity();
      setVisibleAreas(sortedAreas.slice(0, batchSize));
      setHasMore(sortedAreas.length > batchSize);
    }
  };
}
