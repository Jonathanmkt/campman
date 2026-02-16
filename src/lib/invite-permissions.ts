import type { UserRole } from '@/lib/supabase/middleware';

/**
 * Hierarquia de convites do Idealis Core:
 *
 * - **Admin** pode convidar: colaborador, coordenador, liderança, eleitor
 * - **Coordenador** pode convidar: liderança
 * - **Liderança** pode convidar: eleitor
 * - **Colaborador** e **Eleitor** não podem convidar ninguém
 *
 * Todos os convites incluem `campanha_id` obrigatoriamente.
 */

/** Roles que cada papel pode convidar */
const INVITE_HIERARCHY: Record<string, string[]> = {
    admin: ['colaborador', 'coordenador', 'lideranca', 'eleitor'],
    coordenador: ['lideranca'],
    lideranca: ['eleitor'],
    colaborador: [],
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
