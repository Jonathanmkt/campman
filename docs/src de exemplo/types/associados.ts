// Tipos para a tabela de associados
export type JsonValue = string | number | boolean | null | { [key: string]: JsonValue } | JsonValue[];

/**
 * Tipo para os dados do RG armazenados no campo rg_data
 * Exemplo: {"numero": "124561150", "orgao_emissor": "SSP/RJ"}
 */
export interface RgData {
  numero: string;
  orgao_emissor: string;
  uf?: string;
  data_emissao?: string;
}

/**
 * Interface para dados de endereço
 * Exemplo: {"uf": "RJ", "cep": "23058155", "bairro": "COSMOS", "cidade": "RIO DE JANEIRO", "numero": "69", "logradouro": "TRAVESSA SÃO JORGE", "complemento": ""}
 */
export interface EnderecoData {
  uf: string;
  cep: string;
  bairro: string;
  cidade: string;
  numero: string;
  logradouro: string;
  complemento: string;
}

/**
 * Interface para dados de CTPS
 * Exemplo: {"serie": "1234", "numero": "12345678"}
 */
export interface CtpsData {
  numero: string;
  serie: string;
  uf?: string;
}

/**
 * Interface para dados de Título de Eleitor
 * Exemplo: {"zona": "019", "secao": "0255", "numero": "120794850337"}
 */
export interface TituloEleitorData {
  numero: string;
  zona: string;
  secao: string;
}

/**
 * Tipo para representar um registro da tabela associados
 */
export interface Associado {
  id: string;
  cpf: string;
  matricula: number;
  drt: number | null;
  nome_completo: string;
  nome_mae: string | null;
  nome_pai: string | null;
  data_nascimento: string | null; // Date em formato ISO
  sexo: string | null;
  tipo_sanguineo: string | null;
  estado_civil: string | null;
  nacionalidade: string | null;
  naturalidade: string | null;
  rg_data: RgData; // Obrigatório no banco
  titulo_eleitor_data: TituloEleitorData | null;
  ctps_data: CtpsData | null;
  endereco_data: EnderecoData | null;
  certificado_reservista: string | null;
  inss: string | null;
  data_admissao: string | null; // Date em formato ISO
  data_desligamento: string | null; // Date em formato ISO
  data_drt: string | null; // Date em formato ISO
  data_expedicao: string | null; // Date em formato ISO
  data_registro: string | null; // Date em formato ISO
  processo: string | null;
  folha: string | null;
  livro: string | null;
  situacao: string; // Valor padrão 'ativo' no banco
  inadimplente: boolean; // Valor padrão false no banco
  encarregado_tambem: boolean; // Valor padrão false no banco
  email: string | null;
  telefone: string | null;
  foto: string | null;
  qr_code_cracha: string | null;
  observacao: string | null;
  created_at: string; // Date em formato ISO
  updated_at: string; // Date em formato ISO
  // Campo adicional para o bairro da área associada
  area_bairro?: string | null;
}

export type InsertAssociado = Omit<Associado, 'id' | 'created_at' | 'updated_at'> & {
  // Campos com valores padrão podem ser omitidos
  rg_data?: RgData;
  titulo_eleitor_data?: TituloEleitorData;
  ctps_data?: CtpsData;
  endereco_data?: EnderecoData;
  situacao?: string;
  inadimplente?: boolean;
  encarregado_tambem?: boolean;
};

export interface UpdateAssociado extends Partial<Omit<Associado, 'id' | 'cpf' | 'matricula' | 'created_at' | 'updated_at'>> {
  // Campos específicos que podem ser atualizados
  rg_data?: RgData;
  titulo_eleitor_data?: TituloEleitorData;
  ctps_data?: CtpsData;
  endereco_data?: EnderecoData;
}
