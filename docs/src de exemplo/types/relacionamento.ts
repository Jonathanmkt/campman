// Tipos para a tabela de relacionamento (aparentemente legado, considere usar encarregados_associados)
export interface Relacionamento {
  id: number;
  created_at: string; // Date em formato ISO
  guardador?: number | null; // Matrícula do guardador
  encarregado?: number | null; // Matrícula do encarregado
}

export type InsertRelacionamento = Omit<Relacionamento, 'id' | 'created_at'>;

export type UpdateRelacionamento = Partial<Omit<Relacionamento, 'id' | 'created_at'>> & {
  // Campos específicos que podem ser atualizados
  guardador?: number | null;
  encarregado?: number | null;
};
