import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('coordenador_regional')
      .select(`
        id,
        profile_id,
        profiles:profile_id (
          nome_completo,
          telefone
        )
      `);

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
