import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Loader2, Plus, X } from 'lucide-react';
import { useEncarregadosData } from '@/app/painel/encarregados/hooks/useEncarregadosData';
import { useEncarregadosFormatters } from '@/app/painel/encarregados/hooks/useEncarregadosFormatters';
import { useVincularAssociadoAEncarregado } from '../hooks/useVincularAssociadoAEncarregado';
import { toast } from 'sonner';

interface EncarregadoSelectorProps {
  associadoId: string;
  onVinculado?: (encarregadoIds: string[]) => void;
}

export function EncarregadoSelector({ associadoId, onVinculado }: EncarregadoSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEncarregados, setSelectedEncarregados] = useState<string[]>([]);
  
  const { data: encarregados = [], isLoading: loadingEncarregados } = useEncarregadosData();
  const { formatName, getInitials } = useEncarregadosFormatters();
  const { vincularEncarregado, isLoading: isVinculando } = useVincularAssociadoAEncarregado();
  
  // Filtra encarregados pela busca
  const encarregadosFiltrados = encarregados.filter(encarregado =>
    formatName(encarregado.nome_completo).toLowerCase().includes(searchTerm.toLowerCase()) ||
    encarregado.matricula.toString().includes(searchTerm)
  );

  const toggleEncarregado = (encarregadoId: string) => {
    setSelectedEncarregados(prev =>
      prev.includes(encarregadoId)
        ? prev.filter(id => id !== encarregadoId)
        : [...prev, encarregadoId]
    );
  };

  const handleVincularEncarregados = async () => {
    if (selectedEncarregados.length === 0) return;
    
    try {
      // Vincula cada encarregado selecionado
      for (const encarregadoId of selectedEncarregados) {
        await new Promise<void>((resolve, reject) => {
          vincularEncarregado(
            { encarregadoId, associadoId },
            {
              onSuccess: () => resolve(),
              onError: (error) => reject(error)
            }
          );
        });
      }
      
      toast.success(`${selectedEncarregados.length} encarregado(s) vinculado(s) com sucesso!`);
      const vinculatedIds = [...selectedEncarregados];
      setSelectedEncarregados([]);
      onVinculado?.(vinculatedIds);
      
    } catch (error: any) {
      toast.error(error.message || 'Erro ao vincular encarregados');
    }
  };

  if (loadingEncarregados) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Carregando encarregados...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Campo de busca */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar encarregado por nome ou matrícula..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Encarregados selecionados */}
      {selectedEncarregados.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Encarregados Selecionados ({selectedEncarregados.length})</p>
          <div className="flex flex-wrap gap-2">
            {selectedEncarregados.map(encarregadoId => {
              const encarregado = encarregados.find(e => e.id === encarregadoId);
              return (
                <Badge
                  key={encarregadoId}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {encarregado ? formatName(encarregado.nome_completo) : encarregadoId}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => toggleEncarregado(encarregadoId)}
                  />
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Lista de encarregados */}
      <div className="max-h-48 overflow-y-auto space-y-2">
        {encarregadosFiltrados.length === 0 ? (
          <div className="text-center py-4 text-sm text-muted-foreground">
            {searchTerm ? 'Nenhum encarregado encontrado' : 'Nenhum encarregado disponível'}
          </div>
        ) : (
          encarregadosFiltrados.map((encarregado) => {
            const encarregadoId = encarregado.id;
            const isSelected = selectedEncarregados.includes(encarregadoId);
            
            return (
              <div
                key={encarregado.id}
                className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-blue-50 border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => toggleEncarregado(encarregadoId)}
              >
                <div className="flex-shrink-0">
                  {isSelected ? (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Plus className="w-3 h-3 text-white rotate-45" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 border border-gray-300 rounded-full" />
                  )}
                </div>
                <Avatar className="h-10 w-10 ring-1 ring-blue-500/30 ring-offset-1">
                  <AvatarImage src={encarregado.foto_url || ''} className="object-cover" />
                  <AvatarFallback>
                    {getInitials(encarregado.nome_completo)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{formatName(encarregado.nome_completo)}</p>
                  <p className="text-xs text-muted-foreground">Mat: {encarregado.matricula}</p>
                  <p className="text-xs text-muted-foreground">DRT: {encarregado.drt}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Botão de vinculação */}
      <Button
        onClick={handleVincularEncarregados}
        disabled={selectedEncarregados.length === 0 || isVinculando}
        className="w-full"
      >
        {isVinculando ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Vinculando encarregados...
          </>
        ) : (
          <>
            <Users className="mr-2 h-4 w-4" />
            Vincular {selectedEncarregados.length} Encarregado(s)
          </>
        )}
      </Button>
    </div>
  );
}
