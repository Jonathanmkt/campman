'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useGoogleMaps } from '@/app/painel/mapa-de-areas/hooks/useGoogleMaps';
import { useOptimizedAreas } from '../hooks/useOptimizedAreas';
import { clusterAreas } from '../utils/clustering';
import { ClusteredMarkers } from './ClusteredMarker';

// Declaração global para o Google Maps
declare global {
  interface Window {
    google: typeof google;
  }
}

interface GoogleMapProps {
  className?: string;
  onMapReady?: (map: google.maps.Map) => void;
  onCenterChanged?: (center: { lat: number; lng: number }) => void;
}

export default function GoogleMap({ 
  className = "h-full w-full",
  onMapReady,
  onCenterChanged
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const { isLoaded, error: hookError } = useGoogleMaps();
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // Usar o hook otimizado para áreas
  const { 
    areas, 
    currentZoom, 
    shouldShowMarkers
  } = useOptimizedAreas({ mapInstance: map });

  // Obter localização do usuário
  useEffect(() => {
    // Fallback: Sede do SINGAERJ
    const fallbackLocation = { lat: -22.9041, lng: -43.1729 }; // Rua Figueira de Melo, 200, São Cristóvão
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // Geolocalização não disponível, usar fallback
          setUserLocation(fallbackLocation);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 300000 // 5 minutos
        }
      );
    } else {
      setUserLocation(fallbackLocation);
    }
  }, []);

  // Calcular clusters das áreas
  const clusters = React.useMemo(() => {
    if (!shouldShowMarkers || areas.length === 0) return [];
    return clusterAreas(areas, currentZoom);
  }, [areas, currentZoom, shouldShowMarkers]);

  // useEffect para criar o mapa
  useEffect(() => {
    if (hookError) {
      setError(hookError);
      return;
    }
    
    if (isLoaded && mapRef.current && window.google && userLocation) {
      // eslint-disable-next-line no-console
      console.log('🎯 Criando instância do mapa...');
      try {
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: userLocation || { lat: -22.9041, lng: -43.1729 },
          zoom: 13,
          mapTypeId: 'roadmap',
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ],
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_RIGHT,
            mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain']
          },
          fullscreenControl: true,
          fullscreenControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT
          },
          streetViewControl: true,
          streetViewControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
          },
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER
          }
        });
        
        // Criar o input de busca
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Buscar endereço no Rio de Janeiro...';
        input.style.cssText = `
          box-sizing: border-box;
          border: 1px solid transparent;
          width: calc(100vw - 400px);
          max-width: 600px;
          min-width: 300px;
          height: 40px;
          padding: 0 12px;
          border-radius: 8px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          font-size: 14px;
          outline: none;
          text-overflow: ellipsis;
          background-color: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(4px);
          margin: 10px;
        `;
        
        // Criar SearchBox com o input
        const searchBoxInstance = new google.maps.places.SearchBox(input);
        mapInstance.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
        
        // Definir bounds para restringir busca ao Rio de Janeiro
        const rioBounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(-23.082, -43.796), // Southwest
          new google.maps.LatLng(-22.746, -43.099)  // Northeast
        );
        
        // Bias the SearchBox results towards Rio de Janeiro bounds
        searchBoxInstance.setBounds(rioBounds);
        
        // Atualizar bounds quando o mapa mudar, mas manter foco no Rio
        mapInstance.addListener('bounds_changed', () => {
          const currentBounds = mapInstance.getBounds();
          if (currentBounds && rioBounds.intersects(currentBounds)) {
            // Se o mapa atual intersecta com o Rio, usar a interseção
            const intersection = new google.maps.LatLngBounds();
            const sw = currentBounds.getSouthWest();
            const ne = currentBounds.getNorthEast();
            const rioSw = rioBounds.getSouthWest();
            const rioNe = rioBounds.getNorthEast();
            
            intersection.extend(new google.maps.LatLng(
              Math.max(sw.lat(), rioSw.lat()),
              Math.max(sw.lng(), rioSw.lng())
            ));
            intersection.extend(new google.maps.LatLng(
              Math.min(ne.lat(), rioNe.lat()),
              Math.min(ne.lng(), rioNe.lng())
            ));
            
            searchBoxInstance.setBounds(intersection);
          } else {
            // Se não intersecta, manter bounds do Rio
            searchBoxInstance.setBounds(rioBounds);
          }
        });
        
        // Listen for the event fired when the user selects a prediction
        searchBoxInstance.addListener('places_changed', () => {
          const places = searchBoxInstance.getPlaces();
          
          if (places && places.length === 0) {
            return;
          }
          
          // Filtrar apenas lugares dentro do Rio de Janeiro
          const rioPlaces = places?.filter((place) => {
            if (!place.geometry || !place.geometry.location) {
              return false;
            }
            
            // Verificar se o lugar está dentro dos bounds do Rio
            const location = place.geometry.location;
            return rioBounds.contains(location);
          });
          
          if (!rioPlaces || rioPlaces.length === 0) {
            alert('Por favor, busque apenas endereços dentro da cidade do Rio de Janeiro.');
            return;
          }
          
          // For each place, get the icon, name and location
          const bounds = new google.maps.LatLngBounds();
          
          rioPlaces.forEach((place) => {
            // Create a marker for each place
            new google.maps.Marker({
              map: mapInstance,
              title: place.name,
              position: place.geometry!.location,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#ef4444',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2
              }
            });
            
            if (place.geometry!.viewport) {
              // Only geocodes have viewport
              bounds.union(place.geometry!.viewport);
            } else {
              bounds.extend(place.geometry!.location);
            }
          });
          
          mapInstance.fitBounds(bounds);
        });
        
        console.log('🎉 Mapa criado com sucesso!');
        setMap(mapInstance);
        
        // Callback para componente pai
        if (onMapReady) {
          onMapReady(mapInstance);
        }

        // Adicionar evento para notificar quando o centro do mapa mudar
        if (onCenterChanged) {
          mapInstance.addListener('center_changed', () => {
            const center = mapInstance.getCenter();
            if (center) {
              onCenterChanged({
                lat: center.lat(),
                lng: center.lng()
              });
            }
          });
          
          // Notificar o centro inicial
          onCenterChanged(userLocation || { lat: -22.9041, lng: -43.1729 });
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('❌ Erro ao criar mapa:', err);
        setError('Erro ao criar instância do mapa');
      }
    }
  }, [isLoaded, hookError, userLocation, onMapReady, onCenterChanged]);

  // Handler para clique em marcador/cluster
  const handleMarkerClick = React.useCallback(() => {
    // Debug: Marcador clicado - implementar ações futuras aqui
  }, []);


  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <div className="text-center p-4">
          <p className="text-red-600 font-medium">Erro ao carregar mapa</p>
          <p className="text-sm text-gray-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  // Adicionar console.log para debug
  console.log('Renderizando GoogleMap', { isLoaded, error, mapRef: mapRef.current, className });
  
  return (
    <div className="relative w-full h-full">
      {/* Div do mapa com estilos explícitos para garantir renderização */}
      <div 
        ref={mapRef} 
        className={`${className} w-full h-full`} 
        style={{ minHeight: '400px', width: '100%', height: '100%' }} 
      />
      
      {/* Mensagem de debug quando o mapa não carrega */}
      {isLoaded && !map && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 bg-opacity-70 z-10">
          <div className="text-center p-4 bg-white rounded shadow">
            <p className="text-red-600 font-medium">Mapa não inicializado</p>
            <p className="text-sm text-gray-600 mt-1">Verifique o console para mais informações</p>
          </div>
        </div>
      )}
      
      {/* Renderizar marcadores clusterizados */}
      {map && clusters.length > 0 && (
        <ClusteredMarkers
          clusters={clusters}
          map={map}
          onMarkerClick={handleMarkerClick}
        />
      )}
    </div>
  );
}
