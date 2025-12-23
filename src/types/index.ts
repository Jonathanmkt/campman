/**
 * Tipos auxiliares para o projeto Campanha Thiago Moura 2026
 * 
 * Este arquivo contém tipos auxiliares e re-exports dos tipos do Supabase
 * para facilitar o uso em toda a aplicação.
 * 
 * Última atualização: 2025-12-21T18:38:51.848Z
 */

// Re-export dos tipos principais do Supabase
import type { Database as DB } from './database.types';
export type { Database, Json } from './database.types';

// Tipos auxiliares para tabelas específicas
export type Tables<T extends keyof DB['public']['Tables']> = DB['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof DB['public']['Tables']> = DB['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof DB['public']['Tables']> = DB['public']['Tables'][T]['Update'];

// Tipos para Views
export type Views<T extends keyof DB['public']['Views']> = DB['public']['Views'][T]['Row'];

// Tipos para Enums
export type Enums<T extends keyof DB['public']['Enums']> = DB['public']['Enums'][T];

// Tipos específicos do projeto (adicione conforme necessário)
export interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Tipos para autenticação
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role?: string;
}

// Tipos para formulários
export interface FormState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

// Tipos para filtros e ordenação
export interface FilterOptions {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Tipos para status de operações
export type OperationStatus = 'idle' | 'loading' | 'success' | 'error';

// Tipos para componentes comuns
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

// Tipos para notificações
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}
