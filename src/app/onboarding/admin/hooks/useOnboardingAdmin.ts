'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/** Lista de UFs brasileiras */
export const UF_LIST = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR',
  'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
];

/** Nomes completos dos estados */
export const UF_NAMES: Record<string, string> = {
  AC: 'Acre', AL: 'Alagoas', AM: 'Amazonas', AP: 'Amapá',
  BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo',
  GO: 'Goiás', MA: 'Maranhão', MG: 'Minas Gerais', MS: 'Mato Grosso do Sul',
  MT: 'Mato Grosso', PA: 'Pará', PB: 'Paraíba', PE: 'Pernambuco',
  PI: 'Piauí', PR: 'Paraná', RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte',
  RO: 'Rondônia', RR: 'Roraima', RS: 'Rio Grande do Sul', SC: 'Santa Catarina',
  SE: 'Sergipe', SP: 'São Paulo', TO: 'Tocantins',
};

export const CARGOS = [
  { value: 'deputado_estadual', label: 'Deputado Estadual' },
  { value: 'deputado_federal', label: 'Deputado Federal' },
  { value: 'vereador', label: 'Vereador' },
  { value: 'prefeito', label: 'Prefeito' },
  { value: 'senador', label: 'Senador' },
  { value: 'governador', label: 'Governador' },
];

export const CARGOS_MUNICIPAIS = ['vereador', 'prefeito'];

export const TOTAL_STEPS = 5;

export interface OnboardingFormData {
  /** Step 1 — Definição de senha (só para usuários vindos de convite) */
  password: string;
  confirmPassword: string;
  /** Step 2 — Dados da campanha */
  nomeCampanha: string;
  nomeCandidato: string;
  cargoPretendido: string;
  partido: string;
  numeroCandidato: string;
  /** Step 3 — Estado (UF) irreversível */
  uf: string;
  cidade: string;
}

/** Metadata que vem do convite Supabase (user_metadata) */
export interface InviteMetadata {
  planoTipo: 'cortesia' | 'pago' | null;
  origemConvite: string | null;
  invitedBy: string | null;
}

export interface UseOnboardingAdminReturn {
  /** Step atual (1-based) */
  currentStep: number;
  /** Total de steps */
  totalSteps: number;
  /** Dados do formulário */
  formData: OnboardingFormData;
  /** Se o usuário veio de convite (precisa definir senha) */
  isInvitedUser: boolean;
  /** Metadata do convite */
  inviteMetadata: InviteMetadata;
  /** UF confirmada pelo checkbox */
  ufConfirmed: boolean;
  /** Indica se cargo é municipal (precisa de cidade) */
  isMunicipal: boolean;
  /** Erros */
  error: string | null;
  /** Loading do submit final */
  isSubmitting: boolean;
  /** Loading inicial (carregando metadata) */
  isLoadingMetadata: boolean;
  /** Atualizar campo do form */
  updateField: (field: keyof OnboardingFormData, value: string) => void;
  /** Confirmar UF */
  setUfConfirmed: (v: boolean) => void;
  /** Avançar step */
  handleNext: () => void;
  /** Voltar step */
  handlePrev: () => void;
  /** Verifica se step atual está válido */
  isStepValid: (step: number) => boolean;
  /** Submeter tudo (campanha + membro + assinatura + senha) */
  handleSubmit: () => Promise<void>;
  /** Label do plano para exibição */
  planoLabel: string;
}

/**
 * Hook que concentra TODA a lógica do onboarding do admin:
 * - Detecta se o usuário veio de convite (metadata do Supabase)
 * - Gerencia steps, validações e navegação
 * - No submit: define senha (se convite), cria campanha, membro, profile e assinatura
 */
export function useOnboardingAdmin(): UseOnboardingAdminReturn {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);
  const [ufConfirmed, setUfConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isInvitedUser, setIsInvitedUser] = useState(false);
  const [inviteMetadata, setInviteMetadata] = useState<InviteMetadata>({
    planoTipo: null,
    origemConvite: null,
    invitedBy: null,
  });

  const [formData, setFormData] = useState<OnboardingFormData>({
    password: '',
    confirmPassword: '',
    nomeCampanha: '',
    nomeCandidato: '',
    cargoPretendido: '',
    partido: '',
    numeroCandidato: '',
    uf: '',
    cidade: '',
  });

  const isMunicipal = CARGOS_MUNICIPAIS.includes(formData.cargoPretendido);

  // Detectar se veio de convite lendo user_metadata
  useEffect(() => {
    async function loadMetadata() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setIsLoadingMetadata(false);
          return;
        }

        const meta = user.user_metadata ?? {};
        const planoTipo = meta.plano_tipo ?? null;
        const origemConvite = meta.origem_convite ?? null;
        const invitedBy = meta.invited_by ?? null;

        // Usuário é "convidado" se tem origem_convite no metadata
        // e se ainda não tem senha definida (invited_at existe e identities indica invite)
        const hasInviteOrigin = !!origemConvite;
        setIsInvitedUser(hasInviteOrigin);

        setInviteMetadata({ planoTipo, origemConvite, invitedBy });
      } catch (err) {
        console.error('[useOnboardingAdmin] Erro ao carregar metadata:', err);
      } finally {
        setIsLoadingMetadata(false);
      }
    }

    loadMetadata();
  }, []);

  /** Label amigável do plano para exibição na tela de confirmação */
  const planoLabel = inviteMetadata.planoTipo === 'cortesia'
    ? 'Cortesia Idealis (gratuito)'
    : inviteMetadata.planoTipo === 'pago'
      ? 'Plano Pago'
      : 'Cortesia Idealis (padrão)';

  const updateField = useCallback((field: keyof OnboardingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }, []);

  /**
   * Validação por step:
   * Step 1 — Senha (só se veio de convite)
   * Step 2 — Dados da campanha
   * Step 3 — UF
   * Step 4 — Tema (placeholder)
   * Step 5 — Confirmação
   */
  const isStepValid = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        // Se não veio de convite, step de senha é pulado automaticamente
        if (!isInvitedUser) return true;
        return !!(
          formData.password.length >= 6 &&
          formData.password === formData.confirmPassword
        );
      case 2:
        return !!(
          formData.nomeCampanha.trim() &&
          formData.nomeCandidato.trim() &&
          formData.cargoPretendido
        );
      case 3:
        return !!(formData.uf && ufConfirmed && (!isMunicipal || formData.cidade.trim()));
      case 4:
        return true; // Tema placeholder
      case 5:
        return true; // Confirmação
      default:
        return false;
    }
  }, [formData, isInvitedUser, ufConfirmed, isMunicipal]);

  const handleNext = useCallback(() => {
    if (currentStep < TOTAL_STEPS && isStepValid(currentStep)) {
      let nextStep = currentStep + 1;
      // Pular step 1 (senha) se não veio de convite
      if (nextStep === 1 && !isInvitedUser) nextStep = 2;
      setCurrentStep(nextStep);
    }
  }, [currentStep, isStepValid, isInvitedUser]);

  const handlePrev = useCallback(() => {
    if (currentStep > 1) {
      let prevStep = currentStep - 1;
      // Pular step 1 (senha) se não veio de convite
      if (prevStep === 1 && !isInvitedUser) prevStep = 1; // fica no 1 (não desce abaixo)
      setCurrentStep(Math.max(isInvitedUser ? 1 : 2, prevStep));
    }
  }, [currentStep, isInvitedUser]);

  /**
   * Submit final:
   * 1) Define senha (se convite)
   * 2) Cria campanha
   * 3) Cria campanha_membro
   * 4) Atualiza profiles (campanha_id + roles)
   * 5) Busca plano e cria assinatura
   * 6) Redireciona para /dashboard
   */
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Sessão expirada. Faça login novamente.');
        return;
      }

      // 1) Definir senha se veio de convite
      if (isInvitedUser && formData.password) {
        const { error: pwError } = await supabase.auth.updateUser({
          password: formData.password,
        });
        if (pwError) {
          console.error('[Onboarding] Erro ao definir senha:', pwError);
          setError(pwError.message);
          return;
        }
      }

      // 2) Criar campanha
      const { data: campanha, error: campanhaError } = await supabase
        .from('campanha')
        .insert({
          nome: formData.nomeCampanha.trim(),
          nome_candidato: formData.nomeCandidato.trim(),
          cargo_pretendido: formData.cargoPretendido,
          partido: formData.partido.trim() || null,
          numero_candidato: formData.numeroCandidato.trim() || null,
          uf: formData.uf,
          cidade: isMunicipal ? formData.cidade.trim() : null,
          status: 'ativa',
        })
        .select('id')
        .single();

      if (campanhaError || !campanha) {
        console.error('[Onboarding] Erro ao criar campanha:', campanhaError);
        setError(campanhaError?.message ?? 'Erro ao criar campanha');
        return;
      }

      // 3) Criar vínculo admin na campanha_membro
      const { error: membroError } = await supabase.from('campanha_membro').insert({
        campanha_id: campanha.id,
        profile_id: user.id,
        role: 'admin',
        status: 'ativo',
      });

      if (membroError) {
        console.error('[Onboarding] Erro ao criar membro:', membroError);
        setError(membroError.message);
        return;
      }

      // 4) Atualizar profile com campanha_id e role admin
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ campanha_id: campanha.id, roles: ['admin'] })
        .eq('id', user.id);

      if (profileError) {
        console.error('[Onboarding] Erro ao atualizar perfil:', profileError);
        setError(profileError.message);
        return;
      }

      // 5) Buscar plano correspondente e criar assinatura
      const planoSlug = inviteMetadata.planoTipo === 'pago' ? 'basico' : 'cortesia';
      const { data: plano } = await supabase
        .from('plano')
        .select('id')
        .eq('slug', planoSlug)
        .single();

      if (plano) {
        const isCortesia = planoSlug === 'cortesia';
        const { error: assError } = await supabase.from('assinatura').insert({
          campanha_id: campanha.id,
          plano_id: plano.id,
          status: 'ativa',
          data_inicio: new Date().toISOString().split('T')[0],
          data_fim: isCortesia ? null : null, // pago: definir depois
          ciclo: isCortesia ? 'cortesia' : 'mensal',
          valor_atual: isCortesia ? 0 : null,
          motivo_cortesia: isCortesia ? 'Cliente Idealis — convite cortesia' : null,
        });

        if (assError) {
          // Não bloqueia o fluxo — a assinatura pode ser criada depois
          console.error('[Onboarding] Erro ao criar assinatura (não-bloqueante):', assError);
        }
      }

      // 6) Redirecionar para dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('[Onboarding] Erro inesperado:', err);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isInvitedUser, inviteMetadata, isMunicipal, router]);

  // Se não veio de convite, começar no step 2 (pular senha)
  useEffect(() => {
    if (!isLoadingMetadata && !isInvitedUser && currentStep === 1) {
      setCurrentStep(2);
    }
  }, [isLoadingMetadata, isInvitedUser, currentStep]);

  return {
    currentStep,
    totalSteps: TOTAL_STEPS,
    formData,
    isInvitedUser,
    inviteMetadata,
    ufConfirmed,
    isMunicipal,
    error,
    isSubmitting,
    isLoadingMetadata,
    updateField,
    setUfConfirmed,
    handleNext,
    handlePrev,
    isStepValid,
    handleSubmit,
    planoLabel,
  };
}
