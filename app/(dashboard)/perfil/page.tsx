'use client'

import { useState, useEffect } from 'react'
import {
  Trophy, BookOpen, ArrowLeftRight, Star, LogOut, ChevronRight,
  Loader2, Edit2, Check, X, Target
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn, formatPercent, getProgressBg } from '@/lib/utils'
import { IS_PREVIEW, MOCK_PROFILE, generateMockUserStickers } from '@/lib/mock-data'
import toast from 'react-hot-toast'

interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  pasted_count: number
  duplicate_count: number
  total_stickers: number
  completion_percent: number
  created_at: string
}

const GROUP_COLORS: Record<string, string> = {
  'A': '#EF4444', 'B': '#F97316', 'C': '#EAB308', 'D': '#22C55E',
  'E': '#14B8A6', 'F': '#06B6D4', 'G': '#3B82F6', 'H': '#8B5CF6',
  'I': '#EC4899', 'J': '#F59E0B', 'K': '#10B981', 'L': '#6366F1',
}

export default function PerfilPage() {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [groupStats, setGroupStats] = useState<{ group: string; pasted: number; total: number }[]>([])

  useEffect(() => {
    async function loadProfile() {
      // Modo preview: usar dados mock
      if (IS_PREVIEW) {
        const mockData = MOCK_PROFILE as Profile
        setProfile(mockData)
        setNewName(mockData.display_name || mockData.username)

        const mockStickers = generateMockUserStickers()
        const userPasted = new Set(
          Array.from(mockStickers.values()).filter(s => s.is_pasted).map(s => s.sticker_id)
        )
        const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
        const stats = groups.map((group, i) => {
          const start = 58 + i * 72
          let pasted = 0
          for (let n = start; n < start + 72; n++) {
            if (userPasted.has(n)) pasted++
          }
          return { group, pasted, total: 72 }
        })
        setGroupStats(stats)
        setLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const [profileRes, stickersRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('user_stickers').select('sticker_id, is_pasted').eq('user_id', user.id),
      ])

      if (profileRes.data) {
        setProfile(profileRes.data)
        setNewName(profileRes.data.display_name || profileRes.data.username)
      }

      // Calcular stats por grupo (A-L)
      // Cada grupo tem 72 figurinhas (4 times × 18)
      if (stickersRes.data) {
        const userPasted = new Set(
          stickersRes.data.filter(s => s.is_pasted).map(s => s.sticker_id)
        )

        const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
        const stats = groups.map((group, i) => {
          const start = 58 + i * 72
          const end = start + 72
          let pasted = 0
          for (let n = start; n < end; n++) {
            if (userPasted.has(n)) pasted++
          }
          return { group, pasted, total: 72 }
        })
        setGroupStats(stats)
      }

      setLoading(false)
    }
    loadProfile()
  }, [])

  async function handleSaveName() {
    if (!profile || !newName.trim()) return
    setSavingName(true)
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: newName.trim() })
      .eq('id', profile.id)

    if (!error) {
      setProfile(prev => prev ? { ...prev, display_name: newName.trim() } : null)
      setEditingName(false)
      toast.success('Nome atualizado!')
    } else {
      toast.error('Erro ao salvar nome')
    }
    setSavingName(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success('Até logo!')
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
      </div>
    )
  }

  if (!profile) return null

  const completion = profile.completion_percent
  const memberSince = new Date(profile.created_at).toLocaleDateString('pt-BR', {
    month: 'long', year: 'numeric',
  })

  return (
    <div className="pb-4">
      {/* Header / Hero */}
      <div
        className="px-4 pt-12 pb-6"
        style={{
          background: 'linear-gradient(180deg, rgba(124,58,237,0.15) 0%, transparent 100%)',
        }}
      >
        {/* Avatar + Nome */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #00D4FF)' }}
          >
            {(profile.display_name || profile.username)[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="input-field px-3 py-2 rounded-xl text-sm flex-1 min-w-0"
                  autoFocus
                  maxLength={50}
                />
                <button
                  onClick={handleSaveName}
                  disabled={savingName}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-brand-green"
                  style={{ background: 'rgba(0,230,118,0.2)' }}
                >
                  {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => { setEditingName(false); setNewName(profile.display_name || profile.username) }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400"
                  style={{ background: 'rgba(239,68,68,0.1)' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white truncate">
                  {profile.display_name || profile.username}
                </h1>
                <button
                  onClick={() => setEditingName(true)}
                  className="text-gray-600 hover:text-gray-400 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-sm text-gray-500">@{profile.username}</p>
            <p className="text-xs text-gray-600 mt-0.5">Membro desde {memberSince}</p>
          </div>
        </div>

        {/* Completion circle */}
        <div className="glass rounded-2xl p-5 flex items-center gap-5">
          {/* SVG ring */}
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle
                cx="40" cy="40" r="34"
                fill="none"
                stroke={completion >= 80 ? '#00E676' : completion >= 50 ? '#00D4FF' : '#FFD700'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - completion / 100)}`}
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-black text-white">{Math.round(completion)}%</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-base font-black text-white mb-1">Álbum Completo</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Coladas</span>
                <span className="text-brand-green font-bold">{profile.pasted_count}/980</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Faltam</span>
                <span className="text-red-400 font-bold">{980 - profile.pasted_count}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Repetidas</span>
                <span className="text-brand-cyan font-bold">{profile.duplicate_count}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Progresso por grupo */}
        <div>
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-brand-purple" />
            Progresso por Grupo
          </h2>
          <div className="glass rounded-2xl p-4 space-y-2.5">
            {groupStats.map(({ group, pasted, total }) => {
              const pct = Math.round((pasted / total) * 100)
              const color = GROUP_COLORS[group] || '#6B7280'
              return (
                <div key={group} className="flex items-center gap-3">
                  <span
                    className="text-xs font-black w-6 text-center flex-shrink-0"
                    style={{ color }}
                  >
                    {group}
                  </span>
                  <div className="flex-1">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right flex-shrink-0">
                    {pasted}/{total}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Cards de stats rápidas */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: <BookOpen className="w-5 h-5" />, value: profile.pasted_count, label: 'Coladas', color: '#00E676' },
            { icon: <Star className="w-5 h-5" />, value: profile.duplicate_count, label: 'Repetidas', color: '#00D4FF' },
            { icon: <Trophy className="w-5 h-5" />, value: `${Math.round(completion)}%`, label: 'Completo', color: '#FFD700' },
          ].map((s, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-3 text-center"
            >
              <div className="flex justify-center mb-1.5" style={{ color: s.color }}>
                {s.icon}
              </div>
              <p className="text-lg font-black text-white">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Sobre o app */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Sobre o App</p>
          </div>
          {[
            { label: 'Total de figurinhas', value: '980' },
            { label: 'Regulares (couché)', value: '912' },
            { label: 'Especiais (metalizado)', value: '68' },
            { label: 'Grupos', value: '12 (A-L)' },
            { label: 'Seleções', value: '48' },
            { label: 'Envelopes com', value: '7 figurinhas' },
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center px-4 py-3 border-b border-white/5 last:border-0">
              <span className="text-sm text-gray-400">{item.label}</span>
              <span className="text-sm font-bold text-white">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Sair */}
        <button
          onClick={handleLogout}
          className="w-full py-4 rounded-2xl font-semibold text-red-400 flex items-center justify-center gap-2 transition-all active:scale-95"
          style={{ border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)' }}
        >
          <LogOut className="w-5 h-5" />
          Sair da conta
        </button>

        <p className="text-center text-xs text-gray-700 pb-2">
          FigurinhaAI v1.0 · Copa do Mundo FIFA 2026™ · Não afiliado à FIFA ou Panini®
        </p>
      </div>
    </div>
  )
}
