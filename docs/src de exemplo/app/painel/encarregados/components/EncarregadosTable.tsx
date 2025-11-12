import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Encarregado } from '@/types';
import { useEncarregadosFormatters } from '../hooks/useEncarregadosFormatters';

interface EncarregadosTableProps {
  encarregados: Encarregado[];
  isLoading: boolean;
  onEncarregadoClick?: (encarregado: Encarregado) => void;
  encarregadoSelecionadoId?: string;
}

const EncarregadosTable: React.FC<EncarregadosTableProps> = ({ 
  encarregados, 
  isLoading,
  onEncarregadoClick,
  encarregadoSelecionadoId
}) => {
  const { formatName, getInitials } = useEncarregadosFormatters();

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {encarregados.map((encarregado) => {
        const isSelected = encarregado.id === encarregadoSelecionadoId;
        return (
          <motion.div
            key={encarregado.id}
            className={`flex items-center p-3 rounded-lg transition-all cursor-pointer ${
              isSelected 
                ? 'bg-green-50 border border-green-200 shadow-md' 
                : 'bg-white hover:bg-gray-50 shadow-sm hover:shadow-md'
            }`}
            whileHover={{ scale: isSelected ? 1 : 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onEncarregadoClick?.(encarregado)}
          >
            <div className="flex-shrink-0">
              <Avatar className={`${isSelected ? 'ring-2 ring-green-500 ring-offset-2' : 'ring-1 ring-green-500/30 ring-offset-1'}`}>
                {encarregado.foto_url && (
                  <AvatarImage 
                    src={encarregado.foto_url} 
                    alt={encarregado.nome_completo}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className={`${
                  isSelected ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700'
                }`}>
                  {getInitials(encarregado.nome_completo || '')}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="ml-4 overflow-hidden">
              <p className={`text-sm font-medium truncate ${
                isSelected ? 'text-green-700' : 'text-gray-900'
              }`}>
                {formatName(encarregado.nome_completo)}
              </p>
              <p className="text-xs text-gray-500">Matrícula: {encarregado.matricula}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default EncarregadosTable;
