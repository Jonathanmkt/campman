'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';

type SidebarContextType = {
  collapsed: boolean;
  isClosing: boolean;
  animationStage: number;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [animationStage, setAnimationStage] = useState(0);

  const handleMouseEnter = () => {
    setIsClosing(false);
    setCollapsed(false);
  };

  const handleMouseLeave = () => {
    // Iniciar primeira etapa do fechamento - rápida
    setIsClosing(true);
    setAnimationStage(1);
    
    // Agendar segunda etapa (lenta) quando a sidebar atingir 81px de largura (199px percorridos)
    setTimeout(() => {
      setAnimationStage(2);
    }, 199); // 199px percorridos em velocidade menos rápida (0.22s)
    
    // Define como colapsado para alterar a interface
    setCollapsed(true);
  };

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        isClosing,
        animationStage,
        handleMouseEnter,
        handleMouseLeave,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
