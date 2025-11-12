/**
 * Configurações do Sistema de Mapa Otimizado
 * Centralize aqui todos os parâmetros configuráveis
 */

export const MAP_CONFIG = {
  // Configurações de Zoom
  ZOOM: {
    // Zoom mínimo para mostrar marcadores
    MIN_MARKERS: 12,
    
    // Níveis de zoom com comportamentos diferentes
    LEVELS: {
      REGION: { min: 0, max: 12, maxAreas: 50 },      // Vista geral
      NEIGHBORHOOD: { min: 13, max: 16, maxAreas: 200 }, // Vista de bairro
      STREET: { min: 17, max: 22, maxAreas: 500 }     // Vista detalhada
    }
  },

  // Configurações de Clustering
  CLUSTERING: {
    // Distâncias de agrupamento por zoom (em metros)
    DISTANCES: {
      LOW_ZOOM: 1000,    // Zoom <= 12
      MID_ZOOM: 500,     // Zoom 13-16
      HIGH_ZOOM: 100     // Zoom >= 17
    },
    
    // Tamanhos dos marcadores
    MARKER_SIZES: {
      MIN_INDIVIDUAL: 8,
      MAX_CLUSTER: 25,
      SCALE_FACTOR: 2
    }
  },

  // Configurações de Performance
  PERFORMANCE: {
    // Debounce para movimentação do mapa (ms)
    DEBOUNCE_DELAY: 300,
    
    // Timeout para requisições (ms)
    REQUEST_TIMEOUT: 5000,
    
    // Máximo de áreas por requisição
    MAX_AREAS_PER_REQUEST: 500
  },

  // Configurações Visuais
  VISUAL: {
    // Cores dos marcadores
    COLORS: {
      INDIVIDUAL: '#22c55e',  // Verde para áreas individuais
      CLUSTER: '#ef4444',     // Vermelho para clusters
      STROKE: '#ffffff'       // Branco para bordas
    },
    
    // Opacidade
    OPACITY: {
      FILL: 0.8,
      STROKE: 1.0
    }
  },

  // Localização padrão (Sede SINGAERJ)
  DEFAULT_LOCATION: {
    lat: -22.9041,
    lng: -43.1729,
    zoom: 15
  }
} as const;

/**
 * Função para obter distância de clustering baseada no zoom
 */
export function getClusterDistance(zoomLevel: number): number {
  if (zoomLevel <= 12) return MAP_CONFIG.CLUSTERING.DISTANCES.LOW_ZOOM;
  if (zoomLevel <= 16) return MAP_CONFIG.CLUSTERING.DISTANCES.MID_ZOOM;
  return MAP_CONFIG.CLUSTERING.DISTANCES.HIGH_ZOOM;
}

/**
 * Função para obter máximo de áreas baseado no zoom
 */
export function getMaxAreasForZoom(zoomLevel: number): number {
  if (zoomLevel <= 12) return MAP_CONFIG.ZOOM.LEVELS.REGION.maxAreas;
  if (zoomLevel <= 16) return MAP_CONFIG.ZOOM.LEVELS.NEIGHBORHOOD.maxAreas;
  return MAP_CONFIG.ZOOM.LEVELS.STREET.maxAreas;
}

/**
 * Função para verificar se deve mostrar marcadores
 */
export function shouldShowMarkers(zoomLevel: number): boolean {
  return zoomLevel >= MAP_CONFIG.ZOOM.MIN_MARKERS;
}
