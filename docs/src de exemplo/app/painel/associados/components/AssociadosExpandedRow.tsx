import React from 'react';
import { motion } from 'framer-motion';
import { Associado } from '@/types';
import { getEnderecoData } from '../utils/address-utils';
import { useEncarregadosPorAssociado } from '../hooks/useEncarregadosPorAssociado';
import { useEncarregadosFormatters } from '@/app/painel/encarregados/hooks/useEncarregadosFormatters';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Users, Phone, Mail, MapPin } from 'lucide-react';

interface AssociadosExpandedRowProps {
  associado: Associado;
}

/**
 * Componente para exibir conteúdo expandido de uma linha da tabela
 */
const AssociadosExpandedRow: React.FC<AssociadosExpandedRowProps> = ({ associado }) => {
  const { data: encarregados = [], isLoading: loadingEncarregados } = useEncarregadosPorAssociado(associado.id);
  const { formatName, getInitials } = useEncarregadosFormatters();

  return (
    <motion.div
      key={`expanded-${associado.id}`}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ 
        type: "spring",
        damping: 15,
        stiffness: 200,
        mass: 0.7,
        restDelta: 0.01,
        restSpeed: 0.1
      }}
      className="overflow-hidden"
    >
      <div className="px-4 pb-6 bg-background border border-t-0 border-primary/20 rounded-b-lg">
        <div className="grid grid-cols-12 gap-4">
          {/* Coluna vazia para alinhamento com chevron */}
          <div className="col-span-1"></div>
          
          {/* Foto do Associado - 5x maior */}
          <div className="col-span-2">
            <div className="flex justify-center pt-2">
              <Avatar className="h-32 w-32 ring-2 ring-primary ring-offset-2">
                <AvatarImage 
                  src={associado.foto || ''} 
                  className="object-cover object-center" 
                />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {associado.nome_completo.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          
          {/* Contatos - alinhada com Nome Completo */}
          <div className="col-span-2 space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Contatos
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <div>
                  <label className="text-xs font-medium text-muted-foreground block">Email:</label>
                  <p className="text-sm">{associado.email || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <div>
                  <label className="text-xs font-medium text-muted-foreground block">Telefone:</label>
                  <p className="text-sm">{associado.telefone || '-'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Lista de Encarregados Relacionados */}
          <div className="col-span-3 space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Encarregados ({encarregados.length})
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {loadingEncarregados ? (
                <p className="text-sm text-muted-foreground">Carregando...</p>
              ) : encarregados.length > 0 ? (
                encarregados.map((encarregado) => (
                  <div key={encarregado.id} className="flex items-center gap-2 p-2 bg-green-50/70 rounded border border-green-200/60">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={encarregado.foto_url || ''} className="object-cover" />
                      <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                        {getInitials(encarregado.nome_completo)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs truncate">{formatName(encarregado.nome_completo)}</p>
                      <p className="text-xs text-muted-foreground">Mat: {encarregado.matricula}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum encarregado vinculado</p>
              )}
            </div>
          </div>
          
          {/* Endereço - duas últimas colunas da direita */}
          <div className="col-span-2 space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Endereço
            </h4>
            <div className="space-y-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground block">Logradouro:</label>
                <p className="text-sm">{getEnderecoData(associado.endereco_data)?.logradouro || '-'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block">Número:</label>
                <p className="text-sm">{getEnderecoData(associado.endereco_data)?.numero || '-'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block">Complemento:</label>
                <p className="text-sm">{getEnderecoData(associado.endereco_data)?.complemento || '-'}</p>
              </div>
            </div>
          </div>
          
          {/* Mais informações de Endereço */}
          <div className="col-span-2 space-y-4">
            <h4 className="font-semibold text-lg invisible">.</h4> {/* Espaço invisível para alinhamento */}
            <div className="space-y-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground block">Bairro:</label>
                <p className="text-sm">{getEnderecoData(associado.endereco_data)?.bairro || '-'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block">Cidade-UF:</label>
                <p className="text-sm">
                  {(() => {
                    const endereco = getEnderecoData(associado.endereco_data);
                    return endereco?.cidade ? `${endereco.cidade} - ${endereco.uf || ''}`.trim() : '-';
                  })()}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block">CEP:</label>
                <p className="text-sm">{getEnderecoData(associado.endereco_data)?.cep || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AssociadosExpandedRow;
