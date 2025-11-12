'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, MoreVertical } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Associado } from '@/types';
import AssociadosExpandedRow from './AssociadosExpandedRow';
import useFormatters from '../hooks/useFormatters';
import { AssociadoDropdownMenu } from './AssociadoDropdownMenu';
import { useAssociados } from '../store';
import { useAssociadoAreas } from '../hooks/useAssociadoAreas';
// CrachaModal é renderizado no Context Provider
import {
  DropdownMenu,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface AssociadosTableRowProps {
  associado: Associado;
}

/**
 * Componente de linha da tabela de associados
 */
const AssociadosTableRow: React.FC<AssociadosTableRowProps> = ({ associado }) => {
  const { 
    expandedRowId, 
    toggleRow, 
    handleDropdownAction,
    // Removidas variáveis não utilizadas
    logAction
  } = useAssociados();
  
  const isExpanded = expandedRowId === associado.id;
  const { formatName, getInitials } = useFormatters();

  return (
    <motion.div
      key={associado.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative"
    >
      {/* Row principal */}
      <div className={`bg-background transition-all duration-200 ${isExpanded ? 'rounded-t-lg border-t border-l border-r border-primary/20' : 'border border-primary/20 rounded-lg hover:bg-gray-100/80'}`}>
        <div 
          className="grid grid-cols-12 gap-3 px-4 py-4 items-center cursor-pointer"
          onClick={() => toggleRow(associado.id)}
        >
          {/* Chevron */}
          <div className="col-span-1 pr-0">
            <button className="p-1 hover:bg-primary/10 rounded-full transition-colors">
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          </div>

          {/* Avatar */}
          <div className="col-span-1 pl-0">
            <Avatar className="h-11 w-11 ring-2 ring-primary ring-offset-2">
              <AvatarImage src={associado.foto} alt={associado.nome_completo} />
              <AvatarFallback className="text-xs">
                {getInitials(associado.nome_completo)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Nome Completo com Tooltip */}
          <div className="col-span-2 text-sm font-medium">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="truncate">
                    {formatName(associado.nome_completo)}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p>{associado.nome_completo}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Matrícula com Tooltip */}
          <div className="col-span-2 text-sm text-muted-foreground">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="truncate">
                    {associado.matricula}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Matrícula: {associado.matricula}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* DRT com Tooltip */}
          <div className="col-span-2 text-sm text-muted-foreground">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="truncate">
                    {associado.drt}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>DRT: {associado.drt}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Bairro com Tooltip */}
          <div className="col-span-2 text-sm text-muted-foreground">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="truncate">
                    <AssociadoBairros associadoId={associado.id} />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <AssociadoBairrosTooltip associadoId={associado.id} />
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Mensalidades */}
          <div className="col-span-1">
            {associado.inadimplente ? (
              <Badge variant="destructive" className="text-xs">
                Inadimplente
              </Badge>
            ) : (
              <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-600">
                Em dia
              </Badge>
            )}
          </div>

          {/* Ações - usando componentes da UI diretamente */}
          <div className="col-span-1 relative">
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      logAction(`[KEBAB] Clique no botão kebab do associado ${associado.id}`);
                      e.stopPropagation();
                    }}
                  >
                    <span className="sr-only">Abrir menu</span>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <AssociadoDropdownMenu 
                  associado={associado} 
                  onCrachaClick={() => handleDropdownAction('cracha', associado)} 
                  onMensalidadesClick={() => handleDropdownAction('mensalidades', associado)} 
                />
              </DropdownMenu>
            </div>
          </div>
        </div>

      </div>
      
      {/* Área expandida */}
      <AnimatePresence>
        {isExpanded && (
          <AssociadosExpandedRow 
            associado={associado}
          />
        )}
      </AnimatePresence>
      
      {/* Modal de crachá é renderizado no context provider */}
    </motion.div>
  );
};

/**
 * Componente para exibir os bairros de um associado
 */
const AssociadoBairros: React.FC<{ associadoId: string }> = ({ associadoId }) => {
  const { data: bairros = [], isLoading } = useAssociadoAreas(associadoId);

  if (isLoading) {
    return <span className="text-muted-foreground/70">Carregando...</span>;
  }

  if (bairros.length === 0) {
    return <span className="text-muted-foreground/70">Não vinculado</span>;
  }

  // Limita a exibição a 2 bairros com "..." se houver mais
  if (bairros.length > 2) {
    return <span>{bairros.slice(0, 2).join(', ')} ...</span>;
  }

  return <span>{bairros.join(', ')}</span>;
};

/**
 * Componente para exibir todos os bairros de um associado no tooltip
 */
const AssociadoBairrosTooltip: React.FC<{ associadoId: string }> = ({ associadoId }) => {
  const { data: bairros = [], isLoading } = useAssociadoAreas(associadoId);

  if (isLoading) {
    return <span>Carregando áreas...</span>;
  }

  if (bairros.length === 0) {
    return <span>Associado não vinculado a nenhuma área</span>;
  }

  return (
    <div className="space-y-1">
      <p className="font-medium">Áreas vinculadas:</p>
      <ul className="list-disc pl-4 space-y-0.5">
        {bairros.map((bairro, index) => (
          <li key={index}>{bairro}</li>
        ))}
      </ul>
    </div>
  );
};

export default AssociadosTableRow;
