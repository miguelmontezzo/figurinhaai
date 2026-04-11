import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateAllStickers } from '@/lib/stickers-data'

// Rota para popular o banco com as 980 figurinhas
// Chamar apenas uma vez: POST /api/admin/seed-stickers
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    // Verificar token secreto em produção
    const { token } = await request.json().catch(() => ({ token: null }))
    if (token !== process.env.ADMIN_SEED_TOKEN) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
  }

  try {
    const supabase = createClient()
    const stickers = generateAllStickers()

    // Verificar se já existe
    const { count } = await supabase
      .from('stickers')
      .select('*', { count: 'exact', head: true })

    if ((count || 0) >= 980) {
      return NextResponse.json({ message: 'Figurinhas já populadas', count })
    }

    // Inserir em lotes de 100
    const batchSize = 100
    let inserted = 0

    for (let i = 0; i < stickers.length; i += batchSize) {
      const batch = stickers.slice(i, i + batchSize).map(s => ({
        number: s.number,
        name: s.name,
        section: s.section,
        section_name: s.sectionName,
        type: s.type,
        group_name: s.groupName || null,
        team: s.team || null,
        team_code: s.teamCode || null,
        team_flag: s.teamFlag || null,
        player_position: s.playerPosition || null,
        description: s.description || null,
      }))

      const { error } = await supabase.from('stickers').upsert(batch, { onConflict: 'number' })
      if (error) {
        console.error('Erro ao inserir lote:', error)
        return NextResponse.json({ error: error.message, insertedSoFar: inserted }, { status: 500 })
      }
      inserted += batch.length
    }

    return NextResponse.json({
      success: true,
      message: `${inserted} figurinhas inseridas com sucesso!`,
      total: stickers.length,
      especiais: stickers.filter(s => s.type === 'especial').length,
      regulares: stickers.filter(s => s.type === 'regular').length,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
