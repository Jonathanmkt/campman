import { PostgrestError } from '@supabase/supabase-js';

const ERROR_MESSAGES: Record<string, string> = {
  '23505': 'Cliente já cadastrado',
  '23503': 'Dados inválidos',
  'PGRST301': 'Erro de autenticação',
  'default': 'Erro ao cadastrar cliente'
};

export const getErrorMessage = (error: PostgrestError | Error | unknown): string => {
  if (!error) return ERROR_MESSAGES.default;

  // Se for erro do Postgres/Supabase
  if (typeof error === 'object' && 'code' in error) {
    return ERROR_MESSAGES[error.code] || ERROR_MESSAGES.default;
  }

  // Se for erro padrão do JS
  if (error instanceof Error) {
    return error.message;
  }

  return ERROR_MESSAGES.default;
};
