'use client'

import React from 'react'
import { AreaMapContent } from './components/AreaMapContent'

export default function TesteRetornoApiPage() {
  // Console log para debug
  // eslint-disable-next-line no-console
  console.log('Renderizando página de Teste de API de Busca de Endereços');
  
  return (
    <div 
      className="h-[calc(100vh-4rem)] w-full" 
      style={{ 
        minHeight: '600px',
        display: 'flex',
        flexDirection: 'column'
      }}
      title="Visualizador de Retorno da API de Busca de Endereços"
    >
      <AreaMapContent />
    </div>
  )
}
