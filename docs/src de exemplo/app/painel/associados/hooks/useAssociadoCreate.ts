import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

// Interface para a resposta da API
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

// Tipos
export interface AssociadoFormData {
  // Dados básicos
  matricula: string;
  nome: string;
  sobrenome: string;
  cpf: string;
  telefone: string;
  email: string;
  sexo: string;
  estado_civil: string;
  situacao: string;
  inadimplente: boolean;
  
  // Datas
  data_nascimento: string;
  data_expedicao_rg: string;
  data_drt: string;
  data_registro: string;
  data_admissao: string;
  
  // Documentos
  rg_data: {
    numero: string;
    orgao_emissor: string;
  };
  ctps: string;
  serie_ctps: string;
  titulo_eleitor: string;
  zona_titulo: string;
  secao_titulo: string;
  carteira_reservista: string;
  
  // Endereço
  endereco: {
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  
  // Outros campos
  nacionalidade: string;
  naturalidade: string;
  tipo_sanguineo: string;
  nome_pai: string;
  nome_mae: string;
  drt: string;
  e_encarregado: string;
  processo: string;
  livro: string;
  folha: string;
  inss: string;
  observacao: string;
  
  // Arquivo de foto
  foto: File | null;
}

export interface UseAssociadoCreateReturn {
  createAssociado: (data: AssociadoFormData) => Promise<any>;
  uploadFoto: (file: File, cpf: string) => Promise<string | null>;
  isLoading: boolean;
  isUploading: boolean;
  error: Error | null;
  clearError: () => void;
}

export function useAssociadoCreate(): UseAssociadoCreateReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();
  const supabase = createClient();
  
  // Função para fazer upload da foto para o bucket do Supabase
  const uploadFoto = async (file: File, cpf: string): Promise<string | null> => {
    if (!file) return null;
    
    setIsUploading(true);
    setError(null);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${cpf}-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('associados-fotos')
        .upload(fileName, file);
      
      if (uploadError) {
        throw new Error(`Erro ao fazer upload da foto: ${uploadError.message}`);
      }
      
      // Obter a URL pública da foto
      const { data: { publicUrl } } = supabase.storage
        .from('associados-fotos')
        .getPublicUrl(fileName);
      
      return publicUrl;
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Erro no upload da foto:', error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  
  // Mutation para criar associado usando a API
  const createAssociadoMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/supabase/associados/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao cadastrar associado');
      }
      
      const result = await response.json() as ApiResponse;
      
      // Verificar se a resposta indica sucesso
      if (!result.success) {
        throw new Error(result.error || 'Erro ao cadastrar associado');
      }
      
      return result.data;
    },
    onSuccess: () => {
      // Invalidar queries para recarregar os dados
      queryClient.invalidateQueries({ queryKey: ['associados'] });
    },
    onError: (err: Error) => {
      setError(err);
      console.error('Erro ao cadastrar associado:', err);
    },
  });
  
  // Função principal que combina upload de foto e criação de associado
  const createAssociado = async (formData: AssociadoFormData) => {
    setError(null);
    
    try {
      // Normalizar dados
      const cpf = formData.cpf.replace(/\D/g, '');
      const telefone = formData.telefone.replace(/\D/g, '');
      const nome_completo = `${formData.nome} ${formData.sobrenome}`.trim();
      
      // Conversões de tipo
      const matricula = formData.matricula ? parseInt(formData.matricula, 10) : null;
      const drt = formData.drt ? parseInt(formData.drt, 10) : null;
      const encarregado_tambem = formData.e_encarregado === 'sim';
      
      // Upload da foto se existir
      let foto_url = null;
      if (formData.foto) {
        foto_url = await uploadFoto(formData.foto, cpf);
      }
      
      // Preparar objetos aninhados
      const endereco_data = {
        logradouro: formData.endereco.logradouro,
        numero: formData.endereco.numero,
        complemento: formData.endereco.complemento,
        bairro: formData.endereco.bairro,
        cidade: formData.endereco.cidade,
        uf: formData.endereco.uf,
        cep: formData.endereco.cep
      };
      
      const rg_data = {
        numero: formData.rg_data.numero,
        orgao_emissor: formData.rg_data.orgao_emissor,
        data_emissao: formData.data_expedicao_rg || null
      };
      
      const ctps_data = {
        numero: formData.ctps || null,
        serie: formData.serie_ctps || null
      };
      
      const titulo_eleitor_data = {
        numero: formData.titulo_eleitor || null,
        zona: formData.zona_titulo || null,
        secao: formData.secao_titulo || null
      };
      
      // Criar objeto para enviar à API
      const associadoData = {
        nome_completo,
        cpf,
        matricula,
        telefone,
        email: formData.email || null,
        data_nascimento: formData.data_nascimento || null,
        sexo: formData.sexo,
        estado_civil: formData.estado_civil || null,
        situacao: formData.situacao,
        drt,
        observacao: formData.observacao || null,
        endereco_data,
        rg_data,
        ctps_data,
        titulo_eleitor_data,
        inadimplente: formData.inadimplente,
        encarregado_tambem,
        nome_pai: formData.nome_pai || null,
        nome_mae: formData.nome_mae || null,
        nacionalidade: formData.nacionalidade || null,
        naturalidade: formData.naturalidade || null,
        tipo_sanguineo: formData.tipo_sanguineo || null,
        certificado_reservista: formData.carteira_reservista || null,
        data_expedicao: formData.data_expedicao_rg || null,
        processo: formData.processo || null,
        livro: formData.livro || null,
        folha: formData.folha || null,
        inss: formData.inss || null,
        data_drt: formData.data_drt || null,
        data_registro: formData.data_registro || null,
        data_admissao: formData.data_admissao || null,
        foto: foto_url
      };
      
      // Enviar para a API
      return await createAssociadoMutation.mutateAsync(associadoData);
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    }
  };
  
  const clearError = () => setError(null);
  
  return {
    createAssociado,
    uploadFoto,
    isLoading: createAssociadoMutation.isPending,
    isUploading,
    error,
    clearError
  };
}
