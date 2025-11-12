// Tipos para a tabela de encarregados
export interface Encarregado {
  id: string;
  matricula: number;
  nome_completo: string;
  cpf: string | null;
  drt: number | null;
  foto_url: string | null;
  limite_estoque: number | null;
  telefone: string | null;
  created_at: string; // Date em formato ISO
  updated_at: string; // Date em formato ISO
}

export type InsertEncarregado = Omit<Encarregado, 'id' | 'created_at' | 'updated_at'>;

export type UpdateEncarregado = Partial<Omit<Encarregado, 'id' | 'matricula' | 'created_at' | 'updated_at'>> & {
  // Campos específicos que podem ser atualizados
  nome_completo?: string;
  cpf?: string | null;
  drt?: number | null;
  foto_url?: string | null;
  limite_estoque?: number | null;
  telefone?: string | null;
};
