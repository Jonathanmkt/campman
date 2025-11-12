import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, ChevronDown, Check, ArrowDown } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { SortOption, sortOptions } from '../hooks/useAssociadosData';
import { useState } from 'react';

interface AssociadosActionsHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy?: SortOption;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (option: SortOption) => void;
}

export function AssociadosActionsHeader({ 
  searchQuery, 
  onSearchChange, 
  sortBy = sortOptions[0],
  sortOrder = 'asc',
  onSortChange
}: AssociadosActionsHeaderProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  return (
    <div className='py-2 flex items-center gap-2 flex-wrap'>
      <div className='flex items-center md:gap-3 gap-2 flex-1 flex-wrap'>
        {/* Grupo da esquerda: busca */}
        <div className='relative flex-1 min-w-[160px] max-w-[400px]'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/70 w-4 h-4' />
          <Input
            type="search"
            placeholder={isDesktop ? 'Buscar por nome, matrícula ou CPF...' : 'Buscar...'}
            className='pl-9 h-10 w-full rounded-md border border-input bg-background hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none'
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          {/* Seletor de ordenação */}
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="h-10 border-input hover:border-primary hover:text-primary focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none whitespace-nowrap"
              >
                Ordenar por: {sortBy?.label || 'Nome'}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[180px] min-w-0">
              {sortOptions.map((option) => (
                <DropdownMenuItem 
                  key={option.column}
                  onClick={() => {
                    onSortChange?.(option);
                    setDropdownOpen(false);
                  }}
                  className="flex justify-between items-center cursor-pointer"
                >
                  <span>{option.label}</span>
                  {sortBy?.column === option.column && <Check className="w-4 h-4 ml-2" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Botão de toggle de ordem */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              className="h-10 border-input hover:border-primary hover:text-primary focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none flex items-center justify-center px-2.5"
              onClick={() => {
                if (onSortChange && sortBy) {
                  // Alterna a ordem atual e chama onSortChange com a opção atual
                  onSortChange(sortBy);
                }
              }}
              title={sortOrder === 'asc' ? 'Ordem crescente (A a Z)' : 'Ordem decrescente (Z a A)'}
            >
              <div className="flex items-center">
                <div className="flex flex-col items-center justify-center mr-1.5">
                  <span className="text-xs font-medium leading-none">
                    {sortOrder === 'asc' ? 'A' : 'Z'}
                  </span>
                  <span className="text-xs font-medium leading-none">
                    {sortOrder === 'asc' ? 'Z' : 'A'}
                  </span>
                </div>
                <ArrowDown className="w-2.5 h-2.5 stroke-[1.5]" />
              </div>
              <span className="sr-only">
                {sortOrder === 'asc' ? 'Ordem crescente (A a Z)' : 'Ordem decrescente (Z a A)'}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
