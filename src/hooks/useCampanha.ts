'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

/**
 * Dados da campanha retornados pelo hook.
 */
export interface CampanhaData {
    id: string;
    nome: string;
    nome_candidato: string;
    cargo_pretendido: string;
    partido: string | null;
    numero_candidato: string | null;
    uf: string;
    cidade: string | null;
    foto_candidato_url: string | null;
    foto_capa_desktop_url: string | null;
    foto_capa_mobile_url: string | null;
    tema_cores: string | null;
    status: string;
}

/**
 * Dados do membro (papel do usuário na campanha).
 */
export interface MembroData {
    id: string;
    role: string;
    status: string;
    campanha: CampanhaData;
}

/**
 * Dados completos do perfil do usuário + campanha.
 */
export interface UserCampanhaData {
    profileId: string;
    nomeCompleto: string;
    fotoUrl: string | null;
    roles: string[];
    campanha: CampanhaData | null;
    membroRole: string | null;
}

async function fetchUserCampanha(): Promise<UserCampanhaData> {
    const supabase = createClient();

    // Buscar usuário autenticado
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error('Usuário não autenticado');
    }

    // Buscar perfil
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, nome_completo, foto_url, roles, campanha_id')
        .eq('id', user.id)
        .single();

    if (profileError || !profile) {
        throw new Error('Perfil não encontrado');
    }

    // Se não tem campanha_id, retorna sem dados de campanha
    if (!profile.campanha_id) {
        return {
            profileId: profile.id,
            nomeCompleto: profile.nome_completo,
            fotoUrl: profile.foto_url,
            roles: profile.roles ?? [],
            campanha: null,
            membroRole: null,
        };
    }

    // Buscar dados da campanha e papel do membro em paralelo
    const [campanhaRes, membroRes] = await Promise.all([
        supabase
            .from('campanha')
            .select(
                'id, nome, nome_candidato, cargo_pretendido, partido, numero_candidato, uf, cidade, foto_candidato_url, foto_capa_desktop_url, foto_capa_mobile_url, tema_cores, status'
            )
            .eq('id', profile.campanha_id)
            .single(),
        supabase
            .from('campanha_membro')
            .select('role')
            .eq('campanha_id', profile.campanha_id)
            .eq('profile_id', user.id)
            .eq('status', 'ativo')
            .maybeSingle(),
    ]);

    const campanha = campanhaRes.data
        ? {
            id: campanhaRes.data.id,
            nome: campanhaRes.data.nome,
            nome_candidato: campanhaRes.data.nome_candidato,
            cargo_pretendido: campanhaRes.data.cargo_pretendido,
            partido: campanhaRes.data.partido,
            numero_candidato: campanhaRes.data.numero_candidato,
            uf: campanhaRes.data.uf,
            cidade: campanhaRes.data.cidade,
            foto_candidato_url: campanhaRes.data.foto_candidato_url,
            foto_capa_desktop_url: campanhaRes.data.foto_capa_desktop_url,
            foto_capa_mobile_url: campanhaRes.data.foto_capa_mobile_url,
            tema_cores: campanhaRes.data.tema_cores,
            status: campanhaRes.data.status,
        }
        : null;

    return {
        profileId: profile.id,
        nomeCompleto: profile.nome_completo,
        fotoUrl: profile.foto_url,
        roles: profile.roles ?? [],
        campanha,
        membroRole: membroRes.data?.role ?? null,
    };
}

/**
 * Hook para buscar dados do usuário logado + sua campanha.
 *
 * Retorna: perfil, campanha, role do membro.
 * Usa TanStack Query com cache de 5 minutos (staleTime).
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useCampanha();
 * console.log(data?.campanha?.nome_candidato);
 * ```
 */
export function useCampanha() {
    return useQuery({
        queryKey: ['user-campanha'],
        queryFn: fetchUserCampanha,
        staleTime: 5 * 60 * 1000, // 5 minutos
        retry: 1,
    });
}
