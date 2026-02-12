'use client'

import React from 'react';
import { motion as m } from 'framer-motion';
const motion = m;
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useSidebar } from './SidebarContext';
import { useNavigation } from '@/hooks/useNavigation/useNavigation';
import { LucideIcon } from 'lucide-react';
import { UserProfile } from './UserProfile';

interface SidebarLink {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  color?: 'default' | 'amber' | 'blue' | 'yellow';
}

interface SidebarProps {
  links: SidebarLink[];
}

export function Sidebar({ links }: SidebarProps) {
  const { collapsed, animationStage, handleMouseEnter, handleMouseLeave } = useSidebar();
  const { pathname: currentPathname } = useNavigation();

  // Função para manter sidebar expandida durante interação com UserProfile
  const handleUserProfileInteraction = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <motion.div
      className="bg-primary flex flex-col relative"
      {...(collapsed ? 
        // Fechamento em duas etapas com velocidades diferentes
        {
          initial: { width: 280 },
          animate: { width: animationStage === 1 ? 81 : 80 },
          transition: {
            duration: animationStage === 1 ? 0.22 : 0.5, // Primeira etapa 20% menos rápida
            ease: "linear"
          }
        } : {
          initial: { width: 80 },
          animate: { width: 280 },
          transition: {
            type: 'spring',
            stiffness: 120,
            damping: 18
          }
        }
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Logo e título - Altura fixa */}
      <div className='h-24 px-3 pt-3'>
        <div className={`flex ${collapsed ? 'justify-center' : 'items-center gap-4'} pt-0 w-full`}>
          {collapsed ? (
            <div className="flex justify-center items-center">
              <div className="w-[52px] h-[52px] rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-xl font-bold text-primary-foreground">TM</span>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-shrink-0">
                <div className="w-[64px] h-[64px] rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-foreground">TM</span>
                </div>
              </div>
              <motion.div 
                className="overflow-hidden flex-1"
                {...(collapsed ? 
                  {
                    initial: { width: 180 },
                    animate: { width: animationStage === 1 ? 0 : 0 },
                    transition: {
                      duration: animationStage === 1 ? 0.22 : 0.5,
                      ease: "linear"
                    }
                  } : {
                    initial: { width: 0 },
                    animate: { width: 180 },
                    transition: {
                      type: 'spring',
                      stiffness: 120,
                      damping: 18
                    }
                  }
                )}
              >
                <div className="w-[180px] flex flex-col whitespace-nowrap">
                  <h1 className='text-2xl font-bold text-primary-foreground leading-tight mb-1'>
                    Thiago Moura
                  </h1>
                  <span className='text-sm text-primary-foreground leading-tight'>Campanha 2026</span>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Navegação - Todos os cards padronizados */}
      <div className="flex-grow flex flex-col px-3 pt-4 space-y-[1.125rem]">
        {links.map((link, index) => {
          return (
            <motion.div
              key={index}
              className={cn(
                'p-3 rounded-lg cursor-pointer',
                'hover:bg-white/40',
                'transition-colors duration-200',
                'flex items-center',
                currentPathname === link.href && 'bg-white/15'
              )}
            >
              <Link href={link.href} className="flex items-center w-full">
                <div className={`flex items-center ${collapsed ? 'justify-center w-full' : 'gap-3'}`}>
                  <link.icon className="w-5 h-5 text-white" />
                  {!collapsed && (
                    <p className="text-base font-semibold text-white tracking-wide">
                      {link.title}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* UserProfile na parte inferior */}
      <div 
        className="px-3 pb-4 mt-6"
        onMouseEnter={handleUserProfileInteraction}
        onClick={handleUserProfileInteraction}
      >
        {collapsed ? (
          // Modo colapsado - apenas avatar
          <div className="flex justify-center">
            <UserProfile collapsed={true} />
          </div>
        ) : (
          // Modo expandido - componente completo
          <div className="w-full">
            <UserProfile collapsed={false} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
