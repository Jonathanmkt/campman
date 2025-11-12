'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function UserProfile({ collapsed = false }: { collapsed?: boolean }) {
  const router = useRouter();
  
  // Função para lidar com o logout
  const handleSignOut = async () => {
    try {
      router.push('/auth/login');
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };
  
  // Dados fictícios para desenvolvimento
  const fullName = 'Thiago Moura';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={`relative flex items-center gap-2 rounded-md ${collapsed ? 'p-2' : 'pl-2 pr-3'} hover:bg-white/10`}
        >
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-sm font-medium text-primary-foreground">
              {fullName.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          {!collapsed && (
            <span className="text-sm font-medium text-primary-foreground">{fullName.split(' ')[0]}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              Candidato
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
