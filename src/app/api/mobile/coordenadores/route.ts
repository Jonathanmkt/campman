import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient as createServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabaseAuth = await createServerClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();

    const supabase = createAdminClient()

    // Buscar campanha_id do usuário logado para filtrar coordenadores
    let campanhaId: string | null = null;
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('campanha_id')
        .eq('id', user.id)
        .single();
      campanhaId = profile?.campanha_id ?? null;
    }

    let query = supabase
      .from('coordenador_regional')
      .select(`
        id,
        profile_id,
        campanha_id,
        profiles:profile_id (
          nome_completo,
          telefone
        )
      `);

    if (campanhaId) {
      query = query.eq('campanha_id', campanhaId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar coordenadores:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    type ProfileInfo = {
      nome_completo?: string | null;
      telefone?: string | null;
    };

    type CoordenadorQuery = {
      id: string;
      profile_id: string;
      profiles?: ProfileInfo | ProfileInfo[] | null;
    };

    const lista = (Array.isArray(data) ? data : []).map((coord) => {
      const typed = coord as CoordenadorQuery;
      const profileData = Array.isArray(typed.profiles)
        ? typed.profiles[0]
        : typed.profiles;

      return {
        id: typed.id,
        profile_id: typed.profile_id,
        nome: profileData?.nome_completo || 'Sem nome',
        telefone: profileData?.telefone || null,
      };
    });

    return NextResponse.json({ success: true, data: lista });
  } catch (error) {
    console.error('Erro ao listar coordenadores:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
