import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onFilterClick: () => void;
  filtrosAtivos: number;
}

export function SearchBar({ searchTerm, onSearchChange, onFilterClick, filtrosAtivos }: SearchBarProps) {
  return (
    <div className="sticky top-0 z-10 bg-gray-50 border-b">
      <div className="px-5 py-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, telefone ou bairro..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-11 h-12 bg-white text-base"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 shrink-0 relative"
            onClick={onFilterClick}
          >
            <Filter className="h-5 w-5" />
            {filtrosAtivos > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-semibold">
                {filtrosAtivos}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
