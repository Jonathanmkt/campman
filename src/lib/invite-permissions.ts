import type { UserRole } from '@/lib/supabase/middleware';

/**
 * Hierarquia de convites do Idealis Core:
 *
 * - **Masteradmin** pode convidar: admin, colaborador, coordenador, liderança, eleitor
 * - **Admin** pode convidar: colaborador, coordenador, liderança, eleitor
 * - **Colaborador** pode convidar: coordenador, liderança
 * - **Coordenador** pode convidar: liderança, eleitor
 * - **Liderança** pode convidar: eleitor
 * - **Eleitor** não pode convidar ninguém (compartilha link público)
 *
 * Todos os convites incluem `campanha_id` obrigatoriamente.
 */

/** Roles que cada papel pode convidar */
const INVITE_HIERARCHY: Record<string, string[]> = {
    masteradmin: ['admin', 'colaborador', 'coordenador', 'lideranca', 'eleitor'],
    admin: ['colaborador', 'coordenador', 'lideranca', 'eleitor'],
    colaborador: ['coordenador', 'lideranca'],
    coordenador: ['lideranca', 'eleitor'],
    lideranca: ['eleitor'],
    eleitor: [],
};

/**
 * Retorna os roles que o usuário com `inviterRole` pode convidar.
 * Retorna array vazio se o role não pode convidar ninguém.
 */
export function getInvitableRoles(inviterRole: UserRole): string[] {
    if (!inviterRole) return [];
    return INVITE_HIERARCHY[inviterRole] ?? [];
}

/**
 * Verifica se `inviterRole` pode convidar alguém com `targetRole`.
 */
export function canInviteRole(inviterRole: UserRole, targetRole: string): boolean {
    return getInvitableRoles(inviterRole).includes(targetRole);
}

/**
 * Verifica se o role pode convidar alguém (qualquer role).
 */
export function canInvite(inviterRole: UserRole): boolean {
    return getInvitableRoles(inviterRole).length > 0;
}

/**
 * Labels em pt-BR para exibição no frontend.
 */
export const ROLE_LABELS: Record<string, string> = {
    masteradmin: 'Master Admin',
    admin: 'Administrador',
    colaborador: 'Colaborador',
    coordenador: 'Coordenador',
    lideranca: 'Liderança',
    eleitor: 'Eleitor',
};

/**
 * Retorna as opções de convite formatadas para um select/dropdown.
 */
export function getInviteOptions(inviterRole: UserRole) {
    return getInvitableRoles(inviterRole).map((role) => ({
        value: role,
        label: ROLE_LABELS[role] ?? role,
    }));
}
