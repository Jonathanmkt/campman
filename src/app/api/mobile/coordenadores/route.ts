import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
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

    const lista = (Array.isArray(data) ? data : []).map((coord: any) => ({
      id: coord.id,
      profile_id: coord.profile_id,
      nome: coord.profiles?.nome_completo || 'Sem nome',
      telefone: coord.profiles?.telefone || null,
    }));

    return NextResponse.json({ success: true, data: lista });
  } catch (error) {
    console.error('Erro ao listar coordenadores:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
