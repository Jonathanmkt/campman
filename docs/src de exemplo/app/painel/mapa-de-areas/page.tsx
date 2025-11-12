'use client'

import React from 'react'
import { AreaMapContent } from './components/AreaMapContent'

export default function MapaDeAreasPage() {
  // Console log para debug
  // eslint-disable-next-line no-console
  console.log('Renderizando página MapaDeAreasPage');
  
  return (
    <div 
      className="h-[calc(100vh-4rem)] w-full" 
      style={{ 
        minHeight: '600px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <AreaMapContent />
    </div>
  )
}
