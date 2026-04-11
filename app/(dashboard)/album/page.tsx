'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Search, Filter, Trophy, Star, ChevronDown, ChevronRight, Loader2, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getAllStickers, getAllSections, TEAMS, type Sticker } from '@/lib/stickers-data'
import { StickerCard } from '@/components/album/StickerCard'
import { StickerModal } from '@/components/album/StickerModal'
import { cn, formatPercent, getSectionColor } from '@/lib/utils'
import toast from 'react-hot-toast'

interface UserStickerData {
  sticker_id: number
  quantity: number
  is_pasted: boolean
}

interface ProfileData {
  pasted_count: number
  duplicate_count: number
  total_stickers: number
  completion_percent: number
}

type FilterType = 'all' | 'missing' | 'pasted' | 'duplicates'

export default function AlbumPage() {
  const supabase = createClient()
  const allStickers = useMemo(() => getAllStickers(), [])
  const allSections = useMemo(() => getAllSections(), [])

  const [userStickers, setUserStickers] = useState<Map<number, UserStickerData>>(new Map())
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [expandedSection, setExpandedSection] = useState<string | null>('grupo_d') // Brasil
  const [userId, setUserId] = useState<string | null>(null)

  // Carregar dados do usuário
  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const [stickersRes, profileRes] = await Promise.all([
        supabase.from('user_stickers').select('sticker_id, quantity, is_pasted').eq('user_id', user.id),
        supabase.from('profiles').select('pasted_count, duplicate_count, total_stickers, completion_percent').eq('id', user.id).single(),
      ])

      if (stickersRes.data) {
        const map = new Map<number, UserStickerData>()
        stickersRes.data.forEach(s => map.set(s.sticker_id, s))
        setUserStickers(map)
      }
      if (profileRes.data) {
        setProfile(profileRes.data)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  // Registrar/remover figurinha
  const handleRegister = useCallback(async (stickerNumber: number, action: 'add' | 'remove') => {
    if (!userId) return

    const sticker = allStickers.find(s => s.number === stickerNumber)
    if (!sticker) return

    const current = userStickers.get(stickerNumber)

    if (action === 'add') {
      if (!current || current.quantity === 0) {
        // Primeira vez: marca como colada
        const { error } = await supabase.from('user_stickers').upsert({
          user_id: userId,
          sticker_id: stickerNumber,
          quantity: 1,
          is_pasted: true,
        })
        if (!error) {
          const newMap = new Map(userStickers)
          newMap.set(stickerNumber, { sticker_id: stickerNumber, quantity: 1, is_pasted: true })
          setUserStickers(newMap)
          toast.success(`Figurinha #${String(stickerNumber).padStart(3,'0')} colada no álbum! ✅`, { duration: 2000 })
        }
      } else {
        // Já tem: adiciona uma repetida
        const newQty = current.quantity + 1
        const { error } = await supabase.from('user_stickers').update({ quantity: newQty }).eq('user_id', userId).eq('sticker_id', stickerNumber)
        if (!error) {
          const newMap = new Map(userStickers)
          newMap.set(stickerNumber, { ...current, quantity: newQty })
          setUserStickers(newMap)
          toast(`+1 repetida da figurinha #${String(stickerNumber).padStart(3,'0')} 🔄`, {
            icon: '🔄',
            style: { background: '#1a1a35', color: '#00D4FF' },
            duration: 2000,
          })
        }
      }
    } else if (action === 'remove') {
      if (!current || current.quantity === 0) return

      if (current.quantity === 1) {
        // Remove completamente
        const { error } = await supabase.from('user_stickers').delete().eq('user_id', userId).eq('sticker_id', stickerNumber)
        if (!error) {
          const newMap = new Map(userStickers)
          newMap.delete(stickerNumber)
          setUserStickers(newMap)
          toast(`Figurinha #${String(stickerNumber).padStart(3,'0')} removida`, { icon: '🗑️', duration: 2000 })
        }
      } else {
        const newQty = current.quantity - 1
        const newPasted = newQty >= 1
        const { error } = await supabase.from('user_stickers').update({ quantity: newQty, is_pasted: newPasted }).eq('user_id', userId).eq('sticker_id', stickerNumber)
        if (!error) {
          const newMap = new Map(userStickers)
          newMap.set(stickerNumber, { ...current, quantity: newQty, is_pasted: newPasted })
          setUserStickers(newMap)
          toast(`Repetida removida da #${String(stickerNumber).padStart(3,'0')}`, { icon: '➖', duration: 2000 })
        }
      }

      // Atualizar perfil
      const { data: profileData } = await supabase.from('profiles').select('pasted_count, duplicate_count, total_stickers, completion_percent').eq('id', userId).single()
      if (profileData) setProfile(profileData)
    }

    // Atualizar profile stats
    const { data: profileData } = await supabase.from('profiles').select('pasted_count, duplicate_count, total_stickers, completion_percent').eq('id', userId).single()
    if (profileData) setProfile(profileData)
  }, [userId, userStickers, allStickers, supabase])

  // Filtrar figurinhas
  const filteredStickers = useMemo(() => {
    let filtered = allStickers

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(q) ||
        String(s.number).includes(q) ||
        s.team?.toLowerCase().includes(q) ||
        s.teamCode?.toLowerCase().includes(q) ||
        s.sectionName.toLowerCase().includes(q)
      )
    }

    if (activeFilter !== 'all') {
      filtered = filtered.filter(s => {
        const data = userStickers.get(s.number)
        if (activeFilter === 'missing') return !data || !data.is_pasted
        if (activeFilter === 'pasted') return data?.is_pasted
        if (activeFilter === 'duplicates') return data && data.quantity > 1
        return true
      })
    }

    return filtered
  }, [allStickers, searchQuery, activeFilter, userStickers])

  // Agrupar por seção
  const sectionedStickers = useMemo(() => {
    const map = new Map<string, Sticker[]>()
    filteredStickers.forEach(s => {
      if (!map.has(s.section)) map.set(s.section, [])
      map.get(s.section)!.push(s)
    })
    return map
  }, [filteredStickers])

  const completionPercent = profile?.completion_percent ?? 0
  const pastedCount = profile?.pasted_count ?? 0
  const duplicateCount = profile?.duplicate_count ?? 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-gold mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Carregando seu álbum...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-4">
      {/* Header */}
      <div
        className="sticky top-0 z-30 px-4 pt-12 pb-4"
        style={{ background: 'linear-gradient(180deg, #0a0a1a 70%, transparent)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-black text-white">Meu Álbum</h1>
            <p className="text-xs text-gray-500">Copa do Mundo FIFA 2026™</p>
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(255,215,0,0.1)' }}
          >
            <Trophy className="w-4 h-4 text-brand-gold" />
            <span className="text-brand-gold font-black text-sm">{formatPercent(completionPercent)}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-bar mb-3">
          <div
            className="progress-fill"
            style={{
              width: `${completionPercent}%`,
              background: completionPercent >= 80
                ? 'linear-gradient(90deg, #00E676, #00C853)'
                : completionPercent >= 50
                ? 'linear-gradient(90deg, #00D4FF, #0099CC)'
                : 'linear-gradient(90deg, #FFD700, #F0A500)',
            }}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Coladas', value: pastedCount, color: '#00E676', total: 980 },
            { label: 'Faltam', value: 980 - pastedCount, color: '#EF4444', total: 980 },
            { label: 'Repetidas', value: duplicateCount, color: '#00D4FF', total: null },
          ].map(stat => (
            <div
              key={stat.label}
              className="text-center py-2 px-1 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <p className="text-xl font-black" style={{ color: stat.color }}>
                {stat.value}
              </p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Busca */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar figurinha, time, número..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-field w-full pl-9 pr-4 py-3 rounded-xl text-sm"
          />
        </div>

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {([
            { key: 'all', label: 'Todas' },
            { key: 'missing', label: 'Faltando' },
            { key: 'pasted', label: 'Coladas' },
            { key: 'duplicates', label: 'Repetidas' },
          ] as { key: FilterType; label: string }[]).map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={cn(
                'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
                activeFilter === f.key
                  ? 'text-black'
                  : 'text-gray-400 bg-white/5 hover:bg-white/10'
              )}
              style={activeFilter === f.key ? { background: 'linear-gradient(135deg, #FFD700, #F0A500)' } : {}}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="px-4 space-y-3">
        {filteredStickers.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Nenhuma figurinha encontrada</p>
            <p className="text-gray-600 text-xs mt-1">Tente outros filtros ou termos de busca</p>
          </div>
        ) : (
          Array.from(sectionedStickers.entries()).map(([sectionId, stickers]) => {
            const sectionInfo = allSections.find(s => s.id === sectionId)
            const color = getSectionColor(sectionId)
            const isExpanded = expandedSection === sectionId || !!searchQuery
            const pastedInSection = stickers.filter(s => userStickers.get(s.number)?.is_pasted).length
            const teamData = sectionId.startsWith('grupo_')
              ? TEAMS.find(t => `grupo_${t.group.toLowerCase()}` === sectionId)
              : null

            return (
              <div
                key={sectionId}
                className="rounded-2xl overflow-hidden"
                style={{ border: `1px solid rgba(255,255,255,0.06)` }}
              >
                {/* Section header */}
                <button
                  onClick={() => setExpandedSection(isExpanded && !searchQuery ? null : sectionId)}
                  className="w-full flex items-center justify-between p-4"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: color }}
                    />
                    <div className="text-left">
                      <p className="text-sm font-bold text-white">
                        {sectionInfo?.name ?? sectionId}
                      </p>
                      <p className="text-xs text-gray-500">
                        {pastedInSection}/{stickers.length} coladas
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${color}22`, color }}
                    >
                      {Math.round((pastedInSection / stickers.length) * 100)}%
                    </span>
                    {!searchQuery && (
                      isExpanded
                        ? <ChevronDown className="w-4 h-4 text-gray-500" />
                        : <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </button>

                {/* Grid de figurinhas */}
                {(isExpanded || searchQuery) && (
                  <div
                    className="grid gap-1.5 p-3"
                    style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))' }}
                  >
                    {stickers.map(s => (
                      <StickerCard
                        key={s.number}
                        sticker={s}
                        userData={userStickers.get(s.number)}
                        onPress={setSelectedSticker}
                        size="sm"
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Modal */}
      {selectedSticker && (
        <StickerModal
          sticker={selectedSticker}
          userData={userStickers.get(selectedSticker.number) as any}
          onClose={() => setSelectedSticker(null)}
          onRegister={handleRegister}
        />
      )}
    </div>
  )
}
