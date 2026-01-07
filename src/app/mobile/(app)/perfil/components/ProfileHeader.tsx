import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileHeaderProps {
  nome: string;
  fotoUrl?: string | null;
  role: string;
}

export function ProfileHeader({ nome, fotoUrl, role }: ProfileHeaderProps) {
  const roleLabels: Record<string, string> = {
    coordenador: 'Coordenador',
    lideranca: 'Liderança',
    colaborador: 'Colaborador',
  };

  const initials = nome
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-5 py-8 text-white">
      <div className="flex flex-col items-center gap-4">
        <Avatar className="h-24 w-24 border-4 border-white/20">
          <AvatarImage src={fotoUrl || undefined} alt={nome} />
          <AvatarFallback className="bg-blue-500 text-white text-2xl">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h1 className="text-2xl font-bold">{nome}</h1>
          <p className="text-blue-100 text-sm mt-1">{roleLabels[role] || role}</p>
        </div>
      </div>
    </div>
  );
}
