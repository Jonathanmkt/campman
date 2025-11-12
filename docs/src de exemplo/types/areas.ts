/**
 * Tipos para a tabela 'areas' no banco de dados
 */

/**
 * Tipo para representar uma linha da tabela areas
 */
export type Area = {
  id: string;
  id_sequencial: number;
  cod: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  cep: string | null;
  referencia: string | null;
  posicao: unknown | null; // PostGIS geography
  rotatividade: number | null;
  vagas: number | null;
  endereco_google: string | null;
  latitude: number | null;
  longitude: number | null;
  endereco_completo: string | null;
  created_at: string | null;
  updated_at: string | null;
};

/**
 * Tipo para inserção de um novo registro na tabela areas
 */
export type AreaInsert = {
  id?: string;
  id_sequencial: number;
  cod?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  cep?: string | null;
  referencia?: string | null;
  posicao?: unknown | null;
  rotatividade?: number | null;
  vagas?: number | null;
  endereco_google?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  endereco_completo?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

/**
 * Tipo para atualização de registros na tabela areas
 */
export type AreaUpdate = {
  id?: string;
  id_sequencial?: number;
  cod?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  cep?: string | null;
  referencia?: string | null;
  posicao?: unknown | null;
  rotatividade?: number | null;
  vagas?: number | null;
  endereco_google?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  endereco_completo?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

/**
 * Interface para representar uma área de estacionamento
 * @property {string} id - UUID único da área
 * @property {number} id_sequencial - Número sequencial único
 * @property {string} [cod] - Código da área
 * @property {string} [logradouro] - Rua, avenida ou praça
 * @property {string} [numero] - Número da localização
 * @property {string} [complemento] - Complemento do endereço
 * @property {string} [cep] - CEP
 * @property {string} [referencia] - Ponto de referência
 * @property {object} [posicao] - Coordenadas geográficas (PostGIS)
 * @property {number} [rotatividade] - Taxa de rotatividade da área
 * @property {number} [vagas] - Número de vagas disponíveis
 * @property {string} [endereco_google] - Endereço formatado pelo Google
 * @property {number} [latitude] - Coordenada de latitude
 * @property {number} [longitude] - Coordenada de longitude
 * @property {string} [endereco_completo] - Endereço completo concatenado
 * @property {string} created_at - Data de criação
 * @property {string} updated_at - Data da última atualização
 */
export interface IArea {
  id: string;
  id_sequencial: number;
  cod?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  cep?: string | null;
  referencia?: string | null;
  posicao?: any | null; // PostGIS geography point
  rotatividade?: number | null;
  vagas?: number | null;
  endereco_google?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  endereco_completo?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Tipo para criar uma nova área
 * Omitindo campos gerados automaticamente
 */
export type NovaArea = Omit<IArea, 'id' | 'id_sequencial' | 'created_at' | 'updated_at'>;

/**
 * Valida se um objeto de área é válido
 * @param area - Objeto de área a ser validado
 * @returns string | null - Mensagem de erro ou null se válido
 */
export function validarArea(area: Partial<IArea>): string | null {
  if (!area.logradouro) return 'Logradouro é obrigatório';
  return null;
}

/**
 * Gera o endereço completo com base nos campos do endereço
 * @param area - Objeto com campos de endereço
 * @returns string - Endereço completo formatado
 */
export function gerarEnderecoCompleto(area: Pick<IArea, 'logradouro' | 'numero' | 'complemento' | 'cep'>): string {
  const partes = [];
  
  if (area.logradouro) partes.push(area.logradouro);
  if (area.numero) partes.push(area.numero);
  if (area.complemento) partes.push(area.complemento);
  if (area.cep) partes.push(`CEP: ${area.cep}`);
  
  return partes.join(', ');
}
