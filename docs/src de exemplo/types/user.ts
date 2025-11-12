/**
 * Definição do tipo para os dados públicos que vêm do middleware (apenas dados seguros)
 * Estes dados são passados do middleware para o layout e então para o UserContext
 */
export type UserData = {
  nome_completo?: string;
  foto_url?: string | null;
  roles?: string[];
  is_chatwoot_admin?: boolean; // Flag para UX (mostrar/ocultar botões)
  email?: string; // Email do usuário
  access_token?: string; // Token de acesso para APIs públicas
  account_id?: string | number; // ID da conta
  [key: string]: string | number | boolean | string[] | null | undefined;
}; // Para outros campos que possam existir
