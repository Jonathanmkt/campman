import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Query deve ter pelo menos 2 caracteres' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('municipio')
      .select('id, nome, uf, codigo_ibge')
      .eq('ativo', true)
      .ilike('nome', `%${query.trim()}%`)
      .order('nome', { ascending: true })
      .limit(20);

    if (error) {
      console.error('Erro ao buscar municípios:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao buscar municípios:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
