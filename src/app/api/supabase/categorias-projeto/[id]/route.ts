import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/supabase/categorias-projeto/[id] - Buscar categoria por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    const { data, error } = await supabase
      .from('categoria_projeto')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao buscar categoria:', error)
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/supabase/categorias-projeto/[id] - Atualizar categoria
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const body = await request.json()

    // Verificar se a categoria existe
    const { data: existingCategory } = await supabase
      .from('categoria_projeto')
      .select('id')
      .eq('id', id)
      .single()

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    // Se está atualizando o nome, verificar se não existe outra categoria com o mesmo nome
    if (body.nome) {
      const { data: nameExists } = await supabase
        .from('categoria_projeto')
        .select('id')
        .eq('nome', body.nome)
        .neq('id', id)
        .single()

      if (nameExists) {
        return NextResponse.json(
          { error: 'Já existe uma categoria com este nome' },
          { status: 409 }
        )
      }
    }

    const { data, error } = await supabase
      .from('categoria_projeto')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar categoria:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar categoria', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/supabase/categorias-projeto/[id] - Deletar categoria
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Verificar se a categoria existe
    const { data: existingCategory } = await supabase
      .from('categoria_projeto')
      .select('id')
      .eq('id', id)
      .single()

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se há projetos usando esta categoria
    const { data: projectsUsingCategory } = await supabase
      .from('projects')
      .select('id')
      .eq('categoria_id', id)
      .limit(1)

    if (projectsUsingCategory && projectsUsingCategory.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível deletar categoria que está sendo usada por projetos' },
        { status: 409 }
      )
    }

    const { error } = await supabase
      .from('categoria_projeto')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao deletar categoria:', error)
      return NextResponse.json(
        { error: 'Erro ao deletar categoria', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Categoria deletada com sucesso' })

  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
