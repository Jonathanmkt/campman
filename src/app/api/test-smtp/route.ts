import { createAdminClient } from '@/lib/supabase/admin'
import { inviteAdmin } from '@/lib/services/invite-admin'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Endpoint de teste para disparar convite manual.
 * Apenas para validar a configuração SMTP do Supabase.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json({ error: 'Email é obrigatório (?email=...)' }, { status: 400 })
  }

  try {
    const result = await inviteAdmin({
      email,
      planoTipo: 'cortesia',
      origemConvite: 'pagarme_simulator'
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Convite enviado para ${email} via SMTP. Verifique a caixa de entrada!`,
        userId: result.userId
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
