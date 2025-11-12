import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Loader2, Plus, X } from 'lucide-react';
import { useAreas } from '@/app/painel/mapa-de-areas/hooks/useAreas';
import { useVincularAssociadoAArea } from '../hooks/useVincularAssociadoAArea';
import { toast } from 'sonner';

interface AreaSelectorProps {
  associadoId: string;
  onVinculado?: (areaIds: string[]) => void;
}

export function AreaSelector({ associadoId, onVinculado }: AreaSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  
  const { areas = [], loading: loadingAreas } = useAreas();
  const { vincularArea, isLoading: isVinculando } = useVincularAssociadoAArea();
  
  // Filtra áreas pela busca
  const areasFiltradas = areas.filter(area =>
    area.codigo_singaerj.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.bairro?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.logradouro?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleArea = (areaId: string) => {
    setSelectedAreas(prev =>
      prev.includes(areaId)
        ? prev.filter(id => id !== areaId)
        : [...prev, areaId]
    );
  };

  const handleVincularAreas = async () => {
    if (selectedAreas.length === 0) return;
    
    try {
      // Vincula cada área selecionada
      for (const areaId of selectedAreas) {
        await new Promise<void>((resolve, reject) => {
          vincularArea(
            { associadoId, areaId },
            {
              onSuccess: () => resolve(),
              onError: (error) => reject(error)
            }
          );
        });
      }
      
      toast.success(`${selectedAreas.length} área(s) vinculada(s) com sucesso!`);
      const vinculatedIds = [...selectedAreas];
      setSelectedAreas([]);
      onVinculado?.(vinculatedIds);
      
    } catch (error: any) {
      toast.error(error.message || 'Erro ao vincular áreas');
    }
  };

  const getAreaDisplayName = (area: any) => {
    const parts = [];
    if (area.codigo_singaerj) parts.push(area.codigo_singaerj);
    if (area.logradouro) parts.push(area.logradouro);
    if (area.numero) parts.push(area.numero);
    return parts.join(' - ') || 'Área sem nome';
  };

  if (loadingAreas) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Carregando áreas...</span>
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
          placeholder="Buscar área por código, bairro ou logradouro..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Áreas selecionadas */}
      {selectedAreas.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Áreas Selecionadas ({selectedAreas.length})</p>
          <div className="flex flex-wrap gap-2">
            {selectedAreas.map(areaId => {
              const area = areas.find(a => a.id.toString() === areaId);
              return (
                <Badge
                  key={areaId}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {area ? getAreaDisplayName(area) : areaId}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => toggleArea(areaId)}
                  />
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Lista de áreas */}
      <div className="max-h-48 overflow-y-auto space-y-2">
        {areasFiltradas.length === 0 ? (
          <div className="text-center py-4 text-sm text-muted-foreground">
            {searchTerm ? 'Nenhuma área encontrada' : 'Nenhuma área disponível'}
          </div>
        ) : (
          areasFiltradas.slice(0, 20).map((area) => { // Limita a 20 para performance
            const areaId = area.id.toString();
            const isSelected = selectedAreas.includes(areaId);
            
            return (
              <div
                key={area.id}
                className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-orange-50 border-orange-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => toggleArea(areaId)}
              >
                <div className="flex-shrink-0">
                  {isSelected ? (
                    <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                      <Plus className="w-3 h-3 text-white rotate-45" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 border border-gray-300 rounded-full" />
                  )}
                </div>
                <MapPin className="h-4 w-4 text-orange-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{getAreaDisplayName(area)}</p>
                  <p className="text-xs text-muted-foreground">
                    {area.bairro && `Bairro: ${area.bairro}`}
                    {area.vagas && ` • ${area.vagas} vagas`}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Botão de vinculação */}
      <Button
        onClick={handleVincularAreas}
        disabled={selectedAreas.length === 0 || isVinculando}
        className="w-full"
      >
        {isVinculando ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Vinculando áreas...
          </>
        ) : (
          <>
            <MapPin className="mr-2 h-4 w-4" />
            Vincular {selectedAreas.length} Área(s)
          </>
        )}
      </Button>
    </div>
  );
}
