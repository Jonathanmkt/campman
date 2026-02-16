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
import { useCampanha } from '@/hooks/useCampanha';
import { createClient } from '@/lib/supabase/client';
import { ROLE_LABELS } from '@/lib/invite-permissions';

export function UserProfile({ collapsed = false }: { collapsed?: boolean }) {
  const router = useRouter();
  const { data: userCampanha, isLoading } = useCampanha();

  // Função para lidar com o logout
  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const fullName = userCampanha?.nomeCompleto ?? 'Usuário';
  const fotoUrl = userCampanha?.fotoUrl ?? null;
  const roleLabel = userCampanha?.membroRole
    ? ROLE_LABELS[userCampanha.membroRole] ?? userCampanha.membroRole
    : 'Membro';

  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`relative flex items-center gap-2 rounded-md ${collapsed ? 'p-2' : 'pl-2 pr-3'} hover:bg-white/10`}
        >
          {fotoUrl ? (
            <img
              src={fotoUrl}
              alt={fullName}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
              {isLoading ? (
                <div className="h-4 w-4 rounded-full bg-white/30 animate-pulse" />
              ) : (
                <span className="text-sm font-medium text-primary-foreground">
                  {initials}
                </span>
              )}
            </div>
          )}
          {!collapsed && (
            <span className="text-sm font-medium text-primary-foreground">
              {isLoading ? '...' : fullName.split(' ')[0]}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {roleLabel}
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
