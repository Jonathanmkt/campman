'use client'

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Associado } from '@/types';

// Tipos para o contexto
interface AssociadosContextType {
  // Estado
  expandedRowId: string | null;
  selectedAssociado: Associado | null;
  isCrachaModalOpen: boolean;
  
  // Ações
  toggleRow: (id: string) => void;
  handleDropdownAction: (action: 'cracha' | 'mensalidades', associado: Associado) => void;
  closeCrachaModal: () => void;
  
  // Debug
  logAction: (message: string) => void;
}

// Criando o contexto com valor default
const AssociadosContext = createContext<AssociadosContextType | undefined>(undefined);

// Hook personalizado para usar o contexto
export const useAssociados = () => {
  const context = useContext(AssociadosContext);
  if (!context) {
    throw new Error('useAssociados deve ser usado dentro de um AssociadosProvider');
  }
  return context;
};

// Props do provider
interface AssociadosProviderProps {
  children: ReactNode;
}

// Componente Provider
export const AssociadosProvider = ({ children }: AssociadosProviderProps) => {
  // Estados
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [selectedAssociado, setSelectedAssociado] = useState<Associado | null>(null);
  const [isCrachaModalOpen, setIsCrachaModalOpen] = useState(false);
  
  // Ações
  const toggleRow = useCallback((id: string) => {
    console.log(`[LINHA] Clique na linha do associado ${id} - Estado atual: ${expandedRowId === id ? 'EXPANDIDO → COLAPSANDO' : 'COLAPSADO → EXPANDINDO'}`);
    setExpandedRowId(prevId => (prevId === id ? null : id));
  }, [expandedRowId]);
  
  const handleDropdownAction = useCallback((action: 'cracha' | 'mensalidades', associado: Associado) => {
    console.log(`[DROPDOWN] Ação ${action} selecionada para associado ${associado.id}`);
    
    if (action === 'cracha') {
      setSelectedAssociado(associado);
      setIsCrachaModalOpen(true);
    } else if (action === 'mensalidades') {
      // Implementar lógica de mensalidades
      console.log(`Abrindo mensalidades para ${associado.nome_completo}`);
      // Aqui poderia navegar para uma rota de mensalidades, por exemplo
    }
  }, []);
  
  const closeCrachaModal = useCallback(() => {
    setIsCrachaModalOpen(false);
    setSelectedAssociado(null);
  }, []);
  
  const logAction = useCallback((message: string) => {
    console.log(message);
  }, []);
  
  // Valor do contexto
  const value = {
    expandedRowId,
    selectedAssociado,
    isCrachaModalOpen,
    toggleRow,
    handleDropdownAction,
    closeCrachaModal,
    logAction
  };
  
  return (
    <AssociadosContext.Provider value={value}>
      {children}
    </AssociadosContext.Provider>
  );
};
