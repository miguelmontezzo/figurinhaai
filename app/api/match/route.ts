import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAllStickers } from '@/lib/stickers-data'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { otherUserId, myOffers, theyOffer } = await request.json()

    if (!myOffers?.length || !theyOffer?.length) {
      return NextResponse.json({
        score: 0,
        summary: 'Não há figurinhas para trocar no momento.',
        recommendation: 'none',
      })
    }

    const allStickers = getAllStickers()
    const stickerMap = new Map(allStickers.map(s => [s.number, s]))

    // Buscar perfis
    const [myProfile, otherProfile] = await Promise.all([
      supabase.from('profiles').select('username, display_name').eq('id', user.id).single(),
      supabase.from('profiles').select('username, display_name').eq('id', otherUserId).single(),
    ])

    const myName = myProfile.data?.display_name || myProfile.data?.username || 'Você'
    const otherName = otherProfile.data?.display_name || otherProfile.data?.username || 'Outro usuário'

    // Analisar compatibilidade sem IA externa (lógica interna)
    const score = Math.min(100, Math.round(
      (Math.min(myOffers.length, theyOffer.length) / Math.max(myOffers.length, theyOffer.length, 1)) * 100
    ))

    const myOfferNames = myOffers.slice(0, 3).map((id: number) => {
      const s = stickerMap.get(id)
      return s ? `#${String(s.number).padStart(3, '0')} ${s.teamFlag || ''}` : `#${id}`
    })
    const theyOfferNames = theyOffer.slice(0, 3).map((id: number) => {
      const s = stickerMap.get(id)
      return s ? `#${String(s.number).padStart(3, '0')} ${s.teamFlag || ''}` : `#${id}`
    })

    const specialsInOffer = myOffers.filter((id: number) => stickerMap.get(id)?.type === 'especial').length
    const specialsWanted = theyOffer.filter((id: number) => stickerMap.get(id)?.type === 'especial').length

    let summary = ''
    let recommendation: 'aceitar' | 'negociar' | 'recusar' | 'excelente'

    if (score >= 90) {
      recommendation = 'excelente'
      summary = `🏆 Troca perfeita! ${myName} oferece ${myOffers.length} figurinha(s) e ${otherName} oferece ${theyOffer.length}. Compatibilidade excelente!`
    } else if (score >= 70) {
      recommendation = 'aceitar'
      summary = `✅ Boa troca! Você ganha ${theyOffer.length} figurinha(s) que precisa, incluindo ${theyOfferNames.join(', ')}. Vale a pena!`
    } else if (score >= 40) {
      recommendation = 'negociar'
      summary = `🤝 Troca razoável. ${myName} oferece ${myOffers.length} e recebe ${theyOffer.length}. Considere negociar mais figurinhas para equilibrar.`
    } else {
      recommendation = 'recusar'
      summary = `⚠️ Troca desequilibrada. Relação ${myOffers.length}x${theyOffer.length}. Tente negociar outras figurinhas para melhorar o acordo.`
    }

    if (specialsInOffer > 0) {
      summary += ` (${specialsInOffer} especial★ na sua oferta)`
    }
    if (specialsWanted > 0) {
      summary += ` (${specialsWanted} especial★ que você receberá)`
    }

    return NextResponse.json({
      score,
      summary,
      recommendation,
      myOffersCount: myOffers.length,
      theyOfferCount: theyOffer.length,
      topMyOffers: myOfferNames,
      topTheyOffer: theyOfferNames,
    })
  } catch (error) {
    console.error('Erro no match:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
