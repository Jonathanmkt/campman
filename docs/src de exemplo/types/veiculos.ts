/**
 * Tipos para a tabela veiculos
 */

/**
 * Tipo para um registro da tabela veiculos
 */
export interface Veiculo {
  id: string;
  placa: string;
  marca?: string | null;
  modelo?: string | null;
  cor?: string | null;
  ativo?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Tipo para inserção na tabela veiculos
 */
export type VeiculoInsert = Omit<Veiculo, 'id' | 'created_at' | 'updated_at'>;

/**
 * Tipo para atualização na tabela veiculos
 */
export type VeiculoUpdate = Partial<Omit<Veiculo, 'id'>>;

/**
 * Interface para representar um veículo
 * @property {string} id - UUID único do veículo
 * @property {string} placa - Placa do veículo (valor único)
 * @property {string} [marca] - Marca do veículo
 * @property {string} [modelo] - Modelo do veículo
 * @property {string} [cor] - Cor do veículo
 * @property {boolean} ativo - Status do veículo no sistema
 * @property {string} created_at - Data de criação
 * @property {string} updated_at - Data da última atualização
 */
export interface IVeiculo {
  id: string;
  placa: string;
  marca?: string | null;
  modelo?: string | null;
  cor?: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Tipo para criar um novo veículo
 * Omitindo campos gerados automaticamente
 */
export type NovoVeiculo = Omit<IVeiculo, 'id' | 'created_at' | 'updated_at'>;

/**
 * Valida se um objeto de veículo é válido
 * @param veiculo - Objeto de veículo a ser validado
 * @returns string | null - Mensagem de erro ou null se válido
 */
export function validarVeiculo(veiculo: Partial<IVeiculo>): string | null {
  if (!veiculo.placa) return 'Placa do veículo é obrigatória';
  
  // Validação básica de placa (formato brasileiro atual ou Mercosul)
  const placaRegex = /^[A-Z]{3}[0-9]{4}$|^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
  if (!placaRegex.test(veiculo.placa.toUpperCase())) {
    return 'Formato de placa inválido';
  }
  
  return null;
}

/**
 * Formata a placa do veículo para o padrão de visualização
 * @param placa - Placa do veículo
 * @returns string - Placa formatada
 */
export function formatarPlaca(placa: string): string {
  if (!placa) return '';
  
  placa = placa.toUpperCase();
  
  // Formato Mercosul: ABC1D23
  if (/^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(placa)) {
    return `${placa.slice(0, 3)}-${placa.slice(3)}`;
  }
  
  // Formato antigo: ABC1234
  if (/^[A-Z]{3}[0-9]{4}$/.test(placa)) {
    return `${placa.slice(0, 3)}-${placa.slice(3)}`;
  }
  
  return placa;
}
