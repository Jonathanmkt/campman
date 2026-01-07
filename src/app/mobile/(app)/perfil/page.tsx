'use client';

import { Phone, Calendar, Shield, Clock } from 'lucide-react';
import { ProfileHeader } from './components/ProfileHeader';
import { InfoCard } from './components/InfoCard';
import { LiderancaStats } from './components/LiderancaStats';
import { useProfile } from './hooks/useProfile';

export default function PerfilPage() {
  const { profile, isLoading, error } = useProfile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <p className="text-red-600 mb-2">Erro ao carregar perfil</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  const primaryRole = profile.roles?.[0] || 'colaborador';
  const formatDate = (date: string | null | undefined) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <ProfileHeader
        nome={profile.nome_completo || 'Usuário'}
        fotoUrl={profile.foto_url}
        role={primaryRole}
      />

      <div className="flex-1 px-5 py-6 space-y-4">
        <div className="space-y-3">
          <h2 className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
            Informações Pessoais
          </h2>

          <InfoCard
            icon={Phone}
            label="Telefone"
            value={profile.telefone}
          />

          <InfoCard
            icon={Calendar}
            label="Data de Nascimento"
            value={formatDate(profile.data_nascimento)}
          />

          <InfoCard
            icon={Shield}
            label="Status"
            value={profile.status}
          />

          <InfoCard
            icon={Clock}
            label="Membro desde"
            value={formatDate(profile.data_criacao)}
          />
        </div>

        {profile.lideranca_info && (
          <div className="space-y-3 pt-4">
            <h2 className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
              Informações de Liderança
            </h2>
            <LiderancaStats
              nivel={profile.lideranca_info.nivel}
              tipo={profile.lideranca_info.tipo}
              alcanceEstimado={profile.lideranca_info.alcance_estimado}
              areas={profile.lideranca_info.areas}
            />
          </div>
        )}
      </div>
    </div>
  );
}
