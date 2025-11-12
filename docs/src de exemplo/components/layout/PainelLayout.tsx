'use client'

import React, { useEffect } from 'react';
import { Users, User, Wallet, Map } from 'lucide-react';
import log from '@/lib/logger';

// Imports estáticos
import { Sidebar } from './Sidebar';
import { MobileNavBar } from './MobileNavBar';
import { SidebarProvider } from './SidebarContext';

interface PainelLayoutProps {
  children: React.ReactNode;
}

export default function PainelLayout({ children }: PainelLayoutProps) {
  const componentId = Math.random().toString(36).substring(2, 8);
  
  log.info(`[PainelLayout:${componentId}] INICIALIZAÇÃO - Renderizando componente PainelLayout`);
  
  useEffect(() => {
    log.info(`[PainelLayout:${componentId}] Componente montado`);
    
    return () => {
      log.info(`[PainelLayout:${componentId}] Componente desmontado`);
    };
  }, [componentId]);
  
  // Links da sidebar - todos usando a cor amarela padrão
  const sidebarLinks = [
    {
      title: 'Associados',
      href: '/painel/associados',
      icon: Users,
      description: 'Gerenciar associados',
      color: 'yellow' as const
    },
    {
      title: 'Encarregados',
      href: '/painel/encarregados',
      icon: User,
      description: 'Gerenciar encarregados',
      color: 'yellow' as const
    },
    {
      title: 'Tesouraria',
      href: '/painel/painel-tesouraria',
      icon: Wallet,
      description: 'Acessar painel',
      color: 'yellow' as const
    },
    {
      title: 'Mapa de Áreas',
      href: '/painel/mapa-de-areas',
      icon: Map,
      description: 'Visualizar áreas',
      color: 'yellow' as const
    }
  ];

  log.info(`[PainelLayout:${componentId}] Renderizando layout com SidebarProvider`);
  
  return (
    <SidebarProvider>
      <>
        {/* Desktop Layout */}
        <div className='min-h-screen bg-tertiary hidden md:flex'>
          <Sidebar links={sidebarLinks} />

          {/* Main Content */}
          <div className='flex-1 flex flex-col'>
            {/* Page Content */}
            <div className="flex-1 w-full p-6">
              {children}
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className='min-h-screen bg-tertiary flex flex-col md:hidden'>
          <div className='flex-1 w-full p-6 pb-22'>
            {children}
          </div>
          <MobileNavBar />
        </div>
      </>
    </SidebarProvider>
  );
}
