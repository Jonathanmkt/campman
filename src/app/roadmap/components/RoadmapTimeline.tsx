'use client';

import { CheckCircle2, Clock, AlertTriangle, Rocket } from 'lucide-react';

// ============================================================
// STATUS DE CADA ITEM DO ROADMAP
// Para alterar o status, basta trocar o valor de "status":
//   "pending"  → cinza  (pendente)
//   "done"     → verde  (concluído)
//   "delayed"  → vermelho (atrasado)
// ============================================================
type Status = 'pending' | 'done' | 'delayed';

interface RoadmapItem {
  date: string;
  title: string;
  description: string;
  status: Status;
}

const roadmapItems: RoadmapItem[] = [
  {
    date: '13/02',
    title: 'Banco de Dados Multi-Campanhas',
    description:
      'Reestruturação completa do banco de dados para suportar múltiplos candidatos com isolamento de dados por campanha.',
    status: 'pending',
  },
  {
    date: '15/02',
    title: 'Sistema de Autenticação e Convites',
    description:
      'Novo fluxo de convites controlado por administradores, com papéis de acesso e expiração automática.',
    status: 'pending',
  },
  {
    date: '17/02',
    title: 'Suporte Multi-Estados',
    description:
      'Geolocalização configurável por campanha, permitindo buscas de endereço otimizadas para qualquer estado do Brasil.',
    status: 'pending',
  },
  {
    date: '19/02',
    title: 'Aplicativo Nativo (Base Compartilhada)',
    description:
      'Migração do módulo mobile web para aplicativo nativo com base de código compartilhada, preparando para publicação nas lojas.',
    status: 'pending',
  },
  {
    date: '21/02',
    title: 'QR Codes com Rastreamento de Origem',
    description:
      'Geração de QR Codes vinculados a campanhas publicitárias ou eventos, com registro de origem, local e data para analytics.',
    status: 'pending',
  },
  {
    date: '23/02',
    title: 'Identidade Visual (Design System)',
    description:
      'Nova logo, tipografia, paleta de cores e tokens de design — posicionando o CampMan como plataforma white-label.',
    status: 'pending',
  },
  {
    date: '25/02',
    title: 'Publicação na Google Play Store',
    description:
      'Build Android (AAB), ícones, splash screens, políticas de privacidade e publicação beta na Play Store.',
    status: 'pending',
  },
  {
    date: '27/02',
    title: 'Publicação na Apple App Store',
    description:
      'Configuração iOS, certificados, screenshots, revisão de guidelines e submissão na App Store.',
    status: 'pending',
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

export default function RoadmapTimeline() {
  const totalItems = roadmapItems.length;
  const doneCount = roadmapItems.filter((i) => i.status === 'done').length;
  const progressPercent = totalItems > 0 ? Math.round((doneCount / totalItems) * 100) : 0;

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
            CampMan
          </h1>
          <p className="mt-3 text-lg text-white/70">
            Roadmap de Implementações
          </p>

          {/* Barra de progresso */}
          <div className="mt-8 max-w-xs mx-auto">
            <div className="flex items-center justify-between text-xs text-white/60 mb-2">
              <span>Progresso geral</span>
              <span className="font-semibold text-[#e4d196]">{progressPercent}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, #329788, #e4d196)',
                }}
              />
            </div>
            <p className="text-xs text-white/40 mt-2">
              {doneCount} de {totalItems} etapas concluídas
            </p>
          </div>
        </div>
      </header>

      {/* ── Timeline ── */}
      <main className="max-w-2xl mx-auto px-6 py-14">
        <div className="relative">
          {/* Linha vertical */}
          <div
            className="absolute left-[19px] top-4 bottom-4 w-[2px]"
            style={{ background: 'linear-gradient(to bottom, #329788 0%, #e5e7eb 30%, #e5e7eb 100%)' }}
          />

          <div className="space-y-6">
            {roadmapItems.map((item, index) => {
              const style = statusStyles[item.status as Status];

              return (
                <div key={index} className="relative flex gap-5 group">
                  {/* Dot */}
                  <div className="relative z-10 flex-shrink-0 pt-5">
                    <div
                      className={`w-10 h-10 rounded-full ${style.dotBg} ${style.dotBorder} border-2 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200`}
                    >
                      <StatusIcon status={item.status as Status} className={`h-4 w-4 ${style.dotIcon}`} />
                    </div>
                  </div>

                  {/* Card */}
                  <div
                    className={`flex-1 rounded-2xl border ${style.cardBorder} bg-gradient-to-br ${style.cardAccent} p-5 shadow-sm hover:shadow-lg transition-all duration-300 group-hover:-translate-y-0.5`}
                  >
                    {/* Badges */}
                    <div className="flex items-center gap-2.5 mb-3">
                      <span
                        className="text-[11px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-md bg-[#1C2954] text-[#e4d196]"
                      >
                        {item.date}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md ${style.badgeBg} ${style.badgeText} border ${style.badgeBorder}`}
                      >
                        <StatusIcon status={item.status as Status} className="h-3 w-3" />
                        {style.label}
                      </span>
                    </div>

                    {/* Conteúdo */}
                    <h3 className="text-base font-bold text-[#1C2954] leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
            &copy; 2026 CampMan &mdash; Atualizado em tempo real pela equipe de desenvolvimento.
          </p>
        </div>
      </footer>
    </div>
  );
}
