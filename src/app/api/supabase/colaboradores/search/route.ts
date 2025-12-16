import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/supabase/colaboradores/search - Buscar colaboradores por nome
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')
    
    if (!query.trim()) {
      return NextResponse.json({ data: [] })
    }

    // Buscar colaboradores com join para profiles
    const { data, error } = await supabase
      .from('colaborador')
      .select(`
        id,
        funcao,
        status_colaborador,
        ativo,
        profiles(
          id,
          nome_completo,
          telefone,
          foto_url,
          status
        )
      `)
      .eq('ativo', true)
      .limit(limit)
    
    // Filtrar por nome no lado do servidor (JavaScript)
    const filteredData = data?.filter((colaborador: any) => 
      colaborador.profiles?.nome_completo?.toLowerCase().includes(query.toLowerCase()) ||
      colaborador.funcao?.toLowerCase().includes(query.toLowerCase())
    ) || []

    if (error) {
      console.error('Erro ao buscar colaboradores:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar colaboradores', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: filteredData })

  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
