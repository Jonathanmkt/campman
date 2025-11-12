'use client'

import React from 'react';
import { CreditCard, Wallet } from 'lucide-react';
import {
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { Associado } from '@/types';

interface AssociadoDropdownMenuProps {
  associado: Associado;
  onCrachaClick: (associado: Associado) => void;
  onMensalidadesClick: (associado: Associado) => void;
}

export const AssociadoDropdownMenu: React.FC<AssociadoDropdownMenuProps> = ({
  associado,
  onCrachaClick,
  onMensalidadesClick
}) => {
  return (
    <DropdownMenuContent align="end" className="w-48">
      <DropdownMenuItem onClick={() => {
        console.log(`[MENU] Clique na opção Crachá do associado ${associado.id}`);
        onCrachaClick(associado);
      }}>
        <CreditCard className="mr-2 h-4 w-4 text-primary" />
        <span>Crachá</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => {
        console.log(`[MENU] Clique na opção Mensalidades do associado ${associado.id}`);
        onMensalidadesClick(associado);
      }}>
        <Wallet className="mr-2 h-4 w-4 text-primary" />
        <span>Mensalidades</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
};
