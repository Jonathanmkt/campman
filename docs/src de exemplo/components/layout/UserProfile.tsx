'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Hooks - Agora usando apenas useUser
import { useUser } from '@/contexts/UserContext';

export function UserProfile({ showLoading = true, collapsed = false }: { showLoading?: boolean; collapsed?: boolean }) {
  const router = useRouter();
  const user = useUser();
  
  // Função para lidar com o logout
  const handleSignOut = async () => {
    try {
      if (user?.signOut) {
        await user.signOut();
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };
  
  // Se não há dados do usuário e está carregando
  if (!user && showLoading) {
    return (
      <div className="flex items-center space-x-2 h-8 min-w-[7rem]">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div>
          <Skeleton className="h-4 w-24 mb-1" />
        </div>
      </div>
    );
  }
  
  // Se não há usuário, mostrar botão de login
  if (!user) {
    return (
      <Button variant="ghost" onClick={() => router.push('/auth/login')}>
        Entrar
      </Button>
    );
  }
  
  // Determinar nome completo e URL do avatar
  const fullName = user.userData?.nome_completo || '';
  const avatarUrl = user.userData?.foto_url || '';
  const isAdmin = user.userData?.is_chatwoot_admin || false;

  // Removido código redundante de loading e erro
  // Agora usamos apenas o objeto user do UserContext

  return (
    <>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className={`relative flex items-center gap-2 rounded-md ${collapsed ? 'p-2' : 'pl-2 pr-3'} hover:bg-white/10`}
          >
            <Avatar className="h-8 w-8">
              <div className="relative h-full w-full">
                <img 
                  src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`}
                  alt={fullName}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // Usar avatar gerado em caso de erro
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`;
                  }}
                />
              </div>
            </Avatar>
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
                {isAdmin ? 'Administrador' : 'Usuário'}
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
    </>
  );
}
