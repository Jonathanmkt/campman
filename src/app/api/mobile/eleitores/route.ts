import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient as createServerClient } from '@/lib/supabase/server';

async function getLiderancaLogada() {
  const supabaseAuth = await createServerClient();
  const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();

  if (userError || !user) {
    return { error: 'Usuário não autenticado', status: 401 as const };
  }

  const supabase = createAdminClient();

  // Buscar liderança vinculada ao profile do usuário logado
  const { data: lideranca, error: liderancaError } = await supabase
    .from('lideranca')
    .select('id, campanha_id')
    .eq('profile_id', user.id)
    .single();

  if (liderancaError || !lideranca) {
    // Fallback: buscar campanha_id direto do profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('campanha_id')
      .eq('id', user.id)
      .single();
    if (!profile?.campanha_id) {
      return { error: 'Liderança não encontrada para o usuário logado', status: 403 as const };
    }
    return { liderancaId: null as string | null, campanhaId: profile.campanha_id };
  }

  return { liderancaId: lideranca.id, campanhaId: lideranca.campanha_id };
}

export async function GET() {
  try {
    const { liderancaId, campanhaId, error, status } = await getLiderancaLogada();
    if (error) {
      return NextResponse.json({ success: false, error }, { status });
    }

    const supabase = createAdminClient();

    // Filtrar eleitores pela campanha da liderança logada
    let query = supabase
      .from('eleitor')
      .select('*')
      .order('nome_completo', { ascending: true })
      .limit(100);

    if (campanhaId) {
      query = query.eq('campanha_id', campanhaId);
    }

    // Se tiver liderança, filtrar apenas eleitores vinculados a ela
    if (liderancaId) {
      const { data: vinculosData } = await supabase
        .from('lideranca_eleitor')
        .select('eleitor_id')
        .eq('lideranca_id', liderancaId)
        .eq('ativo', true);

      const eleitorIds = (vinculosData ?? []).map((v) => v.eleitor_id);
      if (eleitorIds.length > 0) {
        query = query.in('id', eleitorIds);
      }
    }

    const { data, error: queryError } = await query;

    if (queryError) {
      return NextResponse.json(
        { success: false, error: queryError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao buscar eleitores:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { liderancaId, campanhaId, error, status } = await getLiderancaLogada();
    if (error) {
      return NextResponse.json({ success: false, error }, { status });
    }

    if (!campanhaId) {
      return NextResponse.json(
        { success: false, error: 'Campanha não encontrada para o usuário logado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { nome_completo, telefone, email, bairro, endereco, intencao_voto, observacoes } = body;

    if (!nome_completo?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Buscar área da campanha (filtrada por campanha_id)
    const { data: areaData } = await supabase
      .from('area')
      .select('id')
      .eq('campanha_id', campanhaId)
      .eq('ativo', true)
      .limit(1)
      .single();

    if (!areaData) {
      return NextResponse.json(
        { success: false, error: 'Nenhuma área cadastrada para esta campanha' },
        { status: 400 }
      );
    }

    // Criar o eleitor vinculado à campanha
    const { data: eleitor, error: eleitorError } = await supabase
      .from('eleitor')
      .insert({
        nome_completo: nome_completo.trim(),
        telefone: telefone?.trim() || null,
        email: email?.trim() || null,
        bairro: bairro?.trim() || null,
        endereco: endereco?.trim() || null,
        intencao_voto: intencao_voto || null,
        observacoes: observacoes?.trim() || null,
        area_id: areaData.id,
        campanha_id: campanhaId,
        status: 'ativo',
        ativo: true,
      })
      .select()
      .single();

    if (eleitorError) {
      console.error('Erro ao criar eleitor:', eleitorError);
      return NextResponse.json(
        { success: false, error: eleitorError.message },
        { status: 500 }
      );
    }

    // Criar vínculo lideranca_eleitor se houver liderança logada
    if (liderancaId && eleitor) {
      const { error: vinculoError } = await supabase
        .from('lideranca_eleitor')
        .insert({
          lideranca_id: liderancaId,
          eleitor_id: eleitor.id,
          tipo_relacao: 'cadastro_direto',
          campanha_id: campanhaId,
          ativo: true,
        });

      if (vinculoError) {
        console.error('Erro ao vincular eleitor à liderança:', vinculoError);
      }
    }

    return NextResponse.json({ success: true, data: eleitor });
  } catch (error) {
    console.error('Erro ao criar eleitor:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
