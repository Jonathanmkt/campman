'use client'

import React from 'react';
import { Users, Calendar, MapPin, Home, UserCheck, FolderKanban, Settings } from 'lucide-react';

// Imports estáticos
import { Sidebar } from './Sidebar';
import { SidebarProvider } from './SidebarContext';
import { useCampanha } from '@/hooks/useCampanha';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: userCampanha } = useCampanha();

  const isAdmin =
    userCampanha?.membroRole === 'admin' ||
    userCampanha?.roles?.includes('admin');

  // Links da sidebar — usando cor yellow como padrão
  const sidebarLinks = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      description: 'Página inicial',
      color: 'yellow' as const
    },
    {
      title: 'Eleitores',
      href: '/dashboard/eleitores',
      icon: Users,
      description: 'Gerenciar eleitores',
      color: 'yellow' as const
    },
    {
      title: 'Lideranças',
      href: '/dashboard/liderancas',
      icon: Calendar,
      description: 'Gerenciar lideranças',
      color: 'yellow' as const
    },
    {
      title: 'Áreas',
      href: '/dashboard/areas',
      icon: MapPin,
      description: 'Gerenciar áreas',
      color: 'yellow' as const
    },
    {
      title: 'Colaboradores',
      href: '/dashboard/colaboradores',
      icon: UserCheck,
      description: 'Gerenciar colaboradores',
      color: 'yellow' as const
    },
    {
      title: 'Gestão de Projetos',
      href: '/dashboard/gestao-projetos',
      icon: FolderKanban,
      description: 'Projetos e tarefas',
      color: 'blue' as const
    },
    // Link de configurações — visível apenas para admin
    ...(isAdmin
      ? [
        {
          title: 'Configurações',
          href: '/dashboard/configuracoes',
          icon: Settings,
          description: 'Configurações da campanha',
          color: 'default' as const,
        },
      ]
      : []),
  ];

  return (
    <SidebarProvider>
      <div className='min-h-screen bg-tertiary flex'>
        <Sidebar links={sidebarLinks} />

        {/* Main Content */}
        <div className='flex-1 flex flex-col'>
          {/* Page Content */}
          <div className="flex-1 w-full p-6">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
