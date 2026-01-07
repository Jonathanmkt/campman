'use client';

import { User } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="flex flex-col h-full items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
          <User className="h-10 w-10 text-blue-600" />
        </div>
        <h1 className="text-2xl font-semibold">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Página em construção
        </p>
      </div>
    </div>
  );
}
