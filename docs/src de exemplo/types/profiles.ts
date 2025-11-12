/**
 * Tipos para a tabela de perfis de usuário
 */
export interface Profile {
  /** ID do perfil (UUID) */
  id: string;
  /** Nome completo do usuário (obrigatório) */
  nome_completo: string;
  /** Status do usuário: ativo, inativo ou suspenso (default: 'ativo') */
  status?: string | null;
  /** Array de funções/papéis do usuário (obrigatório, default: ['usuario']) */
  roles: string[];
  /** Permissões específicas do usuário (default: []) */
  permissions?: string[] | null;
  /** Nível de acesso numerico */
  access_level?: number | null;
  /** Telefone de contato */
  telefone?: string | null;
  /** CPF do usuário */
  cpf?: string | null;
  /** URL da foto do perfil */
  foto_url?: string | null;
  /** Data de nascimento */
  data_nascimento?: Date | null;
  /** ID do provedor de autenticação */
  provider_id?: string | null;
  /** Data e hora do último acesso */
  ultimo_acesso?: Date | null;
  /** Data de criação do perfil (default: now()) */
  data_criacao: Date;
  /** Data da última atualização do perfil (default: now()) */
  data_atualizacao: Date;
  /** Chave de API do Chatwoot */
  chatwoot_api_key?: string | null;
  /** Flag que indica se o usuário é administrador no Chatwoot (default: false) */
  is_chatwoot_admin: boolean;
}

/**
 * Tipo para inserção de um novo perfil
 */
export interface InsertProfile 
  extends Omit<Profile, 'id' | 'data_criacao' | 'data_atualizacao'> {
  /** Status inicial do usuário, padrão 'ativo' */
  status?: string;
  /** Array de funções/papéis do usuário (obrigatório) */
  roles: string[];
  /** Permissões específicas do usuário */
  permissions?: string[] | null;
}

/**
 * Tipo para atualização de um perfil existente
 */
export interface UpdateProfile 
  extends Partial<Omit<Profile, 'id' | 'data_criacao' | 'data_atualizacao'>> {
  /** Pode atualizar as funções/papéis do usuário */
  roles?: string[];
  /** Pode atualizar as permissões específicas */
  permissions?: string[] | null;
}

/**
 * Helper para obter o nome completo de forma segura
 */
export function getFullName(profile: Partial<Profile> | null | undefined): string {
  if (!profile) return '';
  return (profile.nome_completo || '').trim() || 'Usuário';
}

/**
 * Helper para obter a URL da foto de perfil de forma segura
 */
export function getProfilePhotoUrl(profile: Partial<Profile> | null | undefined): string | undefined {
  if (!profile) return undefined;
  return profile.foto_url || undefined;
}
