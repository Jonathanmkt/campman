'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useGoogleMaps } from '../hooks/useGoogleMaps';

// Declaração global para o Google Maps
declare global {
  interface Window {
    google: typeof google;
  }
}

// Interface para o resultado da busca de endereços
export interface PlaceSearchResult {
  places: google.maps.places.PlaceResult[] | null;
  query: string;
  timestamp: number;
}

interface GoogleMapProps {
  className?: string;
  onMapReady?: (map: google.maps.Map) => void;
  onCenterChanged?: (center: { lat: number; lng: number }) => void;
  onPlaceSearchResult?: (result: PlaceSearchResult) => void;
}

export default function GoogleMap({ 
  className = "h-full w-full",
  onMapReady,
  onCenterChanged,
  onPlaceSearchResult
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const { isLoaded, error: hookError } = useGoogleMaps();
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

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

  // Não precisamos mais calcular clusters

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
          mapTypeControl: true,
          fullscreenControl: true,
          streetViewControl: true,
          zoomControl: true
        });
        
        // Criar o input de busca
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Buscar qualquer endereço...';
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
        
        // Atualizar bounds quando o mapa mudar para melhorar resultados de busca
        mapInstance.addListener('bounds_changed', () => {
          const currentBounds = mapInstance.getBounds();
          if (currentBounds) {
            searchBoxInstance.setBounds(currentBounds);
          }
        });
        
        // Listen for the event fired when the user selects a prediction
        searchBoxInstance.addListener('places_changed', () => {
          const places = searchBoxInstance.getPlaces();
          const searchQuery = input.value;
          
          if (places && places.length === 0) {
            return;
          }
          
          // Verificar se os lugares têm geometria válida
          const validPlaces = places?.filter((place) => {
            return place.geometry && place.geometry.location;
          });
          
          if (!validPlaces || validPlaces.length === 0) {
            return;
          }
          
          // Notificar o componente pai sobre o resultado da busca
          if (onPlaceSearchResult) {
            onPlaceSearchResult({
              places: validPlaces,
              query: searchQuery,
              timestamp: Date.now()
            });
          }
          
          // For each place, get the icon, name and location
          const bounds = new google.maps.LatLngBounds();
          
          validPlaces.forEach((place) => {
            // Create a simple marker for each place
            new google.maps.Marker({
              map: mapInstance,
              title: place.name,
              position: place.geometry!.location
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
      
      {/* Não precisamos mais renderizar marcadores clusterizados */}
    </div>
  );
}
