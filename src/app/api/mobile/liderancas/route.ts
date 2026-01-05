import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getCoordenadorLogado() {
  const supabaseAuth = await createServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabaseAuth.auth.getUser();

  if (userError || !user) {
    return { error: 'Usuário não autenticado', status: 401 as const };
  }

  const { data: coordenadorRegional, error: coordenadorError } = await supabase
    .from('coordenador_regional')
    .select('id')
    .eq('profile_id', user.id)
    .single();

  if (coordenadorError || !coordenadorRegional) {
    return {
      error: 'Coordenador regional não encontrado para o usuário logado',
      status: 403 as const,
    };
  }

  return { coordenadorRegional };
}

export async function GET() {
  try {
    const { coordenadorRegional, error, status } = await getCoordenadorLogado();
    if (error || !coordenadorRegional) {
      return NextResponse.json({ success: false, error }, { status });
    }

    const { data, error: liderancasError } = await supabase
      .from('lideranca')
      .select('*')
      .eq('coordenador_regional_id', coordenadorRegional.id)
      .order('nome_completo', { ascending: true })
      .limit(100);

    if (liderancasError) {
      return NextResponse.json(
        { success: false, error: liderancasError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao buscar lideranças:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { coordenadorRegional, error, status } = await getCoordenadorLogado();
    if (error || !coordenadorRegional) {
      return NextResponse.json({ success: false, error }, { status });
    }

    const body = await request.json();

    const {
      nome_completo,
      nome_popular,
      telefone,
      tipo_lideranca,
      endereco_formatado,
      bairro,
      cidade,
      estado,
      latitude,
      longitude,
    } = body;

    if (!nome_completo?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    if (!tipo_lideranca) {
      return NextResponse.json(
        { success: false, error: 'Tipo de liderança é obrigatório' },
        { status: 400 }
      );
    }

    if (!telefone?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Telefone é obrigatório' },
        { status: 400 }
      );
    }

    // Criar liderança com dados completos
    const { data: lideranca, error: liderancaError } = await supabase
      .from('lideranca')
      .insert({
        nome_completo: nome_completo.trim(),
        nome_popular: nome_popular?.trim() || null,
        telefone: telefone?.trim() || null,
        tipo_lideranca,
        nivel_influencia: 3,
        status: 'ativo',
        ativo: true,
        coordenador_regional_id: coordenadorRegional.id,
        cidade: cidade?.trim() || null,
        estado: estado?.trim() || null,
        bairro: bairro?.trim() || null,
        endereco_formatado: endereco_formatado?.trim() || null,
        latitude: latitude || null,
        longitude: longitude || null,
      })
      .select()
      .single();

    if (liderancaError) {
      console.error('Erro ao criar liderança:', liderancaError);
      return NextResponse.json(
        { success: false, error: liderancaError.message },
        { status: 500 }
      );
    }

    // Gerar token e convite para a liderança já criada
    const telefoneNormalizado = telefone.replace(/\D/g, '');
    
    // Gerar token aleatório
    const generateToken = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let token = '';
      for (let i = 0; i < 32; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return token;
    };

    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    // Criar convite vinculado à liderança existente
    const { data: conviteData, error: conviteError } = await supabase
      .from('convites')
      .insert({
        telefone: telefoneNormalizado,
        role: 'lideranca',
        token: token,
        status: 'pendente',
        expires_at: expiresAt.toISOString(),
        lideranca_id: lideranca.id,
        nome_convidado: nome_completo.trim(),
      })
      .select()
      .single();

    if (conviteError) {
      console.error('Erro ao criar convite:', conviteError);
    }

    // Gerar link de onboarding
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

    const linkOnboarding = conviteData?.token 
      ? `${baseOrigin}/mobile/onboarding?token=${conviteData.token}`
      : null;

    const mensagemWhatsapp = linkOnboarding
      ? `Olá ${nome_completo.split(' ')[0]}! Você foi convidado(a) para fazer parte da equipe de campanha. Clique no link abaixo para criar sua senha e acessar o app:\n\n${linkOnboarding}`
      : null;

    return NextResponse.json({
      success: true,
      data: {
        lideranca,
        convite: conviteData ? {
          token: conviteData.token,
          link_onboarding: linkOnboarding,
          mensagem_whatsapp: mensagemWhatsapp,
          telefone: telefone,
        } : null,
      },
    });
  } catch (error) {
    console.error('Erro ao criar liderança:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
