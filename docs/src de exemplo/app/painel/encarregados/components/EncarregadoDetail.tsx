import React, { useState } from 'react';
import { Encarregado } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Plus, Loader2 } from 'lucide-react';
import { useGuardadoresPorEncarregado } from '../hooks/useAssociadosPorEncarregado';
import { useAssociadoSearch } from '../hooks/useAssociadoSearch';
import { useVincularAssociado } from '../hooks/useVincularAssociado';
import { useDesvincularAssociado } from '../hooks/useDesvincularAssociado';
import { useEncarregadosFormatters } from '../hooks/useEncarregadosFormatters';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface EncarregadoDetailProps {
  encarregado: Encarregado | null;
}

export function EncarregadoDetail({ encarregado }: EncarregadoDetailProps) {
  const [selectedAssociado, setSelectedAssociado] = useState<{
    id: string;
    matricula: number;
    nome_completo: string;
    cpf: string;
    foto: string | null;
  } | null>(null);
  const { formatName, getInitials } = useEncarregadosFormatters();
  
  // Buscar guardadores relacionados ao encarregado
  const { data: guardadores = [], isLoading } = useGuardadoresPorEncarregado(encarregado?.id);
  
  // Hook para busca de associados
  const { searchTerm, setSearchTerm, associados, isLoading: isSearching } = useAssociadoSearch();
  
  // Hook para vincular associado
  const { vincularAssociado, isLoading: isVinculando, error: errorVinculacao, isSuccess, reset } = useVincularAssociado();
  
  // Hook para desvincular associado
  const { 
    desvincularAssociado, 
    isLoading: isDesvinculando, 
    error: errorDesvinculacao, 
    isSuccess: isSuccessDesvinculacao, 
    reset: resetDesvinculacao 
  } = useDesvincularAssociado();
  
  // Handler para vincular associado
  const handleVincularAssociado = () => {
    if (!encarregado) {
      toast.error('Nenhum encarregado selecionado');
      return;
    }
    
    if (!selectedAssociado) {
      toast.error('Nenhum associado selecionado para vinculação');
      return;
    }
    
    vincularAssociado({
      encarregadoId: encarregado.id,
      associadoId: selectedAssociado.id
    });
  };
  
  // Handler para desvincular associado
  const handleDesvincularAssociado = (associadoId: string) => {
    if (!encarregado) {
      toast.error('Nenhum encarregado selecionado');
      return;
    }
    
    if (window.confirm('Tem certeza que deseja desvincular este guardador?')) {
      desvincularAssociado({
        encarregadoId: encarregado.id,
        associadoId: associadoId
      });
    }
  };
  
  // Efeito para mostrar mensagens de sucesso/erro
  React.useEffect(() => {
    if (isSuccess) {
      toast.success('Associado vinculado com sucesso!');
      setSelectedAssociado(null);
      setSearchTerm('');
      reset();
    }
  }, [isSuccess, reset, setSearchTerm]);
  
  React.useEffect(() => {
    if (errorVinculacao) {
      toast.error(errorVinculacao.message);
    }
  }, [errorVinculacao]);
  
  React.useEffect(() => {
    if (isSuccessDesvinculacao) {
      toast.success('Guardador desvinculado com sucesso!');
      resetDesvinculacao();
    }
  }, [isSuccessDesvinculacao, resetDesvinculacao]);
  
  React.useEffect(() => {
    if (errorDesvinculacao) {
      toast.error(errorDesvinculacao.message);
    }
  }, [errorDesvinculacao]);

  if (!encarregado) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Selecione um encarregado para ver os detalhes
      </div>
    );
  }

  // Calcular o progresso do estoque (valor mockado por agora)
  const progressoEstoque = Math.round((120 / 150) * 100);

  return (
    <div className="h-full flex flex-col gap-4 min-h-0">
      {/* Quadrante Superior Unificado: Card do Enc. de Pessoal + Métricas */}
      <div className="border rounded-lg p-6 bg-white h-1/2">
        <div className="flex items-start space-x-6 mb-6">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-full border-4 border-green-500/20 -m-1"></div>
            <Avatar className="h-32 w-32 ring-4 ring-green-500/20 ring-offset-2 ring-offset-white">
              <AvatarImage src={encarregado.foto_url || ''} className="object-cover" />
              <AvatarFallback className="text-2xl">
                {getInitials(encarregado.nome_completo)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-2xl font-medium mb-3">{formatName(encarregado.nome_completo)}</h4>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <p><span className="font-medium">DRT:</span> {encarregado.drt || 'N/A'}</p>
              <p><span className="font-medium">Matrícula:</span> {encarregado.matricula}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{guardadores.length}</div>
              <div className="text-sm text-muted-foreground">Guardadores</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">120</div>
              <div className="text-sm text-muted-foreground">Estoque Atual</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">85</div>
              <div className="text-sm text-muted-foreground">Compras no mês</div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progresso do Estoque</span>
              <span>120 / 150</span>
            </div>
            <Progress value={progressoEstoque} className="h-3" />
          </div>
        </div>
      </div>

      {/* Quadrantes Inferiores */}
      <div className="flex gap-4 h-1/2">
        {/* Quadrante Inferior Esquerdo: Busca e Vinculação de Guardador */}
        <div className="w-1/2 border rounded-lg p-4 flex flex-col bg-white">
          <h3 className="text-lg font-semibold mb-4">Vincular Guardador</h3>
          
          {/* Campo de busca fixo */}
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome ou matrícula..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Área de resultados com altura fixa e scroll */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto space-y-2 min-h-0" style={{ maxHeight: 'calc(100% - 60px)' }}>
              {isSearching && searchTerm.length >= 3 && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2 text-sm text-muted-foreground">Buscando...</span>
                </div>
              )}
              
              {!isSearching && searchTerm.length >= 3 && associados.length === 0 && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  Nenhum associado encontrado
                </div>
              )}
              
              {associados.map((associado) => (
                <div 
                  key={associado.id}
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedAssociado?.id === associado.id 
                      ? 'bg-green-50 border-green-200' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedAssociado(associado)}
                >
                  <Avatar className="h-10 w-10 flex-shrink-0 ring-1 ring-green-500/30 ring-offset-1">
                    <AvatarImage src={associado.foto || ''} className="object-cover" />
                    <AvatarFallback>
                      {getInitials(associado.nome_completo)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{formatName(associado.nome_completo)}</p>
                    <p className="text-xs text-muted-foreground">Mat: {associado.matricula}</p>
                    <p className="text-xs text-muted-foreground">CPF: {associado.cpf}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Botão de vinculação fixo na parte inferior */}
            <div className="pt-4 flex-shrink-0">
              <Button 
                onClick={handleVincularAssociado}
                disabled={!selectedAssociado || isVinculando}
                className="w-full"
              >
                {isVinculando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Vinculando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Vincular Guardador
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Quadrante Inferior Direito: Lista de Guardadores */}
        <div className="w-1/2 border rounded-lg p-4 flex flex-col bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Guardadores de {formatName(encarregado.nome_completo.split(' ')[0])}
            </h3>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {guardadores.length}
            </Badge>
          </div>
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4 p-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : guardadores.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                <Users className="h-12 w-12 mb-4 opacity-50" />
                <p>Nenhum guardador encontrado</p>
                <p className="text-sm text-muted-foreground/70">Vincule um guardador usando o painel ao lado</p>
              </div>
            ) : (
              <div className="space-y-2">
                {guardadores.map((guardador, index) => (
                  <div key={guardador.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                    <div className="flex-shrink-0 w-6 text-center">
                      <span className="text-xs font-medium text-muted-foreground">{index + 1}</span>
                    </div>
                    <Avatar className="h-10 w-10 ring-1 ring-green-500/30 ring-offset-1">
                      {guardador.foto ? (
                        <AvatarImage 
                          src={guardador.foto} 
                          alt={guardador.nome_completo}
                          className="object-cover"
                        />
                      ) : (
                        <AvatarFallback>
                          {getInitials(guardador.nome_completo)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{formatName(guardador.nome_completo)}</p>
                      <p className="text-xs text-muted-foreground">Mat: {guardador.matricula}</p>
                    </div>
                    <button 
                      className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDesvincularAssociado(guardador.id);
                      }}
                      disabled={isDesvinculando}
                      title="Remover vinculação"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
