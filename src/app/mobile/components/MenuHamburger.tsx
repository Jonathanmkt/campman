'use client';

import { useRouter } from 'next/navigation';
import { User, LogOut, Users, UserCheck } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface MenuHamburgerProps {
  open: boolean;
  onClose: () => void;
}

export function MenuHamburger({ open, onClose }: MenuHamburgerProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/mobile/login');
    onClose();
  };

  const navigateTo = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[280px] sm:w-[320px]">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl">Menu</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            className="justify-start gap-3 h-12"
            onClick={() => navigateTo('/mobile/perfil')}
          >
            <User className="h-5 w-5" />
            <span>Meu Perfil</span>
          </Button>

          <Separator className="my-2" />

          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Páginas
            </p>
          </div>

          <Button
            variant="ghost"
            className="justify-start gap-3 h-12"
            onClick={() => navigateTo('/mobile/liderancas')}
          >
            <Users className="h-5 w-5" />
            <span>Lideranças</span>
          </Button>

          <Button
            variant="ghost"
            className="justify-start gap-3 h-12"
            onClick={() => navigateTo('/mobile/eleitores')}
          >
            <UserCheck className="h-5 w-5" />
            <span>Eleitores</span>
          </Button>

          <Separator className="my-2" />

          <Button
            variant="ghost"
            className="justify-start gap-3 h-12 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span>Sair</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
