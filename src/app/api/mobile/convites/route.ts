import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient as createServerClient } from '@/lib/supabase/server';

// GET - Listar convites pendentes
export async function GET(request: NextRequest) {
  try {
    const supabaseAuth = await createServerClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();

    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url);
    const createdBy = searchParams.get('created_by');

    // Buscar campanha_id do usuário logado para filtrar convites
    let campanhaId: string | null = null;
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('campanha_id')
        .eq('id', user.id)
        .single();
      campanhaId = profile?.campanha_id ?? null;
    }

    // Usar a função do banco para listar convites pendentes filtrados por campanha
    const { data, error } = await supabase.rpc('listar_convites_pendentes', {
      p_created_by: createdBy ?? undefined,
      p_campanha_id: campanhaId ?? undefined,
    });

    if (error) {
      console.error('Erro ao listar convites:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const requestUrl = new URL(request.url);
    const envAppUrl = process.env.NEXT_PUBLIC_APP_URL;
    let baseOrigin: string;

    if (envAppUrl) {
      try {
        baseOrigin = new URL(envAppUrl).origin;
      } catch {
        baseOrigin = requestUrl.origin;
      }
    } else {
      baseOrigin = requestUrl.origin;
    }

    // Gerar URLs de onboarding para cada convite
    const convitesComLinks = (data || []).map((convite: {
      id: string;
      token: string;
      telefone: string;
      nome_convidado: string;
      status: string;
      expires_at: string;
      created_at: string;
      nome_completo: string;
      nome_popular: string | null;
      tipo_lideranca: string;
    }) => {
      const linkOnboarding = `${baseOrigin}/mobile/onboarding?token=${convite.token}`;
      return {
        ...convite,
        link_onboarding: linkOnboarding,
      };
    });

    return NextResponse.json({ success: true, data: convitesComLinks });
  } catch (error) {
    console.error('Erro ao listar convites:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar novo convite (gera liderança provisória + convite)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      telefone,
      nome_completo,
      nome_popular,
      tipo_lideranca = 'comunitaria',
      coordenador_regional_id,
      created_by,
      expires_hours = 48,
    } = body;

    // Validações
    if (!telefone?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Telefone é obrigatório' },
        { status: 400 }
      );
    }

    if (!nome_completo?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    // Normalizar telefone (remover caracteres não numéricos)
    const telefoneNormalizado = telefone.replace(/\D/g, '');

    if (telefoneNormalizado.length < 10 || telefoneNormalizado.length > 11) {
      return NextResponse.json(
        { success: false, error: 'Telefone inválido. Use formato DDD + número (10 ou 11 dígitos)' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient()

    // Buscar campanha_id do criador do convite
    let campanhaIdPost: string | null = null;
    if (created_by) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('campanha_id')
        .eq('id', created_by)
        .single();
      campanhaIdPost = profile?.campanha_id ?? null;
    }
    if (!campanhaIdPost && coordenador_regional_id) {
      const { data: coord } = await supabase
        .from('coordenador_regional')
        .select('campanha_id')
        .eq('id', coordenador_regional_id)
        .single();
      campanhaIdPost = coord?.campanha_id ?? null;
    }

    // Chamar função do banco que cria liderança provisória + convite em transação
    const { data, error } = await supabase.rpc('criar_convite_lideranca', {
      p_telefone: telefoneNormalizado,
      p_nome_completo: nome_completo.trim(),
      p_nome_popular: nome_popular?.trim() || null,
      p_tipo_lideranca: tipo_lideranca,
      p_coordenador_regional_id: coordenador_regional_id || null,
      p_created_by: created_by || null,
      p_expires_hours: expires_hours,
      p_campanha_id: campanhaIdPost,
    });

    if (error) {
      console.error('Erro ao criar convite:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Verificar se a função retornou sucesso
    if (!data?.success) {
      return NextResponse.json(
        { success: false, error: data?.error || 'Erro ao criar convite' },
        { status: 400 }
      );
    }

    const requestUrl = new URL(request.url);
    const envAppUrl = process.env.NEXT_PUBLIC_APP_URL;
    let baseOrigin: string;

    if (envAppUrl) {
      try {
        baseOrigin = new URL(envAppUrl).origin;
      } catch {
        baseOrigin = requestUrl.origin;
      }
    } else {
      baseOrigin = requestUrl.origin;
    }

    // Gerar link de onboarding
    const linkOnboarding = `${baseOrigin}/mobile/onboarding?token=${data.token}`;

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        link_onboarding: linkOnboarding,
        mensagem_whatsapp: `Olá ${nome_completo.split(' ')[0]}! Você foi convidado(a) para fazer parte da equipe de campanha. Clique no link abaixo para criar sua senha e acessar o app:\n\n${linkOnboarding}`,
      },
    });
  } catch (error) {
    console.error('Erro ao criar convite:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
