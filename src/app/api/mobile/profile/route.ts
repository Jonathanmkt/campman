import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Obter usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Buscar dados do perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }

    // Se for liderança, buscar informações adicionais
    let liderancaInfo = null;
    if (profile.roles?.includes('lideranca')) {
      const { data: lideranca } = await supabase
        .from('lideranca')
        .select(`
          nivel,
          tipo,
          alcance_estimado,
          lideranca_area (
            area:area_id (
              id,
              nome,
              tipo,
              cidade,
              bairro
            )
          )
        `)
        .eq('profile_id', user.id)
        .single();

      if (lideranca) {
        liderancaInfo = {
          nivel: lideranca.nivel,
          tipo: lideranca.tipo,
          alcance_estimado: lideranca.alcance_estimado,
          areas: lideranca.lideranca_area?.map((la: { area: unknown }) => la.area) || [],
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...profile,
        lideranca_info: liderancaInfo,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
