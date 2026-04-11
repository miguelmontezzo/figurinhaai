'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  MapPin, Wifi, WifiOff, Users, Zap, ArrowLeftRight, Star,
  Loader2, ChevronRight, MessageCircle, CheckCircle2, XCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getAllStickers } from '@/lib/stickers-data'
import { cn, distanceToString } from '@/lib/utils'
import toast from 'react-hot-toast'

interface NearbyTrader {
  user_id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  available_stickers: number[] | null
  needed_stickers: number[] | null
  distance_km: number
}

interface MatchResult {
  score: number
  summary: string
  recommendation: string
  myOffersCount: number
  theyOfferCount: number
  topMyOffers: string[]
  topTheyOffer: string[]
}

interface AIMatch {
  trader: NearbyTrader
  iOffer: number[]
  iNeed: number[]
  result: MatchResult | null
  loading: boolean
}

export default function TrocasPage() {
  const supabase = createClient()
  const allStickers = getAllStickers()
  const stickerMap = new Map(allStickers.map(s => [s.number, s]))

  const [userId, setUserId] = useState<string | null>(null)
  const [locationActive, setLocationActive] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [nearbyTraders, setNearbyTraders] = useState<NearbyTrader[]>([])
  const [loadingTraders, setLoadingTraders] = useState(false)
  const [selectedTrader, setSelectedTrader] = useState<NearbyTrader | null>(null)
  const [aiMatch, setAiMatch] = useState<AIMatch | null>(null)
  const [myDuplicates, setMyDuplicates] = useState<number[]>([])
  const [myNeeded, setMyNeeded] = useState<number[]>([])

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      // Carregar minha coleção
      const [dupsRes, neededRes] = await Promise.all([
        supabase.from('user_stickers').select('sticker_id').eq('user_id', user.id).gt('quantity', 1),
        supabase.from('user_stickers').select('sticker_id').eq('user_id', user.id).eq('is_pasted', false),
      ])
      setMyDuplicates(dupsRes.data?.map(s => s.sticker_id) || [])
      setMyNeeded(neededRes.data?.map(s => s.sticker_id) || [])

      // Verificar se há sessão ativa
      const { data: session } = await supabase
        .from('trade_sessions')
        .select('is_active, latitude, longitude')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (session) {
        setLocationActive(true)
        setLocation({ lat: session.latitude, lng: session.longitude })
      }
    }
    init()
  }, [])

  // Ativar localização e buscar traders
  const activateLocation = useCallback(async () => {
    setLocationLoading(true)
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        })
      )

      const { latitude: lat, longitude: lng } = pos.coords
      setLocation({ lat, lng })

      // Registrar sessão
      const res = await fetch('/api/nearby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng }),
      })

      if (res.ok) {
        const data = await res.json()
        setLocationActive(true)
        toast.success(`Localização ativada! ${data.available} repetidas disponíveis para troca.`)

        // Buscar traders próximos
        fetchNearbyTraders(lat, lng)
      }
    } catch (err: any) {
      if (err.code === 1) {
        toast.error('Permissão de localização negada. Ative nas configurações do browser.')
      } else {
        toast.error('Não foi possível obter sua localização.')
      }
    } finally {
      setLocationLoading(false)
    }
  }, [])

  const deactivateLocation = useCallback(async () => {
    await fetch('/api/nearby', { method: 'DELETE' })
    setLocationActive(false)
    setNearbyTraders([])
    toast('Localização desativada', { icon: '📍' })
  }, [])

  const fetchNearbyTraders = useCallback(async (lat: number, lng: number) => {
    setLoadingTraders(true)
    try {
      const res = await fetch(`/api/nearby?lat=${lat}&lng=${lng}&radius=5`)
      if (res.ok) {
        const { traders } = await res.json()
        setNearbyTraders(traders || [])
      }
    } finally {
      setLoadingTraders(false)
    }
  }, [])

  // Analisar troca com IA
  const analyzeMatch = useCallback(async (trader: NearbyTrader) => {
    setSelectedTrader(trader)

    const theirDuplicates = trader.available_stickers || []
    const theirNeeded = trader.needed_stickers || []

    // O que eu ofereço que o outro precisa
    const iOffer = myDuplicates.filter(id => theirNeeded.includes(id))
    // O que ele tem de repetida que eu preciso
    const iNeed = theirDuplicates.filter(id => myNeeded.includes(id))

    setAiMatch({ trader, iOffer, iNeed, result: null, loading: true })

    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otherUserId: trader.user_id,
          myOffers: iOffer,
          theyOffer: iNeed,
        }),
      })

      if (res.ok) {
        const result = await res.json()
        setAiMatch(prev => prev ? { ...prev, result, loading: false } : null)
      }
    } catch {
      setAiMatch(prev => prev ? { ...prev, loading: false } : null)
    }
  }, [myDuplicates, myNeeded])

  const getRecommendationColor = (rec: string) => {
    if (rec === 'excelente') return '#FFD700'
    if (rec === 'aceitar') return '#00E676'
    if (rec === 'negociar') return '#F97316'
    return '#EF4444'
  }

  const getRecommendationLabel = (rec: string) => {
    if (rec === 'excelente') return '🏆 Troca Excelente!'
    if (rec === 'aceitar') return '✅ Recomendo Aceitar'
    if (rec === 'negociar') return '🤝 Negocie Melhor'
    return '⚠️ Não Recomendo'
  }

  return (
    <div className="pb-4">
      {/* Header */}
      <div
        className="px-4 pt-12 pb-6"
        style={{
          background: 'linear-gradient(180deg, rgba(0,230,118,0.1) 0%, transparent 100%)',
        }}
      >
        <h1 className="text-2xl font-black text-white mb-1">Área de Trocas</h1>
        <p className="text-sm text-gray-400">
          Encontre trocas perfeitas com quem está perto de você
        </p>
      </div>

      <div className="px-4 space-y-4">
        {/* Stats minhas repetidas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-2xl p-4">
            <p className="text-3xl font-black text-brand-cyan">{myDuplicates.length}</p>
            <p className="text-xs text-gray-400 mt-1">Repetidas para trocar</p>
          </div>
          <div className="glass rounded-2xl p-4">
            <p className="text-3xl font-black text-brand-gold">{myNeeded.length}</p>
            <p className="text-xs text-gray-400 mt-1">Figurinhas que preciso</p>
          </div>
        </div>

        {/* Ativar Localização */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: locationActive
              ? 'linear-gradient(135deg, rgba(0,230,118,0.12), rgba(0,230,118,0.05))'
              : 'rgba(255,255,255,0.04)',
            border: locationActive
              ? '1px solid rgba(0,230,118,0.3)'
              : '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: locationActive ? 'rgba(0,230,118,0.2)' : 'rgba(255,255,255,0.08)' }}
              >
                {locationActive ? (
                  <Wifi className="w-5 h-5 text-brand-green" />
                ) : (
                  <WifiOff className="w-5 h-5 text-gray-500" />
                )}
              </div>
              <div>
                <p className="font-bold text-white text-sm">
                  {locationActive ? 'Localização Ativa' : 'Ativar Localização'}
                </p>
                <p className="text-xs text-gray-400">
                  {locationActive
                    ? 'Traders próximos podem te ver'
                    : 'Para encontrar traders perto de você'}
                </p>
              </div>
            </div>
            <button
              onClick={locationActive ? deactivateLocation : activateLocation}
              disabled={locationLoading}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95',
                locationActive
                  ? 'text-red-400 bg-red-500/10'
                  : 'text-black'
              )}
              style={!locationActive ? { background: 'linear-gradient(135deg, #00E676, #00C853)' } : {}}
            >
              {locationLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : locationActive ? (
                'Desativar'
              ) : (
                'Ativar'
              )}
            </button>
          </div>

          {locationActive && (
            <button
              onClick={() => location && fetchNearbyTraders(location.lat, location.lng)}
              disabled={loadingTraders}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-brand-green flex items-center justify-center gap-2"
              style={{ border: '1px solid rgba(0,230,118,0.2)', background: 'rgba(0,230,118,0.05)' }}
            >
              {loadingTraders ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Users className="w-4 h-4" />
              )}
              {loadingTraders ? 'Buscando...' : 'Atualizar traders próximos'}
            </button>
          )}
        </div>

        {/* Traders próximos */}
        {locationActive && (
          <div>
            <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-green" />
              Traders Próximos
              {nearbyTraders.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-green/20 text-brand-green font-bold">
                  {nearbyTraders.length}
                </span>
              )}
            </h2>

            {loadingTraders ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-brand-green mx-auto mb-2" />
                <p className="text-sm text-gray-500">Buscando traders próximos...</p>
              </div>
            ) : nearbyTraders.length === 0 ? (
              <div className="glass rounded-2xl p-6 text-center">
                <Users className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400 text-sm font-medium">Nenhum trader por perto</p>
                <p className="text-gray-600 text-xs mt-1">
                  No raio de 5km não há outros usuários ativos agora.
                  Tente pontos de troca oficiais!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {nearbyTraders.map(trader => {
                  const theirDups = trader.available_stickers?.length || 0
                  const theirNeeded = trader.needed_stickers?.length || 0
                  const matchCount = (trader.available_stickers || []).filter(id => myNeeded.includes(id)).length
                  const offerCount = myDuplicates.filter(id => (trader.needed_stickers || []).includes(id)).length

                  return (
                    <button
                      key={trader.user_id}
                      onClick={() => analyzeMatch(trader)}
                      className="w-full glass rounded-2xl p-4 flex items-center justify-between gap-3 text-left transition-all active:scale-95"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #7C3AED, #00D4FF)' }}
                        >
                          {(trader.display_name || trader.username)?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">
                            {trader.display_name || trader.username}
                          </p>
                          <p className="text-xs text-gray-500">
                            {distanceToString(trader.distance_km)} de distância
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-brand-cyan">
                              {theirDups} repetidas
                            </span>
                            <span className="text-gray-600">·</span>
                            <span className="text-xs text-brand-gold">
                              {theirNeeded} precisando
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {(matchCount > 0 || offerCount > 0) && (
                          <span
                            className="text-xs font-bold px-2 py-1 rounded-full"
                            style={{ background: 'rgba(0,230,118,0.2)', color: '#00E676' }}
                          >
                            {matchCount + offerCount} matches
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Dica quando localização não ativa */}
        {!locationActive && (
          <div className="space-y-3">
            <h2 className="text-base font-bold text-white">Como funciona?</h2>
            {[
              {
                icon: '📍',
                title: 'Ative sua localização',
                desc: 'Você aparece para outros traders num raio de 5km',
              },
              {
                icon: '🤖',
                title: 'IA analisa as trocas',
                desc: 'A IA cruza suas repetidas com o que os outros precisam e vice-versa',
              },
              {
                icon: '🤝',
                title: 'Acorde a troca',
                desc: 'Veja a análise, encontre-se num ponto de troca e troque!',
              },
            ].map((step, i) => (
              <div key={i} className="glass rounded-2xl p-4 flex items-start gap-3">
                <span className="text-2xl">{step.icon}</span>
                <div>
                  <p className="font-semibold text-white text-sm">{step.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de análise de troca */}
      {aiMatch && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-4"
          onClick={() => setAiMatch(null)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-sm rounded-3xl overflow-hidden animate-slide-up"
            style={{ background: '#1a1a35', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '85vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header do trader */}
            <div
              className="p-6 pb-4"
              style={{ background: 'linear-gradient(135deg, rgba(0,230,118,0.1), rgba(18,18,42,0.9))' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #00D4FF)' }}
                  >
                    {(aiMatch.trader.display_name || aiMatch.trader.username)?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-black text-white">
                      {aiMatch.trader.display_name || aiMatch.trader.username}
                    </p>
                    <p className="text-xs text-gray-400">
                      {distanceToString(aiMatch.trader.distance_km)} de você
                    </p>
                  </div>
                </div>
                <button onClick={() => setAiMatch(null)} className="text-gray-500">✕</button>
              </div>

              {/* Score IA */}
              {aiMatch.loading ? (
                <div className="flex items-center gap-2 py-2">
                  <Loader2 className="w-5 h-5 animate-spin text-brand-green" />
                  <span className="text-sm text-gray-400">IA analisando troca...</span>
                </div>
              ) : aiMatch.result && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" style={{ color: getRecommendationColor(aiMatch.result.recommendation) }} />
                      <span className="text-sm font-bold" style={{ color: getRecommendationColor(aiMatch.result.recommendation) }}>
                        {getRecommendationLabel(aiMatch.result.recommendation)}
                      </span>
                    </div>
                    <span
                      className="text-2xl font-black"
                      style={{ color: getRecommendationColor(aiMatch.result.recommendation) }}
                    >
                      {aiMatch.result.score}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {aiMatch.result.summary}
                  </p>
                </div>
              )}
            </div>

            {/* Detalhes da troca */}
            <div className="p-6 pt-4 space-y-4">
              {/* Eu ofereço */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                  Você oferece ({aiMatch.iOffer.length} figurinhas)
                </p>
                {aiMatch.iOffer.length === 0 ? (
                  <p className="text-xs text-gray-600 italic">
                    Nenhuma das suas repetidas é o que ele precisa
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {aiMatch.iOffer.slice(0, 12).map(id => {
                      const s = stickerMap.get(id)
                      return (
                        <span
                          key={id}
                          className="text-xs px-2 py-1 rounded-lg font-bold"
                          style={{ background: 'rgba(0,230,118,0.15)', color: '#00E676' }}
                        >
                          #{String(id).padStart(3, '0')} {s?.teamFlag || ''}
                        </span>
                      )
                    })}
                    {aiMatch.iOffer.length > 12 && (
                      <span className="text-xs text-gray-500 px-2 py-1">
                        +{aiMatch.iOffer.length - 12} mais
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Ele oferece */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                  {aiMatch.trader.display_name || aiMatch.trader.username} oferece ({aiMatch.iNeed.length} figurinhas)
                </p>
                {aiMatch.iNeed.length === 0 ? (
                  <p className="text-xs text-gray-600 italic">
                    Nenhuma das repetidas dele é o que você precisa
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {aiMatch.iNeed.slice(0, 12).map(id => {
                      const s = stickerMap.get(id)
                      return (
                        <span
                          key={id}
                          className="text-xs px-2 py-1 rounded-lg font-bold"
                          style={{ background: 'rgba(0,212,255,0.15)', color: '#00D4FF' }}
                        >
                          #{String(id).padStart(3, '0')} {s?.teamFlag || ''}
                        </span>
                      )
                    })}
                    {aiMatch.iNeed.length > 12 && (
                      <span className="text-xs text-gray-500 px-2 py-1">
                        +{aiMatch.iNeed.length - 12} mais
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Resumo */}
              {(aiMatch.iOffer.length > 0 || aiMatch.iNeed.length > 0) && (
                <div
                  className="rounded-xl p-3 flex items-center gap-3"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <ArrowLeftRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <p className="text-xs text-gray-300">
                    <span className="text-brand-green font-bold">{aiMatch.iOffer.length}</span> que você dá
                    {' '}↔{' '}
                    <span className="text-brand-cyan font-bold">{aiMatch.iNeed.length}</span> que você recebe
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-600 text-center">
                Combine o local de troca nos pontos oficiais ou vá até o trader!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
