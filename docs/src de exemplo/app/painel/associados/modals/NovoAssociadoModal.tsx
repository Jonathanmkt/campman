import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Camera, User, Home, Briefcase, Users, FileText, MapPin, Loader2, CreditCard, QrCode, IdCard } from 'lucide-react';
import { useAssociadoCreate, useFetchAssociadosOptions } from '../hooks';
import { useNextMatricula } from '../hooks/useNextMatricula';
import { FotoUpload } from '../components/FotoUpload';
import { LoadingLottie, CheckedLottie } from '@/components/lotties';
import { EncarregadoSelector } from '../components/EncarregadoSelector';
import { AreaSelector } from '../components/AreaSelector';
import { useViaCep } from '@/hooks/useViaCep';
import { useEncarregadosData } from '@/app/painel/encarregados/hooks/useEncarregadosData';
import { useEncarregadosFormatters } from '@/app/painel/encarregados/hooks/useEncarregadosFormatters';
import { useAreas } from '@/app/painel/mapa-de-areas/hooks/useAreas';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface NovoAssociadoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalStep = 'form' | 'loading' | 'declarations' | 'cracha' | 'linking-encarregados' | 'linking-areas' | 'summary';

interface CreatedAssociadoData {
  id: string;
  nome_completo: string;
  cpf: string;
  matricula: string;
  drt: string;
}

interface LinkingState {
  encarregadosVinculados: string[]; // IDs dos encarregados vinculados
  areasVinculadas: string[]; // IDs das áreas vinculadas
}

interface EnderecoForm {
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
}

interface RgForm {
  numero: string;
  orgao_emissor: string;
  data_emissao: string;
}

interface AssociadoForm {
  // Campo primário
  matricula: string;
  
  // Dados Pessoais
  nome: string;
  sobrenome: string;
  data_nascimento: string;
  sexo: string;
  estado_civil: string;
  telefone: string;
  email: string;
  cpf: string;
  rg_data: RgForm;
  data_expedicao_rg: string;
  ctps: string;
  serie_ctps: string;
  titulo_eleitor: string;
  zona_titulo: string;
  secao_titulo: string;
  carteira_reservista: string;
  nacionalidade: string;
  naturalidade: string;
  tipo_sanguineo: string;
  foto: File | null;
  
  // Filiação
  nome_pai: string;
  nome_mae: string;
  
  // Endereço
  endereco: EnderecoForm;
  
  // Dados Profissionais
  processo: string;
  livro: string;
  folha: string;
  inss: string;
  e_encarregado: string;
  situacao: string;
  drt: string;
  data_drt: string;
  data_registro: string;
  data_admissao: string;
  observacao: string;
  
  // Campos legados
  inadimplente: boolean;
}

const initialFormState: AssociadoForm = {
  // Campo primário
  matricula: '',
  
  // Dados Pessoais
  nome: '',
  sobrenome: '',
  data_nascimento: '',
  sexo: 'masculino',
  estado_civil: 'solteiro',
  telefone: '',
  email: '',
  cpf: '',
  rg_data: {
    numero: '',
    orgao_emissor: '',
    data_emissao: ''
  },
  data_expedicao_rg: '',
  ctps: '',
  serie_ctps: '',
  titulo_eleitor: '',
  zona_titulo: '',
  secao_titulo: '',
  carteira_reservista: '',
  nacionalidade: 'Brasileiro',
  naturalidade: 'Rio de Janeiro',
  tipo_sanguineo: '',
  foto: null,
  
  // Filiação
  nome_pai: '',
  nome_mae: '',
  
  // Endereço
  endereco: {
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: ''
  },
  
  // Dados Profissionais
  processo: '',
  livro: '',
  folha: '',
  inss: '',
  e_encarregado: 'nao',
  situacao: 'ativo',
  drt: '',
  data_drt: '',
  data_registro: '',
  data_admissao: '',
  observacao: '',
  
  // Campos legados
  inadimplente: false
};

// Função para formatar o CPF com máscara
const formatCPF = (value: string) => {
  if (!value) return '';
  
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 11 caracteres
  const cpf = numbers.slice(0, 11);
  
  // Aplica a máscara: 000.000.000-00
  if (cpf.length <= 3) {
    return cpf;
  } else if (cpf.length <= 6) {
    return `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
  } else if (cpf.length <= 9) {
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
  } else {
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
  }
};

// Função para formatar o telefone com máscara
const formatTelefone = (value: string) => {
  if (!value) return '';
  
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara conforme o tamanho do número
  if (numbers.length <= 2) {
    return `(${numbers}`;
  } else if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  } else if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  } else {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }
};

// Função para formatar o CEP com máscara
const formatCep = (value: string) => {
  if (!value) return '';
  
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 8 dígitos
  const cep = numbers.slice(0, 8);
  
  // Aplica a máscara: 00000-000
  if (cep.length <= 5) {
    return cep;
  } else {
    return `${cep.slice(0, 5)}-${cep.slice(5)}`;
  }
};

// Função para normalizar o CEP (remover formatação)
const normalizeCep = (value: string) => {
  return value.replace(/\D/g, '');
};

// Função para normalizar o CPF (remover formatação)
const normalizeCPF = (value: string) => {
  return value.replace(/\D/g, '');
};

// Função para normalizar o telefone (remover formatação)
const normalizeTelefone = (value: string) => {
  return value.replace(/\D/g, '');
};

// Função para formatar data com máscara dd/mm/aaaa
const formatDate = (value: string) => {
  if (!value) return '';
  
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 8 dígitos
  const date = numbers.slice(0, 8);
  
  // Aplica a máscara: dd/mm/aaaa
  if (date.length <= 2) {
    return date;
  } else if (date.length <= 4) {
    return `${date.slice(0, 2)}/${date.slice(2)}`;
  } else {
    return `${date.slice(0, 2)}/${date.slice(2, 4)}/${date.slice(4)}`;
  }
};

// Função para converter data brasileira (dd/mm/aaaa) para formato ISO (yyyy-mm-dd)
const dateToISO = (dateBR: string): string => {
  if (!dateBR || dateBR.length !== 10) return '';
  const [day, month, year] = dateBR.split('/');
  if (!day || !month || !year) return '';
  return `${year}-${month}-${day}`;
};

// Função para converter data ISO (yyyy-mm-dd) para formato brasileiro (dd/mm/aaaa)
const dateFromISO = (dateISO: string): string => {
  if (!dateISO) return '';
  const [year, month, day] = dateISO.split('-');
  if (!year || !month || !day) return '';
  return `${day}/${month}/${year}`;
};

export function NovoAssociadoModal({ isOpen, onClose }: NovoAssociadoModalProps) {
  const [form, setForm] = useState<AssociadoForm>(initialFormState);
  const [currentStep, setCurrentStep] = useState<ModalStep>('form');
  const [createdAssociado, setCreatedAssociado] = useState<CreatedAssociadoData | null>(null);
  const [linkingState, setLinkingState] = useState<LinkingState>({
    encarregadosVinculados: [],
    areasVinculadas: []
  });
  
  // Hooks para buscar dados dos encarregados e áreas para exibir no resumo
  const { data: encarregados = [] } = useEncarregadosData();
  const { areas = [] } = useAreas();
  const { formatName, getInitials } = useEncarregadosFormatters();
  
  // Estado para controlar o loading dos botões de declaração
  const [loadingDeclaration, setLoadingDeclaration] = useState<string | null>(null);
  
  // Hook para buscar a próxima matrícula disponível
  const { data: nextMatricula, isLoading: loadingMatricula } = useNextMatricula();
  
  // Hook para buscar endereço via CEP
  const { buscarCep, loading: loadingCep } = useViaCep();
  
  const { createAssociado, isLoading, error } = useAssociadoCreate();
  
  // Estados para exibição das datas no formato brasileiro
  const [displayDates, setDisplayDates] = useState({
    data_nascimento: '',
    data_expedicao_rg: '',
    data_drt: '',
    data_registro: '',
    data_admissao: ''
  });
  
  // Hook para buscar opções do formulário
  const {
    estadoCivil: estadoCivilOptions,
    sexo: sexoOptions,
    situacoes: situacaoOptions,
    estados: estadoOptions,
    orgaosEmissores: orgaoEmissoresOptions,
    loading: optionsLoading
  } = useFetchAssociadosOptions();

  // Inicializa displayDates e valores padrão quando o modal abre
  useEffect(() => {
    if (isOpen) {
      // Formata a data atual para o formato brasileiro
      const hoje = new Date();
      const diaAtual = String(hoje.getDate()).padStart(2, '0');
      const mesAtual = String(hoje.getMonth() + 1).padStart(2, '0');
      const anoAtual = hoje.getFullYear();
      const dataAtualBR = `${diaAtual}/${mesAtual}/${anoAtual}`;
      const dataAtualISO = `${anoAtual}-${mesAtual}-${diaAtual}`;
      
      // Atualiza o formulário com a data atual para registro e admissão
      setForm(prev => ({
        ...prev,
        data_registro: dataAtualISO,
        data_admissao: dataAtualISO,
        // Se temos uma próxima matrícula disponível, usa ela
        matricula: nextMatricula || prev.matricula
      }));
      
      setDisplayDates({
        data_nascimento: form.data_nascimento ? dateFromISO(form.data_nascimento) : '',
        data_expedicao_rg: form.data_expedicao_rg ? dateFromISO(form.data_expedicao_rg) : '',
        data_drt: form.data_drt ? dateFromISO(form.data_drt) : '',
        data_registro: dataAtualBR,
        data_admissao: dataAtualBR
      });
    }
  }, [isOpen, nextMatricula, form.data_nascimento, form.data_expedicao_rg, form.data_drt]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Lista de campos de data
    const dateFields = ['data_nascimento', 'data_expedicao_rg', 'data_drt', 'data_registro', 'data_admissao'];
    
    if (name.includes('.')) {
      // Campo aninhado (endereço ou RG)
      const [parent, child] = name.split('.');
      
      // Caso especial para o CEP - formata e busca o endereço via API
      if (parent === 'endereco' && child === 'cep') {
        // Formata o CEP com máscara
        const formattedCep = formatCep(value);
        
        // Se o CEP tem 8 dígitos (9 com o hífen), busca o endereço
        if (formattedCep.length === 9) {
          handleCepSearch(formattedCep);
        }
        
        // Atualiza o valor formatado no formulário
        setForm(prev => ({
          ...prev,
          endereco: {
            ...prev.endereco,
            cep: formattedCep
          }
        }));
        
        // Retorna para evitar a atualização padrão abaixo
        return;
      }
      
      setForm(prev => {
        // Cria uma cópia segura do objeto aninhado
        const parentObj = prev[parent as keyof AssociadoForm];
        // Verifica se é um objeto antes de fazer o spread
        const parentCopy = typeof parentObj === 'object' && parentObj !== null && !(parentObj instanceof File)
          ? { ...parentObj as Record<string, any> }
          : {};
        
        // Atualiza a propriedade específica
        parentCopy[child] = value;
        
        // Retorna o novo estado
        return {
          ...prev,
          [parent]: parentCopy
        };
      });
    } else if (name === 'cpf') {
      // Formata o CPF enquanto digita
      setForm(prev => ({
        ...prev,
        [name]: formatCPF(value)
      }));
    } else if (name === 'telefone') {
      // Formata o telefone enquanto digita
      setForm(prev => ({
        ...prev,
        [name]: formatTelefone(value)
      }));
    } else if (dateFields.includes(name)) {
      // Formata data enquanto digita
      const formatted = formatDate(value);
      setDisplayDates(prev => ({
        ...prev,
        [name]: formatted
      }));
      // Converte para ISO e salva no form
      const isoDate = dateToISO(formatted);
      setForm(prev => ({
        ...prev,
        [name]: isoDate
      }));
    } else {
      // Campo normal
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Função para buscar endereço pelo CEP
  const handleCepSearch = async (cep: string) => {
    // Remove a formatação para enviar à API
    const cepNormalizado = normalizeCep(cep);
    
    // Verifica se o CEP tem 8 dígitos
    if (cepNormalizado.length !== 8) return;
    
    const endereco = await buscarCep(cepNormalizado);
    if (endereco) {
      setForm(prev => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          logradouro: endereco.logradouro,
          bairro: endereco.bairro,
          cidade: endereco.cidade,
          uf: endereco.uf
        }
      }));
      toast.success('Endereço preenchido automaticamente!');
    }
  };

  // Handler para campos de select
  const handleSelectChange = (value: string, field: string) => {
    if (field.includes('.')) {
      // Lidar com campos aninhados como 'endereco.uf'
      const [parent, child] = field.split('.');
      setForm(prev => {
        // Garantir que estamos trabalhando com objetos
        const parentObj = prev[parent as keyof typeof prev] as Record<string, any> || {};
        
        return {
          ...prev,
          [parent]: {
            ...parentObj,
            [child]: value
          }
        };
      });
    } else {
      // Campos simples
      setForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setCurrentStep('loading');
      
      // Simula loading mínimo de 2 segundos
      const [result] = await Promise.all([
        createAssociado(form),
        new Promise(resolve => setTimeout(resolve, 2000))
      ]);
      
      // Dados do associado criado para uso nas próximas etapas
      const associadoData: CreatedAssociadoData = {
        id: result.id || 'temp-id',
        nome_completo: `${form.nome} ${form.sobrenome}`,
        cpf: form.cpf,
        matricula: form.matricula,
        drt: form.drt
      };
      
      setCreatedAssociado(associadoData);
      setCurrentStep('declarations');
      
    } catch (err) {
      console.error('Erro ao cadastrar associado:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao cadastrar associado. Por favor, tente novamente.';
      toast.error(errorMessage);
      setCurrentStep('form');
    }
  };
  
  const handleCloseModal = () => {
    setForm(initialFormState);
    setCurrentStep('form');
    setCreatedAssociado(null);
    setLinkingState({
      encarregadosVinculados: [],
      areasVinculadas: []
    });
    onClose();
  };
  
  const handleEncarregadoVinculado = (encarregadoIds: string[]) => {
    setLinkingState(prev => ({ 
      ...prev, 
      encarregadosVinculados: [...prev.encarregadosVinculados, ...encarregadoIds]
    }));
  };
  
  const handleAreaVinculada = (areaIds: string[]) => {
    setLinkingState(prev => ({ 
      ...prev, 
      areasVinculadas: [...prev.areasVinculadas, ...areaIds]
    }));
  };

  // Renderização condicional baseada na etapa atual
  const renderContent = () => {
    switch (currentStep) {
      case 'form':
        return renderFormStep();
      case 'loading':
        return renderLoadingStep();
      case 'declarations':
        return renderDeclarationsStep();
      case 'cracha':
        return renderCrachaStep();
      case 'linking-encarregados':
        return renderLinkingEncarregadosStep();
      case 'linking-areas':
        return renderLinkingAreasStep();
      case 'summary':
        return renderSummaryStep();
      default:
        return renderFormStep();
    }
  };
  
  const renderFormStep = () => (
    <>
      <DialogHeader className="space-y-4 pb-4 border-b">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 space-y-1">
            <DialogTitle className="text-2xl font-semibold">Cadastrar Novo Associado</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              Preencha os dados abaixo para adicionar um novo membro ao sistema. 
              Os campos marcados com * são obrigatórios.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Seção: Foto e Matrícula */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500">
                <Camera className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-blue-700">Foto e Matrícula</h3>
            </div>
            <div className="flex gap-6 items-start">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Foto do Associado</Label>
                <FotoUpload
                  value={form.foto}
                  onChange={(file) => setForm(prev => ({ ...prev, foto: file }))}
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="matricula" className="text-base font-semibold">Matrícula*</Label>
                {loadingMatricula ? (
                  <div className="flex items-center gap-2 h-10 px-3 border rounded-md">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Gerando matrícula...</span>
                  </div>
                ) : (
                  <Input
                    id="matricula"
                    name="matricula"
                    value={form.matricula}
                    onChange={handleChange}
                    required
                    className="text-lg font-medium"
                  />
                )}
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Seção: Dados Pessoais */}
          <div className="bg-green-50/50 border border-green-100 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500">
                <User className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-green-700">Dados Pessoais</h3>
            </div>
            
            {/* Linha 1: Nome e Sobrenome */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome*</Label>
                <Input id="nome" name="nome" value={form.nome} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sobrenome">Sobrenome*</Label>
                <Input id="sobrenome" name="sobrenome" value={form.sobrenome} onChange={handleChange} required />
              </div>
            </div>

            {/* Linha 2: Data Nascimento, Sexo, Estado Civil */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                <Input 
                  id="data_nascimento" 
                  name="data_nascimento" 
                  value={displayDates.data_nascimento} 
                  onChange={handleChange} 
                  placeholder="dd/mm/aaaa"
                  maxLength={10}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sexo">Sexo</Label>
                <Select value={form.sexo} onValueChange={(value) => handleSelectChange(value, 'sexo')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado_civil">Estado Civil</Label>
                <Select value={form.estado_civil} onValueChange={(value) => handleSelectChange(value, 'estado_civil')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solteiro">Solteiro</SelectItem>
                    <SelectItem value="casado">Casado</SelectItem>
                    <SelectItem value="divorciado">Divorciado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Linha 3: Telefone e Email */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone*</Label>
                <Input id="telefone" name="telefone" value={form.telefone} onChange={handleChange} placeholder="(00) 00000-0000" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
              </div>
            </div>

            {/* Linha 4: CPF, RG, Órgão Emissor, Data Expedição */}
            <div className="grid grid-cols-10 gap-4">
              <div className="space-y-2 col-span-3">
                <Label htmlFor="cpf">CPF*</Label>
                <Input id="cpf" name="cpf" value={form.cpf} onChange={handleChange} placeholder="000.000.000-00" maxLength={14} required />
              </div>
              <div className="space-y-2 col-span-3">
                <Label htmlFor="rg_data.numero">RG</Label>
                <Input id="rg_data.numero" name="rg_data.numero" value={form.rg_data.numero} onChange={handleChange} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="rg_data.orgao_emissor">Órgão</Label>
                <Input id="rg_data.orgao_emissor" name="rg_data.orgao_emissor" value={form.rg_data.orgao_emissor} onChange={handleChange} placeholder="SSP, DIC, etc." />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="data_expedicao_rg">Data Exp.</Label>
                <Input 
                  id="data_expedicao_rg" 
                  name="data_expedicao_rg" 
                  value={displayDates.data_expedicao_rg} 
                  onChange={handleChange} 
                  placeholder="dd/mm/aaaa"
                  maxLength={10}
                  className="w-full"
                />
              </div>
            </div>

            {/* Linha 5: CTPS, Série, Título, Zona, Seção */}
            <div className="grid grid-cols-12 gap-4">
              <div className="space-y-2 col-span-3">
                <Label htmlFor="ctps">CTPS</Label>
                <Input id="ctps" name="ctps" value={form.ctps} onChange={handleChange} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="serie_ctps">Série</Label>
                <Input id="serie_ctps" name="serie_ctps" value={form.serie_ctps} onChange={handleChange} />
              </div>
              <div className="space-y-2 col-span-3">
                <Label htmlFor="titulo_eleitor">Título</Label>
                <Input id="titulo_eleitor" name="titulo_eleitor" value={form.titulo_eleitor} onChange={handleChange} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="zona_titulo">Zona</Label>
                <Input id="zona_titulo" name="zona_titulo" value={form.zona_titulo} onChange={handleChange} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="secao_titulo">Seção</Label>
                <Input id="secao_titulo" name="secao_titulo" value={form.secao_titulo} onChange={handleChange} />
              </div>
            </div>

            {/* Linha 6: Carteira de Reservista */}
            <div className="space-y-2">
              <Label htmlFor="carteira_reservista">Carteira de Reservista</Label>
              <Input id="carteira_reservista" name="carteira_reservista" value={form.carteira_reservista} onChange={handleChange} />
            </div>

            {/* Linha 7: Nacionalidade, Naturalidade, Tipo Sanguíneo */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nacionalidade">Nacionalidade</Label>
                <Input id="nacionalidade" name="nacionalidade" value={form.nacionalidade} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="naturalidade">Naturalidade</Label>
                <Input id="naturalidade" name="naturalidade" value={form.naturalidade} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo_sanguineo">Tipo Sanguíneo</Label>
                <Select value={form.tipo_sanguineo} onValueChange={(value) => handleSelectChange(value, 'tipo_sanguineo')}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

          </div>

          <Separator className="my-6" />

          {/* Seção: Filiação */}
          <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-600">
                <Users className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-amber-800">Filiação</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome_pai">Nome do Pai</Label>
                <Input id="nome_pai" name="nome_pai" value={form.nome_pai} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nome_mae">Nome da Mãe</Label>
                <Input id="nome_mae" name="nome_mae" value={form.nome_mae} onChange={handleChange} />
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Seção: Endereço */}
          <div className="bg-orange-50/50 border border-orange-100 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500">
                <Home className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-orange-700">Endereço</h3>
            </div>
            
            {/* Linha 1: CEP e UF */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endereco.cep">CEP</Label>
                <div className="relative">
                  <Input 
                    id="endereco.cep" 
                    name="endereco.cep" 
                    value={form.endereco.cep} 
                    onChange={handleChange} 
                    placeholder="00000-000" 
                    className={loadingCep ? 'pr-10' : ''}
                  />
                  {loadingCep && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endereco.uf">UF</Label>
                <Select value={form.endereco.uf} onValueChange={(value) => handleSelectChange(value, 'endereco.uf')}>
                  <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {estadoOptions.map((estado) => (
                      <SelectItem key={estado.codigo} value={estado.codigo || ''}>{estado.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Demais campos do endereço */}
            <div className="space-y-2">
              <Label htmlFor="endereco.logradouro">Logradouro</Label>
              <Input id="endereco.logradouro" name="endereco.logradouro" value={form.endereco.logradouro} onChange={handleChange} placeholder="Rua, Avenida, etc." />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endereco.numero">Número</Label>
                <Input id="endereco.numero" name="endereco.numero" value={form.endereco.numero} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endereco.complemento">Complemento</Label>
                <Input id="endereco.complemento" name="endereco.complemento" value={form.endereco.complemento} onChange={handleChange} placeholder="Apto, Bloco, etc." />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endereco.bairro">Bairro</Label>
                <Input id="endereco.bairro" name="endereco.bairro" value={form.endereco.bairro} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endereco.cidade">Cidade</Label>
                <Input id="endereco.cidade" name="endereco.cidade" value={form.endereco.cidade} onChange={handleChange} />
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Seção: Dados Profissionais */}
          <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-500">
                <Briefcase className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700">Dados Profissionais</h3>
            </div>
            
            {/* Linha 1: Processo, Livro, Folha */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="processo">Processo</Label>
                <Input id="processo" name="processo" value={form.processo} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="livro">Livro</Label>
                <Input id="livro" name="livro" value={form.livro} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="folha">Folha</Label>
                <Input id="folha" name="folha" value={form.folha} onChange={handleChange} />
              </div>
            </div>

            {/* Linha 2: INSS, É Encarregado */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="inss">INSS</Label>
                <Input id="inss" name="inss" value={form.inss} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e_encarregado">É Encarregado?</Label>
                <Select value={form.e_encarregado} onValueChange={(value) => handleSelectChange(value, 'e_encarregado')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Linha 3: Situação, DRT, Data DRT */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="situacao">Situação*</Label>
                <Select value={form.situacao} onValueChange={(value) => handleSelectChange(value, 'situacao')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {situacaoOptions.map((situacao) => (
                      <SelectItem key={situacao.codigo || situacao.id} value={situacao.codigo || situacao.id.toString()}>{situacao.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="drt">DRT</Label>
                <Input id="drt" name="drt" value={form.drt} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_drt">Data DRT</Label>
                <Input 
                  id="data_drt" 
                  name="data_drt" 
                  value={displayDates.data_drt} 
                  onChange={handleChange} 
                  placeholder="dd/mm/aaaa"
                  maxLength={10}
                  className="w-full"
                />
              </div>
            </div>

            {/* Linha 4: Data Registro, Data Admissão */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_registro">Data de Registro</Label>
                <Input 
                  id="data_registro" 
                  name="data_registro" 
                  value={displayDates.data_registro} 
                  onChange={handleChange} 
                  placeholder="dd/mm/aaaa"
                  maxLength={10}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_admissao">Data de Admissão</Label>
                <Input 
                  id="data_admissao" 
                  name="data_admissao" 
                  value={displayDates.data_admissao} 
                  onChange={handleChange} 
                  placeholder="dd/mm/aaaa"
                  maxLength={10}
                  className="w-full"
                />
              </div>
            </div>

            {/* Linha 5: Observação */}
            <div className="space-y-2">
              <Label htmlFor="observacao">Observações</Label>
              <Textarea id="observacao" name="observacao" value={form.observacao} onChange={handleChange} rows={3} placeholder="Informações adicionais sobre o associado" />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleCloseModal} disabled={isLoading}>Cancelar</Button>
            <Button type="submit" disabled={isLoading || optionsLoading}>
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
    </>
  );
  
  const renderLoadingStep = () => (
    <>
      <DialogHeader className="space-y-4 pb-4 border-b">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 space-y-1">
            <DialogTitle className="text-2xl font-semibold">Cadastrando Associado</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              Por favor, aguarde enquanto processamos os dados...
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>
      
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <LoadingLottie className="w-128 h-128" style={{ width: '32rem', height: '32rem' }} />
        <p className="text-lg text-muted-foreground">Criando seu associado...</p>
      </div>
    </>
  );
  
  const renderDeclarationsStep = () => (
    <>
      <DialogHeader className="space-y-4 pb-4 border-b">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100">
            <FileText className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex-1 space-y-1">
            <DialogTitle className="text-2xl font-semibold">Associado Cadastrado com Sucesso!</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              Escolha uma declaração para imprimir ou prossiga para vincular o associado.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>
      
      <div className="space-y-6 pt-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Declaração de Vínculo */}
          <div className="p-4 border border-blue-200 rounded-lg bg-blue-50/50 hover:bg-blue-50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-blue-700">Declaração de Vínculo</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Comprova o vínculo do associado ao sindicato
            </p>
            <Button 
              size="sm" 
              className="w-full" 
              onClick={() => handlePrintDeclaration('vinculo')}
              disabled={loadingDeclaration !== null}
            >
              {loadingDeclaration === 'vinculo' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando PDF...
                </>
              ) : 'Baixar PDF'}
            </Button>
          </div>
          
          {/* Declaração de Renda */}
          <div className="p-4 border border-green-200 rounded-lg bg-green-50/50 hover:bg-green-50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold text-green-700">Declaração de Renda</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Comprova a renda do associado para fins legais
            </p>
            <Button 
              size="sm" 
              className="w-full" 
              onClick={() => handlePrintDeclaration('renda')}
              disabled={loadingDeclaration !== null}
            >
              {loadingDeclaration === 'renda' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando PDF...
                </>
              ) : 'Baixar PDF'}
            </Button>
          </div>
          
          {/* Declaração de Trabalho */}
          <div className="p-4 border border-orange-200 rounded-lg bg-orange-50/50 hover:bg-orange-50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-5 w-5 text-orange-600" />
              <h4 className="font-semibold text-orange-700">Declaração de Trabalho</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Comprova a situação profissional do associado
            </p>
            <Button 
              size="sm" 
              className="w-full" 
              onClick={() => handlePrintDeclaration('trabalho')}
              disabled={loadingDeclaration !== null}
            >
              {loadingDeclaration === 'trabalho' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando PDF...
                </>
              ) : 'Baixar PDF'}
            </Button>
          </div>
          
          {/* Declaração de Cadastro */}
          <div className="p-4 border border-purple-200 rounded-lg bg-purple-50/50 hover:bg-purple-50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <h4 className="font-semibold text-purple-700">Declaração de Cadastro</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Comprova o cadastro atualizado do associado
            </p>
            <Button 
              size="sm" 
              className="w-full" 
              onClick={() => handlePrintDeclaration('cadastro')}
              disabled={loadingDeclaration !== null}
            >
              {loadingDeclaration === 'cadastro' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando PDF...
                </>
              ) : 'Baixar PDF'}
            </Button>
          </div>
        </div>
        
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => setCurrentStep('cracha')}>
            Pular Declarações
          </Button>
          <Button onClick={() => setCurrentStep('cracha')}>
            Próxima Etapa: Gerar Crachá
          </Button>
        </div>
      </div>
    </>
  );
  
  const renderCrachaStep = () => (
    <>
      <DialogHeader className="space-y-4 pb-4 border-b">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100">
            <IdCard className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="flex-1 space-y-1">
            <DialogTitle className="text-2xl font-semibold">Gerar Crachá</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              Crachá de identificação para {createdAssociado?.nome_completo}.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>
      
      <div className="space-y-6 pt-4">
        <div className="flex justify-center">
          <div className="bg-white border-2 border-gray-300 rounded-lg p-6 shadow-lg max-w-sm">
            {/* Header do Crachá */}
            <div className="text-center mb-4">
              <div className="bg-indigo-600 text-white p-2 rounded-t-lg -m-6 mb-4">
                <h3 className="font-bold text-sm">SINGAERJ</h3>
                <p className="text-xs">Sindicato dos Guardadores RJ</p>
              </div>
            </div>

            {/* Foto do Associado (placeholder) */}
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-gray-300">
                <User className="w-12 h-12 text-gray-400" />
              </div>
            </div>

            {/* Dados do Associado */}
            <div className="text-center space-y-2 mb-4">
              <h4 className="font-bold text-sm text-gray-800">NOME DO ASSOCIADO</h4>
              <div className="space-y-1 text-xs text-gray-600">
                <p><strong>MAT:</strong> 00000</p>
                <p><strong>DRT:</strong> 00000000</p>
                <p><strong>CPF:</strong> 000.000.000-00</p>
              </div>
            </div>

            {/* QR Code Placeholder */}
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gray-800 flex items-center justify-center">
                <QrCode className="w-16 h-16 text-white" />
              </div>
            </div>

            {/* Footer */}
            <div className="text-center">
              <p className="text-xs text-gray-500">Válido até: DEZ/2024</p>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Este é um modelo genérico do crachá. Em breve será implementada a personalização com dados reais.
          </p>
          <Button variant="outline" disabled>
            <CreditCard className="mr-2 h-4 w-4" />
            Gerar Crachá Personalizado (Em breve)
          </Button>
        </div>
        
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => setCurrentStep('declarations')}>
            Voltar
          </Button>
          <Button onClick={() => setCurrentStep('linking-encarregados')}>
            Próxima Etapa: Vincular Encarregados
          </Button>
        </div>
      </div>
    </>
  );
  
  const renderLinkingEncarregadosStep = () => (
    <>
      <DialogHeader className="space-y-4 pb-4 border-b">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1 space-y-1">
            <DialogTitle className="text-2xl font-semibold">Vincular a Encarregados</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              Vincule {createdAssociado?.nome_completo} a um ou mais encarregados responsáveis.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>
      
      <div className="space-y-6 pt-4">
        <div className="border rounded-lg p-6 bg-blue-50/50 border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-blue-700">Selecione os Encarregados</h4>
            </div>
            {linkingState.encarregadosVinculados.length > 0 && (
              <div className="text-green-600 text-sm font-medium">✓ {linkingState.encarregadosVinculados.length} Vinculado(s)</div>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            Selecione um ou mais encarregados para supervisionar este associado
          </p>
          
          <EncarregadoSelector 
            associadoId={createdAssociado?.id || ''} 
            onVinculado={(encarregadoIds) => {
              handleEncarregadoVinculado(encarregadoIds);
              toast.success('Encarregado(s) vinculado(s) com sucesso!');
            }}
          />
          
          {linkingState.encarregadosVinculados.length > 0 && (
            <div className="flex items-center gap-2 text-green-700 mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <Users className="h-4 w-4" />
              <span className="text-sm">{linkingState.encarregadosVinculados.length} encarregado(s) vinculado(s) com sucesso!</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => setCurrentStep('cracha')}>
            Voltar
          </Button>
          <Button onClick={() => setCurrentStep('linking-areas')}>
            Próxima Etapa: Vincular Áreas
          </Button>
        </div>
      </div>
    </>
  );

  const renderLinkingAreasStep = () => (
    <>
      <DialogHeader className="space-y-4 pb-4 border-b">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100">
            <MapPin className="h-6 w-6 text-orange-600" />
          </div>
          <div className="flex-1 space-y-1">
            <DialogTitle className="text-2xl font-semibold">Vincular a Áreas</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              Vincule {createdAssociado?.nome_completo} às áreas de trabalho.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>
      
      <div className="space-y-6 pt-4">
        <div className="border rounded-lg p-6 bg-orange-50/50 border-orange-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-orange-600" />
              <h4 className="font-semibold text-orange-700">Selecione as Áreas</h4>
            </div>
            {linkingState.areasVinculadas.length > 0 && (
              <div className="text-green-600 text-sm font-medium">✓ {linkingState.areasVinculadas.length} Vinculada(s)</div>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            Selecione uma ou mais áreas de trabalho para o associado
          </p>
          
          <AreaSelector 
            associadoId={createdAssociado?.id || ''} 
            onVinculado={(areaIds) => {
              handleAreaVinculada(areaIds);
              toast.success('Área(s) vinculada(s) com sucesso!');
            }}
          />
          
          {linkingState.areasVinculadas.length > 0 && (
            <div className="flex items-center gap-2 text-green-700 mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{linkingState.areasVinculadas.length} área(s) vinculada(s) com sucesso!</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => setCurrentStep('linking-encarregados')}>
            Voltar
          </Button>
          <div className="space-x-2">
            {(linkingState.encarregadosVinculados.length === 0 && linkingState.areasVinculadas.length === 0) && (
              <Button variant="outline" onClick={handleCloseModal}>
                Pular Vinculações
              </Button>
            )}
            <Button 
              onClick={() => setCurrentStep('summary')}
              className="bg-green-600 hover:bg-green-700"
            >
              Finalizar
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  const renderSummaryStep = () => {
    // Busca os dados dos encarregados e áreas vinculadas
    const encarregadosVinculados = encarregados.filter(encarregado => 
      linkingState.encarregadosVinculados.includes(encarregado.id)
    );
    
    const areasVinculadas = areas.filter(area => 
      linkingState.areasVinculadas.includes(area.id.toString())
    );

    return (
      <>
        <DialogHeader className="space-y-4 pb-4 border-b">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1 space-y-1">
              <DialogTitle className="text-2xl font-semibold">Cadastro Concluído!</DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                Resumo do associado criado e vinculações realizadas.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-6 space-y-6">
          {/* Lottie de Sucesso */}
          <div className="flex justify-center">
            <CheckedLottie className="w-32 h-32" loop={false} />
          </div>
          
          {/* Dados do Associado com Foto */}
          {createdAssociado && (
            <div className="border rounded-lg p-6 bg-green-50/50 border-green-200">
              <div className="flex items-center gap-4 mb-4">
                {/* Foto do Associado */}
                <Avatar className="h-20 w-20 ring-2 ring-green-500/30 ring-offset-2">
                  <AvatarImage 
                    src={form.foto ? URL.createObjectURL(form.foto) : ''} 
                    className="object-cover" 
                  />
                  <AvatarFallback className="bg-green-100 text-green-700 text-xl">
                    {createdAssociado.nome_completo.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-xl text-green-800">{createdAssociado.nome_completo}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><strong>Matrícula:</strong> {createdAssociado.matricula}</p>
                    <p><strong>DRT:</strong> {createdAssociado.drt}</p>
                    <p><strong>CPF:</strong> {createdAssociado.cpf}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Encarregados Vinculados */}
          {encarregadosVinculados.length > 0 && (
            <div className="border rounded-lg p-4 bg-blue-50/50 border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800">
                  Encarregados Vinculados ({encarregadosVinculados.length})
                </h4>
              </div>
              <div className="space-y-2">
                {encarregadosVinculados.map((encarregado) => (
                  <div key={encarregado.id} className="flex items-center gap-3 p-2 bg-white rounded border border-blue-100">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={encarregado.foto_url || ''} className="object-cover" />
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                        {getInitials(encarregado.nome_completo)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{formatName(encarregado.nome_completo)}</p>
                      <p className="text-xs text-muted-foreground">Mat: {encarregado.matricula}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Áreas Vinculadas */}
          {areasVinculadas.length > 0 && (
            <div className="border rounded-lg p-4 bg-orange-50/50 border-orange-200">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-orange-600" />
                <h4 className="font-semibold text-orange-800">
                  Áreas Vinculadas ({areasVinculadas.length})
                </h4>
              </div>
              <div className="space-y-2">
                {areasVinculadas.map((area) => (
                  <div key={area.id} className="flex items-center gap-3 p-2 bg-white rounded border border-orange-100">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {area.codigo_singaerj} - {area.logradouro} {area.numero}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {area.bairro} • {area.vagas} vagas
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Caso não tenha vinculações */}
          {encarregadosVinculados.length === 0 && areasVinculadas.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Nenhuma vinculação realizada</p>
            </div>
          )}
          
          {/* Botões de ação */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setCurrentStep('linking-areas')}>
              Voltar
            </Button>
            <Button 
              onClick={handleCloseModal}
              className="bg-green-600 hover:bg-green-700 flex-1"
            >
              Fechar Formulário
            </Button>
          </div>
        </div>
      </>
    );
  };
  
  const handlePrintDeclaration = (type: string) => {
    if (!createdAssociado) return;
    
    // Ativa o loading imediatamente ao clicar
    setLoadingDeclaration(type);
    
    // Executa a geração de PDF de forma assíncrona
    setTimeout(async () => {
      try {
        const currentDate = new Date().toLocaleDateString('pt-BR');
        
        const declarations = {
      vinculo: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="/logo-medium.webp" alt="SINGAERJ" style="height: 80px; margin-bottom: 10px;" />
            <h2 style="color: #2563eb; margin: 0;">SINDICATO DOS GUARDADORES DE AUTOMÓVEIS DO RJ</h2>
          </div>
          
          <h3 style="text-align: center; color: #1f2937; margin: 30px 0;">DECLARAÇÃO DE VÍNCULO SINDICAL</h3>
          
          <p style="text-align: justify; line-height: 1.6; margin: 20px 0;">
            O SINGAERJ - Sindicato dos Guardadores de Automóveis do Estado do Rio de Janeiro, 
            pessoa jurídica de direito privado, DECLARA para os devidos fins que o(a) Sr(a) 
            <strong>${createdAssociado.nome_completo}</strong>, portador(a) do CPF n° <strong>${createdAssociado.cpf}</strong>, 
            matrícula <strong>${createdAssociado.matricula}</strong>, DRT n° <strong>${createdAssociado.drt}</strong>, 
            é associado(a) devidamente filiado(a) a este sindicato.
          </p>
          
          <p style="text-align: justify; line-height: 1.6; margin: 20px 0;">
            Esta declaração é válida para todos os fins legais e administrativos.
          </p>
          
          <div style="margin-top: 60px; text-align: center;">
            <p>Rio de Janeiro, ${currentDate}</p>
            <br/><br/>
            <div style="border-top: 1px solid #000; width: 300px; margin: 0 auto; padding-top: 10px;">
              <strong>SINGAERJ</strong><br/>
              Sindicato dos Guardadores de Automóveis do RJ
            </div>
          </div>
        </div>
      `,
      renda: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="/logo-medium.webp" alt="SINGAERJ" style="height: 80px; margin-bottom: 10px;" />
            <h2 style="color: #16a34a; margin: 0;">SINDICATO DOS GUARDADORES DE AUTOMÓVEIS DO RJ</h2>
          </div>
          
          <h3 style="text-align: center; color: #1f2937; margin: 30px 0;">DECLARAÇÃO DE RENDA</h3>
          
          <p style="text-align: justify; line-height: 1.6; margin: 20px 0;">
            Declaramos para os devidos fins que o(a) Sr(a) <strong>${createdAssociado.nome_completo}</strong>, 
            CPF n° <strong>${createdAssociado.cpf}</strong>, matrícula <strong>${createdAssociado.matricula}</strong>, 
            é associado(a) ativo(a) deste sindicato e exerce a profissão de Guardador de Automóveis 
            devidamente registrado sob DRT n° <strong>${createdAssociado.drt}</strong>.
          </p>
          
          <p style="text-align: justify; line-height: 1.6; margin: 20px 0;">
            Esta declaração poderá ser utilizada para comprovação de renda perante 
            órgãos públicos e instituições financeiras.
          </p>
          
          <div style="margin-top: 60px; text-align: center;">
            <p>Rio de Janeiro, ${currentDate}</p>
            <br/><br/>
            <div style="border-top: 1px solid #000; width: 300px; margin: 0 auto; padding-top: 10px;">
              <strong>SINGAERJ</strong><br/>
              Sindicato dos Guardadores de Automóveis do RJ
            </div>
          </div>
        </div>
      `,
      trabalho: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="/logo-medium.webp" alt="SINGAERJ" style="height: 80px; margin-bottom: 10px;" />
            <h2 style="color: #ea580c; margin: 0;">SINDICATO DOS GUARDADORES DE AUTOMÓVEIS DO RJ</h2>
          </div>
          
          <h3 style="text-align: center; color: #1f2937; margin: 30px 0;">DECLARAÇÃO DE SITUAÇÃO PROFISSIONAL</h3>
          
          <p style="text-align: justify; line-height: 1.6; margin: 20px 0;">
            Declaramos que o(a) Sr(a) <strong>${createdAssociado.nome_completo}</strong>, 
            portador(a) do CPF n° <strong>${createdAssociado.cpf}</strong>, matrícula <strong>${createdAssociado.matricula}</strong>, 
            encontra-se em situação regular como Guardador de Automóveis, 
            devidamente registrado sob DRT n° <strong>${createdAssociado.drt}</strong>.
          </p>
          
          <p style="text-align: justify; line-height: 1.6; margin: 20px 0;">
            O referido profissional está apto ao exercício de suas funções 
            em conformidade com as normas vigentes.
          </p>
          
          <div style="margin-top: 60px; text-align: center;">
            <p>Rio de Janeiro, ${currentDate}</p>
            <br/><br/>
            <div style="border-top: 1px solid #000; width: 300px; margin: 0 auto; padding-top: 10px;">
              <strong>SINGAERJ</strong><br/>
              Sindicato dos Guardadores de Automóveis do RJ
            </div>
          </div>
        </div>
      `,
      cadastro: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="/logo-medium.webp" alt="SINGAERJ" style="height: 80px; margin-bottom: 10px;" />
            <h2 style="color: #7c3aed; margin: 0;">SINDICATO DOS GUARDADORES DE AUTOMÓVEIS DO RJ</h2>
          </div>
          
          <h3 style="text-align: center; color: #1f2937; margin: 30px 0;">DECLARAÇÃO DE CADASTRO ATUALIZADO</h3>
          
          <p style="text-align: justify; line-height: 1.6; margin: 20px 0;">
            Declaramos que o(a) Sr(a) <strong>${createdAssociado.nome_completo}</strong>, 
            CPF n° <strong>${createdAssociado.cpf}</strong>, possui cadastro atualizado 
            junto a este sindicato sob matrícula n° <strong>${createdAssociado.matricula}</strong>, 
            com registro DRT n° <strong>${createdAssociado.drt}</strong>.
          </p>
          
          <p style="text-align: justify; line-height: 1.6; margin: 20px 0;">
            Todos os dados pessoais e profissionais encontram-se 
            devidamente atualizados em nosso sistema.
          </p>
          
          <div style="margin-top: 60px; text-align: center;">
            <p>Rio de Janeiro, ${currentDate}</p>
            <br/><br/>
            <div style="border-top: 1px solid #000; width: 300px; margin: 0 auto; padding-top: 10px;">
              <strong>SINGAERJ</strong><br/>
              Sindicato dos Guardadores de Automóveis do RJ
            </div>
          </div>
        </div>
      `
    };
        
        const declaration = declarations[type as keyof typeof declarations];
        
        if (!declaration) {
          throw new Error('Tipo de declaração inválido');
        }
        
        // Cria um elemento temporário para renderizar o HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = declaration;
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '0';
        tempDiv.style.width = '800px';
        document.body.appendChild(tempDiv);
        
        // Converte o HTML para canvas usando html2canvas
        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });
        
        // Remove o elemento temporário
        document.body.removeChild(tempDiv);
        
        // Cria o PDF usando jsPDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');
        
        // Calcula as dimensões para o PDF
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 295; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        
        let position = 0;
        
        // Adiciona a imagem ao PDF
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        // Se a imagem for maior que uma página, adiciona páginas extras
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        
        // Salva o PDF
        const fileName = `declaracao_${type}_${createdAssociado.nome_completo.replace(/\s+/g, '_')}.pdf`;
        pdf.save(fileName);
        
        toast.success(`PDF da declaração gerado e baixado com sucesso!`);
      } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        toast.error('Erro ao gerar o PDF da declaração');
      } finally {
        // Desativa o loading independentemente do resultado
        setLoadingDeclaration(null);
      }
    }, 50); // Pequeno delay para garantir que o loading apareça na tela
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
