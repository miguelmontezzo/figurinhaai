import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lng = parseFloat(searchParams.get('lng') || '0')
    const radius = parseFloat(searchParams.get('radius') || '5')

    if (!lat || !lng) {
      return NextResponse.json({ error: 'Localização inválida' }, { status: 400 })
    }

    // Usar função RPC do Supabase
    const { data, error } = await supabase.rpc('get_nearby_traders', {
      p_lat: lat,
      p_lng: lng,
      p_radius_km: radius,
    })

    if (error) {
      // Fallback: busca sem PostGIS
      const { data: fallback } = await supabase
        .from('trade_sessions')
        .select(`
          user_id,
          latitude,
          longitude,
          available_stickers,
          needed_stickers,
          last_seen,
          profiles!inner(username, display_name, avatar_url)
        `)
        .eq('is_active', true)
        .neq('user_id', user.id)
        .gt('last_seen', new Date(Date.now() - 30 * 60 * 1000).toISOString())
        .limit(20)

      return NextResponse.json({ traders: fallback || [] })
    }

    return NextResponse.json({ traders: data || [] })
  } catch (error) {
    console.error('Erro ao buscar traders próximos:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { lat, lng, tradPointId } = await request.json()

    // Buscar figurinhas disponíveis (repetidas) e necessárias do usuário
    const [duplicatesRes, neededRes] = await Promise.all([
      supabase
        .from('user_stickers')
        .select('sticker_id')
        .eq('user_id', user.id)
        .gt('quantity', 1),
      supabase
        .from('user_stickers')
        .select('sticker_id')
        .eq('user_id', user.id)
        .eq('is_pasted', false),
    ])

    const available = duplicatesRes.data?.map(s => s.sticker_id) || []
    const needed = neededRes.data?.map(s => s.sticker_id) || []

    // Upsert na sessão de troca
    const { error } = await supabase.from('trade_sessions').upsert({
      user_id: user.id,
      trade_point_id: tradPointId || null,
      latitude: lat,
      longitude: lng,
      is_active: true,
      available_stickers: available,
      needed_stickers: needed,
      last_seen: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    if (error) throw error

    return NextResponse.json({ success: true, available: available.length, needed: needed.length })
  } catch (error) {
    console.error('Erro ao ativar sessão:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    await supabase
      .from('trade_sessions')
      .update({ is_active: false })
      .eq('user_id', user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
