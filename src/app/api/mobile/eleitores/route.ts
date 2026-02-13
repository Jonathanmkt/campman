import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient()
    // Por enquanto, retorna todos os eleitores para testes
    // Em produção, filtrar pela liderança logada
    const { data, error } = await supabase
      .from('eleitor')
      .select('*')
      .order('nome_completo', { ascending: true })
      .limit(100);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
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
    const body = await request.json();

    const {
      nome_completo,
      telefone,
      email,
      bairro,
      endereco,
      intencao_voto,
      observacoes,
    } = body;

    if (!nome_completo?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient()
    // Buscar uma área padrão para o eleitor (necessário pelo schema)
    const { data: areaData } = await supabase
      .from('area')
      .select('id')
      .limit(1)
      .single();

    if (!areaData) {
      return NextResponse.json(
        { success: false, error: 'Nenhuma área cadastrada no sistema' },
        { status: 400 }
      );
    }

    // Criar o eleitor
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

    // TODO: Em produção, criar vínculo com a liderança logada em lideranca_eleitor

    return NextResponse.json({ success: true, data: eleitor });
  } catch (error) {
    console.error('Erro ao criar eleitor:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
