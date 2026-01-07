import { Users, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  hasFilters: boolean;
  hasSearch: boolean;
  filtrosAtivos: number;
  onLimparFiltros: () => void;
}

export function EmptyState({ hasFilters, hasSearch, filtrosAtivos, onLimparFiltros }: EmptyStateProps) {
  if (hasFilters || hasSearch) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-6">
        <Filter className="h-16 w-16 text-amber-500 mb-4" />
        <p className="text-base text-foreground font-medium">
          Nenhum resultado encontrado
        </p>
        <p className="text-sm text-muted-foreground mt-2 mb-4">
          {hasSearch && filtrosAtivos > 0
            ? 'Tente ajustar sua busca ou remover alguns filtros'
            : hasSearch
            ? 'Tente usar outros termos de busca'
            : 'Tente ajustar ou remover alguns filtros'}
        </p>
        {filtrosAtivos > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onLimparFiltros}
            className="mt-2"
          >
            <X className="h-4 w-4 mr-2" />
            Limpar filtros
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <Users className="h-16 w-16 text-muted-foreground mb-4" />
      <p className="text-base text-muted-foreground font-medium">
        Nenhuma liderança cadastrada ainda
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        Toque no botão + para adicionar
      </p>
    </div>
  );
}
