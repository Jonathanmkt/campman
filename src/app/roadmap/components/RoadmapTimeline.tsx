'use client';

import { CheckCircle2, Clock, AlertTriangle, Rocket, Activity, TrendingUp, Zap } from 'lucide-react';

type Status = 'pending' | 'done' | 'delayed';

interface RoadmapTask {
  code: string;
  title: string;
  description: string;
  dueDate: string; // Formato ISO (YYYY-MM-DD)
  status: Status;
}

interface RoadmapPhase {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  tasks: RoadmapTask[];
}

const roadmapPhases: RoadmapPhase[] = [
  {
    id: 'fase-1',
    title: 'Fase 1 — Fundação Multi-Tenant',
    description:
      'Renomeação do projeto, criação das tabelas `campanha`/`campanha_membro`, RLS completo e RBAC com perfil admin.',
    startDate: '2026-02-13',
    endDate: '2026-02-16',
    tasks: [
      {
        code: '1.1',
        title: 'Renomeação e Desacoplamento',
        description: 'Renomear repositório/projeto, atualizar remotos e remover todos os hardcodes "Thiago Moura".',
        dueDate: '2026-02-13',
        status: 'done',
      },
      {
        code: '1.2',
        title: 'Modelagem Multi-Tenant + Monetização',
        description:
          'Criar tabela `campanha`, `campanha_membro`, adicionar `campanha_id` em todas as tabelas, RLS e campos de plano/limites.',
        dueDate: '2026-02-15',
        status: 'done',
      },
      {
        code: '1.extra',
        title: 'Landing Page (Rascunho)',
        description: 'Landing page “coming soon” criada para avisar que o Idealis Core será lançado em breve.',
        dueDate: '2026-02-15',
        status: 'done',
      },
      {
        code: '1.3',
        title: 'RBAC e Hierarquia de Convites',
        description:
          'Atualizar middleware, incluir role admin, hierarquia de convites e Sidebar dinâmica para dados da campanha.',
        dueDate: '2026-02-16',
        status: 'done',
      },
    ],
  },
  {
    id: 'fase-2',
    title: 'Fase 2 — Monetização, Onboarding e Configuração',
    description:
      'Integração Pagar.me, SMTP customizado, fluxo completo de onboarding do admin via convite e tela de configurações da campanha.',
    startDate: '2026-02-17',
    endDate: '2026-02-24',
    tasks: [
      {
        code: '2.extra',
        title: 'Integração Pagar.me + Webhook',
        description:
          'Checkout `/checkout`, webhook `/api/webhooks/pagarme`, tabela `pedidos`, convite automático via `inviteUserByEmail` ao confirmar pagamento.',
        dueDate: '2026-02-17',
        status: 'done',
      },
      {
        code: '2.smtp',
        title: 'SMTP Customizado + Template de Email',
        description:
          'HostGator SMTP configurado no Supabase (`nao-responda@idealiscore.com.br`), template HTML de convite criado com link PKCE correto (`/auth/confirm?token_hash=...`).',
        dueDate: '2026-02-17',
        status: 'done',
      },
      {
        code: '2.1',
        title: 'Onboarding do Admin (5 Steps)',
        description:
          'Fluxo multi-step: definição de senha, dados da campanha, UF irreversível, tema (placeholder) e confirmação. Cria campanha, campanha_membro, profile e assinatura. Trigger auto-profile em auth.users.',
        dueDate: '2026-02-19',
        status: 'done',
      },
      {
        code: '2.2',
        title: 'Temas e Cores (Modo Híbrido)',
        description:
          'Após o georreferenciamento, implementar presets + ajustes manuais com variáveis CSS aplicadas ao dashboard e convites.',
        dueDate: '2026-02-24',
        status: 'pending',
      },
    ],
  },
  {
    id: 'fase-3',
    title: 'Fase 3 — Georreferenciamento Dinâmico',
    description:
      'Parametrizar mapas, geocode e filtros por estado escolhido no onboarding, removendo qualquer referência fixa ao RJ.',
    startDate: '2026-02-19',
    endDate: '2026-02-20',
    tasks: [
      {
        code: '3.1',
        title: 'Mapa, Busca e API por UF',
        description:
          'Centralizar coordenadas por estado, atualizar GoogleMap/MapSearch/Geocode e coluna `area.estado` para ser dinâmica.',
        dueDate: '2026-02-20',
        status: 'pending',
      },
    ],
  },
  {
    id: 'fase-4',
    title: 'Fase 4 — Convites e Engajamento',
    description:
      'Convites via telefone usando a API oficial do WhatsApp Business e QR Codes rastreáveis para campanhas e eventos.',
    startDate: '2026-02-21',
    endDate: '2026-02-23',
    tasks: [
      {
        code: '4.1',
        title: 'Convites com WhatsApp Oficial',
        description:
          'Integração com a Cloud API do WhatsApp, templates aprovados e dashboard de convites com Phone OTP do Supabase.',
        dueDate: '2026-02-22',
        status: 'pending',
      },
      {
        code: '4.2',
        title: 'QR Codes com Analytics',
        description:
          'Tabela `qr_code_campanha`, rota pública /convite/[codigo], métricas de origem e dashboard para download dos QR Codes.',
        dueDate: '2026-02-23',
        status: 'pending',
      },
    ],
  },
  {
    id: 'fase-5',
    title: 'Fase 5 — Aplicativo Nativo Expo',
    description:
      'Criação do repositório `idealiscore-mobile` via Expo, migração das telas críticas e preparação para builds nas lojas.',
    startDate: '2026-02-25',
    endDate: '2026-02-26',
    tasks: [
      {
        code: '5.1',
        title: 'Idealis Core Mobile (Expo)',
        description:
          'Inicializar projeto Expo, integrar Supabase, portar telas de login, onboarding, lideranças e eleitores, além do mapa nativo.',
        dueDate: '2026-02-26',
        status: 'pending',
      },
    ],
  },
  {
    id: 'fase-6',
    title: 'Fase 6 — Segurança e Hardening',
    description:
      'Auditar RLS, performance, rate limiting, remoção de rotas legacy e validação de isolamento multi-tenant.',
    startDate: '2026-02-27',
    endDate: '2026-02-28',
    tasks: [
      {
        code: '6.1',
        title: 'Auditoria Final e Limpeza',
        description:
          'Executar advisors do Supabase, criar índices, testes de isolamento e remover páginas temporárias e rotas mobile antigas.',
        dueDate: '2026-02-28',
        status: 'pending',
      },
    ],
  },
];

interface StatusStyle {
  label: string;
  dotBg: string;
  dotBorder: string;
  dotIcon: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  cardBorder: string;
  cardAccent: string;
}

const statusStyles: Record<Status, StatusStyle> = {
  pending: {
    label: 'Pendente',
    dotBg: 'bg-gray-100',
    dotBorder: 'border-gray-300',
    dotIcon: 'text-gray-400',
    badgeBg: 'bg-gray-100',
    badgeText: 'text-gray-500',
    badgeBorder: 'border-gray-200',
    cardBorder: 'border-gray-200',
    cardAccent: 'from-gray-50 to-white',
  },
  done: {
    label: 'Concluído',
    dotBg: 'bg-emerald-100',
    dotBorder: 'border-emerald-400',
    dotIcon: 'text-emerald-600',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    cardBorder: 'border-emerald-200',
    cardAccent: 'from-emerald-50/50 to-white',
  },
  delayed: {
    label: 'Atrasado',
    dotBg: 'bg-red-100',
    dotBorder: 'border-red-400',
    dotIcon: 'text-red-600',
    badgeBg: 'bg-red-50',
    badgeText: 'text-red-700',
    badgeBorder: 'border-red-200',
    cardBorder: 'border-red-200',
    cardAccent: 'from-red-50/50 to-white',
  },
};

function StatusIcon({ status, className }: { status: Status; className?: string }) {
  switch (status) {
    case 'done':
      return <CheckCircle2 className={className} />;
    case 'delayed':
      return <AlertTriangle className={className} />;
    default:
      return <Clock className={className} />;
  }
}

const formatDate = (dateString: string) =>
  new Date(`${dateString}T00:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });

const formatRange = (start: string, end: string) => `${formatDate(start)} · ${formatDate(end)}`;

const parseDate = (dateString: string) => new Date(`${dateString}T00:00:00`);

const scheduleStates = {
  ahead: {
    label: 'Adiantado',
    description: 'Você concluiu mais marcos do que o previsto para hoje.',
    badgeBg: 'bg-emerald-100 text-emerald-700',
    icon: TrendingUp,
  },
  onTrack: {
    label: 'Dentro do Cronograma',
    description: 'Os marcos concluídos estão alinhados ao plano.',
    badgeBg: 'bg-blue-100 text-blue-700',
    icon: Activity,
  },
  delayed: {
    label: 'Atrasado',
    description: 'Existem itens vencidos que ainda não foram concluídos.',
    badgeBg: 'bg-red-100 text-red-700',
    icon: AlertTriangle,
  },
} as const;

export default function RoadmapTimeline() {
  const allTasks = roadmapPhases.flatMap((phase) => phase.tasks);
  const totalTasks = allTasks.length;
  const doneCount = allTasks.filter((task) => task.status === 'done').length;
  const progressPercent = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  const today = new Date();
  const expectedTasks = allTasks.filter((task) => today >= parseDate(task.dueDate)).length;
  const clampedExpected = Math.min(expectedTasks, totalTasks);

  const scheduleStatus = (() => {
    if (doneCount > clampedExpected) {
      return { state: scheduleStates.ahead, variant: 'ahead' as const };
    }
    if (doneCount === clampedExpected) {
      return { state: scheduleStates.onTrack, variant: 'onTrack' as const };
    }
    return { state: scheduleStates.delayed, variant: 'delayed' as const };
  })();

  const nextTask = allTasks.find((task) => task.status !== 'done');

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* ── Header ── */}
      <header
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1C2954 0%, #2a3d6e 50%, #329788 100%)' }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/4" />
        </div>

        <div className="relative max-w-2xl mx-auto px-6 py-12 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
            <Rocket className="h-4 w-4 text-[#e4d196]" />
            <span className="text-sm font-medium text-white/90">Fevereiro 2026</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Idealis Core
          </h1>
          <p className="mt-3 text-lg text-white/70">
            Roadmap de Implementações
          </p>

          {/* Cards de progresso e cronograma */}
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="bg-white/15 backdrop-blur rounded-2xl p-5 border border-white/20 text-left">
              <div className="flex items-center justify-between text-sm text-white/70">
                <span>Progresso geral</span>
                <span className="font-semibold text-[#e4d196]">{progressPercent}%</span>
              </div>
              <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progressPercent}%`, background: 'linear-gradient(90deg, #329788, #e4d196)' }}
                />
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-white/60">
                <span>
                  {doneCount} de {totalTasks} marcos concluídos
                </span>
                <span>
                  Esperado até hoje: <strong>{clampedExpected}</strong>
                </span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/20 text-left">
              <div className="flex items-center gap-2 text-white/80 text-xs font-semibold uppercase tracking-[0.2em]">
                <Zap className="h-4 w-4 text-[#e4d196]" />
                Status do Cronograma
              </div>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold shadow-sm bg-white/90 text-[#1C2954]">
                <scheduleStatus.state.icon className="h-4 w-4" />
                {scheduleStatus.state.label}
              </div>
              <p className="mt-3 text-sm text-white/80 leading-relaxed">{scheduleStatus.state.description}</p>
              <div className="mt-4 text-xs text-white/60 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                {clampedExpected} etapas deveriam estar concluídas até {today.toLocaleDateString('pt-BR')}.
              </div>
              {nextTask && (
                <div className="mt-2 text-xs text-white/70 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Próximo marco: {nextTask.code} • {nextTask.title} (até {formatDate(nextTask.dueDate)})
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Timeline ── */}
      <main className="max-w-3xl mx-auto px-6 py-14 space-y-10">
        {roadmapPhases.map((phase) => (
          <section key={phase.id} className="relative rounded-3xl bg-white px-6 py-7 shadow-sm border border-gray-200">
            <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 pb-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#329788]">{phase.id.replace('-', ' ').toUpperCase()}</p>
                <h2 className="text-xl font-semibold text-[#1C2954]">{phase.title}</h2>
                <p className="text-sm text-gray-500 mt-1 max-w-2xl">{phase.description}</p>
              </div>
              <div className="ml-auto text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                {formatRange(phase.startDate, phase.endDate)}
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {phase.tasks.map((task) => {
                const style = statusStyles[task.status];

                return (
                  <div
                    key={task.code}
                    className={`rounded-2xl border ${style.cardBorder} bg-gradient-to-br ${style.cardAccent} p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md`}
                  >
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[#1C2954]">
                        <StatusIcon status={task.status} className="h-3.5 w-3.5" />
                        {task.code}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[#1C2954] text-[#e4d196]">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDate(task.dueDate)}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md ${style.badgeBg} ${style.badgeText} border ${style.badgeBorder}`}>
                        <StatusIcon status={task.status} className="h-3 w-3" />
                        {style.label}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#1C2954]">{task.title}</h3>
                    <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{task.description}</p>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      {/* ── Legenda ── */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-4 text-center">
            Legenda de Status
          </p>
          <div className="flex items-center justify-center gap-5 flex-wrap">
            {(['pending', 'done', 'delayed'] as Status[]).map((key) => {
              const style = statusStyles[key];
              return (
                <div
                  key={key}
                  className={`inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-lg ${style.badgeBg} ${style.badgeText} border ${style.badgeBorder}`}
                >
                  <StatusIcon status={key} className="h-3.5 w-3.5" />
                  {style.label}
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-gray-400 text-center mt-6">
            &copy; 2026 Idealis Core &mdash; Atualizado em tempo real pela equipe de desenvolvimento.
          </p>
        </div>
      </footer>
    </div>
  );
}
