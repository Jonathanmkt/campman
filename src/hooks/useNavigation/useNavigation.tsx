'use client'

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Users, MapPin, Calendar } from 'lucide-react';

// Define os tipos para as tabs
type TabType = 'eleitores' | 'liderancas' | 'areas';

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ElementType;
  path: string;
}

export function useNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  // Define os itens de navegação
  const navItems = useMemo<NavItem[]>(() => [
    { id: 'eleitores', label: 'Eleitores', icon: Users, path: '/dashboard/eleitores' },
    { id: 'liderancas', label: 'Lideranças', icon: Calendar, path: '/dashboard/liderancas' },
    { id: 'areas', label: 'Áreas', icon: MapPin, path: '/dashboard/areas' },
  ], []);

  // Lista de tabs disponíveis na ordem que aparecem
  const tabs: TabType[] = ['eleitores', 'liderancas', 'areas'];

  // Redireciona para a URL do primeiro botão quando estiver na rota raiz
  useEffect(() => {
    if (pathname === '/dashboard') {
      // Não redireciona automaticamente, mantém na página principal
    }
  }, [pathname, router, navItems]);

  // Determina qual tab está ativa baseado na URL
  const activeTab = pathname === '/dashboard' 
    ? null // Nenhuma tab ativa na página principal
    : pathname.includes('/eleitores')
    ? 'eleitores'
    : pathname.includes('/liderancas')
    ? 'liderancas'
    : pathname.includes('/areas')
    ? 'areas'
    : null;

  const handleTabChange = (tab: TabType) => {
    if (tab === 'eleitores') {
      router.push('/dashboard/eleitores');
    } else if (tab === 'liderancas') {
      router.push('/dashboard/liderancas');
    } else if (tab === 'areas') {
      router.push('/dashboard/areas');
    }
  };

  return {
    navItems,
    tabs,
    activeTab,
    handleTabChange,
    pathname
  };
}
