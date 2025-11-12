import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Area } from './useAreas';
import { MAP_CONFIG, getClusterDistance, getMaxAreasForZoom, shouldShowMarkers } from '../config/mapConfig';

interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface UseViewportAreasProps {
  mapInstance: google.maps.Map | null;
  enabled?: boolean;
}

interface ClusteredArea {
  id: string;
  latitude: number;
  longitude: number;
  areas: Area[];
  totalVagas: number;
  isCluster: boolean;
}

// Função para calcular distância entre dois pontos (em metros)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Raio da Terra em metros
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Função para agrupar áreas próximas baseado no zoom
function clusterAreas(areas: Area[], zoomLevel: number): ClusteredArea[] {
  const clusters: ClusteredArea[] = [];
  const processed = new Set<number>();
  
  // Distância de clustering baseada no zoom (em metros)
  const clusterDistance = getClusterDistance(zoomLevel);
  
  areas.forEach(area => {
    if (processed.has(area.id)) return;
    
    const lat = parseFloat(area.latitude || '0');
    const lng = parseFloat(area.longitude || '0');
    
    if (isNaN(lat) || isNaN(lng)) return;
    
    const cluster: ClusteredArea = {
      id: `cluster_${area.id}`,
      latitude: lat,
      longitude: lng,
      areas: [area],
      totalVagas: area.vagas || 0,
      isCluster: false
    };
    
    // Encontrar áreas próximas para agrupar
    areas.forEach(otherArea => {
      if (otherArea.id !== area.id && !processed.has(otherArea.id)) {
        const otherLat = parseFloat(otherArea.latitude || '0');
        const otherLng = parseFloat(otherArea.longitude || '0');
        
        if (isNaN(otherLat) || isNaN(otherLng)) return;
        
        const distance = calculateDistance(lat, lng, otherLat, otherLng);
        
        if (distance <= clusterDistance) {
          cluster.areas.push(otherArea);
          cluster.totalVagas += (otherArea.vagas || 0);
          processed.add(otherArea.id);
        }
      }
    });
    
    // Marcar como cluster se tem mais de uma área
    if (cluster.areas.length > 1) {
      cluster.isCluster = true;
      // Calcular centro do cluster
      const avgLat = cluster.areas.reduce((sum, a) => sum + parseFloat(a.latitude || '0'), 0) / cluster.areas.length;
      const avgLng = cluster.areas.reduce((sum, a) => sum + parseFloat(a.longitude || '0'), 0) / cluster.areas.length;
      cluster.latitude = avgLat;
      cluster.longitude = avgLng;
    }
    
    processed.add(area.id);
    clusters.push(cluster);
  });
  
  return clusters;
}

export function useViewportAreas({ mapInstance, enabled = true }: UseViewportAreasProps) {
  const [areas, setAreas] = useState<Area[]>([]);
  const [clusteredAreas, setClusteredAreas] = useState<ClusteredArea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(15);

  // Função para buscar áreas dentro do viewport atual
  const fetchAreasInViewport = useCallback(async (bounds: ViewportBounds, zoom: number) => {
    if (!enabled) return;
    
    // Não mostrar marcadores em zoom muito baixo
    if (!shouldShowMarkers(zoom)) {
      setAreas([]);
      setClusteredAreas([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      
      // Buscar áreas dentro do viewport com limite baseado no zoom
      const maxAreas = getMaxAreasForZoom(zoom);
      
      const { data, error: fetchError } = await supabase
        .from('areas')
        .select(`
          id,
          codigo_singaerj,
          endereco_legado,
          endereco_formatado,
          bairro,
          logradouro,
          cep,
          numero,
          latitude,
          longitude,
          vagas,
          posicao,
          rotatividade,
          ativo,
          geocoding_sucesso
        `)
        .eq('ativo', true)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .eq('geocoding_sucesso', true)
        .gte('latitude', bounds.south.toString())
        .lte('latitude', bounds.north.toString())
        .gte('longitude', bounds.west.toString())
        .lte('longitude', bounds.east.toString())
        .limit(maxAreas)
        .order('vagas', { ascending: false }); // Priorizar áreas com mais vagas
      
      if (fetchError) throw fetchError;
      
      const fetchedAreas = data || [];
      setAreas(fetchedAreas);
      
      // Aplicar clustering baseado no zoom
      const clusters = clusterAreas(fetchedAreas, zoom);
      setClusteredAreas(clusters);
      
      console.log(`📍 Carregadas ${fetchedAreas.length} áreas, ${clusters.length} clusters (zoom: ${zoom})`);
      
    } catch (err) {
      console.error('Erro ao buscar áreas do viewport:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  // Debounced function para evitar muitas chamadas
  const debouncedFetch = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    
    return (bounds: ViewportBounds, zoom: number) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fetchAreasInViewport(bounds, zoom);
      }, MAP_CONFIG.PERFORMANCE.DEBOUNCE_DELAY);
    };
  }, [fetchAreasInViewport]);

  // Configurar listeners do mapa
  useEffect(() => {
    if (!mapInstance || !enabled) return;

    const handleBoundsChanged = () => {
      const bounds = mapInstance.getBounds();
      const zoom = mapInstance.getZoom();
      
      if (!bounds || zoom === undefined) return;
      
      setCurrentZoom(zoom);
      
      const viewportBounds: ViewportBounds = {
        north: bounds.getNorthEast().lat(),
        south: bounds.getSouthWest().lat(),
        east: bounds.getNorthEast().lng(),
        west: bounds.getSouthWest().lng()
      };
      
      debouncedFetch(viewportBounds, zoom);
    };

    // Adicionar listeners
    const boundsListener = mapInstance.addListener('bounds_changed', handleBoundsChanged);
    const zoomListener = mapInstance.addListener('zoom_changed', handleBoundsChanged);
    
    // Buscar áreas iniciais
    handleBoundsChanged();

    return () => {
      google.maps.event.removeListener(boundsListener);
      google.maps.event.removeListener(zoomListener);
    };
  }, [mapInstance, enabled, debouncedFetch]);

  return {
    areas,
    clusteredAreas,
    loading,
    error,
    currentZoom,
    shouldShowMarkers: shouldShowMarkers(currentZoom)
  };
}
