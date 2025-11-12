'use client'

import React from 'react';
import GoogleMap, { PlaceSearchResult } from './GoogleMap';

interface MapContainerProps {
  onMapReady?: (map: google.maps.Map) => void;
  onCenterChanged?: (center: { lat: number; lng: number }) => void;
  onPlaceSearchResult?: (result: PlaceSearchResult) => void;
}

export function MapContainer({ onMapReady, onCenterChanged, onPlaceSearchResult }: MapContainerProps) {
  // Console log para debug
  console.log('Renderizando MapContainer');
  
  return (
    <div className="h-full w-full" style={{ minHeight: '400px', position: 'relative' }}>
      <GoogleMap 
        className="h-full w-full rounded-lg"
        onMapReady={onMapReady}
        onCenterChanged={onCenterChanged}
        onPlaceSearchResult={onPlaceSearchResult}
      />
    </div>
  )
}
