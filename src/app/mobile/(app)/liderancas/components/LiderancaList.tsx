import { Users } from 'lucide-react';
import type { Tables } from '@/types';
import { EmptyState } from './EmptyState';
import { LiderancaCard } from './LiderancaCard';

export type Lideranca = Tables<'lideranca'> & {
  convite_status?: 'pendente' | 'aceito' | null;
  convite_token?: string | null;
  total_eleitores?: number;
  potencial_votos?: number;
};

interface LiderancaListProps {
  liderancas: Lideranca[];
  isLoading: boolean;
  totalLiderancas: number;
  hasFilters: boolean;
  hasSearch: boolean;
  filtrosAtivos: number;
  onLimparFiltros: () => void;
  onCompartilharConvite: (lideranca: Lideranca) => void;
  onAbrirLocalizacao: (lideranca: Lideranca) => void;
}

export function LiderancaList({
  liderancas,
  isLoading,
  totalLiderancas,
  hasFilters,
  hasSearch,
  filtrosAtivos,
  onLimparFiltros,
  onCompartilharConvite,
  onAbrirLocalizacao,
}: LiderancaListProps) {
  return (
    <main className="flex-1 overflow-y-auto px-5">
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          <h2 className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
            Minhas Lideranças
          </h2>
        </div>
        <span className="text-sm font-semibold text-muted-foreground">
          {totalLiderancas}
        </span>
      </div>
      
      <div className="pb-6">

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : liderancas.length === 0 ? (
        <EmptyState
          hasFilters={hasFilters}
          hasSearch={hasSearch}
          filtrosAtivos={filtrosAtivos}
          onLimparFiltros={onLimparFiltros}
        />
      ) : (
        <div className="space-y-3">
          {liderancas.map((lideranca) => (
            <LiderancaCard
              key={lideranca.id}
              lideranca={lideranca}
              onCompartilharConvite={onCompartilharConvite}
              onAbrirLocalizacao={onAbrirLocalizacao}
            />
          ))}
        </div>
      )}
      </div>
    </main>
  );
}
