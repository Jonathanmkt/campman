import { useState, useEffect } from 'react';
import type { Tables } from '@/types';

export type ProfileData = Tables<'profiles'> & {
  lideranca_info?: {
    nivel?: string;
    tipo?: string;
    alcance_estimado?: number;
    areas?: Array<{
      id: string;
      nome: string;
      tipo: string;
      cidade?: string;
      bairro?: string;
    }>;
  };
};

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/mobile/profile');
      const result = await response.json();

      if (result.success) {
        setProfile(result.data);
      } else {
        setError(result.error || 'Erro ao carregar perfil');
      }
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
      setError('Erro ao conectar com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
  };
}
