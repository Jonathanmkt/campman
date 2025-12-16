import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/supabase/categorias-projeto - Listar todas as categorias
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Parâmetros de query
    const search = searchParams.get('search')
    
    let query = supabase
      .from('categoria_projeto')
      .select('*')
      .order('nome', { ascending: true })

    // Filtros
    if (search) {
      query = query.or(`nome.ilike.%${search}%,descricao.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar categorias:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar categorias', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })

  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/supabase/categorias-projeto - Criar nova categoria
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Validações básicas
    if (!body.nome) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o nome já existe
    const { data: existingCategory } = await supabase
      .from('categoria_projeto')
      .select('id')
      .eq('nome', body.nome)
      .single()

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Já existe uma categoria com este nome' },
        { status: 409 }
      )
    }

    // Criar categoria
    const { data: category, error: categoryError } = await supabase
      .from('categoria_projeto')
      .insert([{
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (categoryError) {
      console.error('Erro ao criar categoria:', categoryError)
      return NextResponse.json(
        { error: 'Erro ao criar categoria', details: categoryError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(category, { status: 201 })

  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
