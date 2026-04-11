'use client'

import { useState, useEffect } from 'react'
import {
  MapPin, Star, Plus, Users, ChevronRight, Search,
  Building2, Loader2, Clock, Navigation, CheckCircle2, X
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface TradePoint {
  id: string
  name: string
  description: string | null
  address: string | null
  city: string
  state: string | null
  country: string
  latitude: number
  longitude: number
  type: 'oficial' | 'comunidade'
  upvotes: number
  schedule: string | null
  is_active: boolean
  created_by?: string
  profiles?: { username: string; display_name: string | null } | null
}

interface AddPointForm {
  name: string
  description: string
  address: string
  city: string
  state: string
  schedule: string
  latitude: string
  longitude: string
}

const INITIAL_FORM: AddPointForm = {
  name: '',
  description: '',
  address: '',
  city: '',
  state: '',
  schedule: '',
  latitude: '',
  longitude: '',
}

export default function PontosPage() {
  const supabase = createClient()

  const [points, setPoints] = useState<TradePoint[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'oficial' | 'comunidade'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState<AddPointForm>(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      const { data, error } = await supabase
        .from('trade_points')
        .select('*')
        .eq('is_active', true)
        .order('type', { ascending: false }) // oficial primeiro
        .order('upvotes', { ascending: false })

      if (data) setPoints(data)
      setLoading(false)
    }
    loadData()
  }, [])

  const filteredPoints = points.filter(p => {
    if (activeTab !== 'all' && p.type !== activeTab) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        p.name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.address?.toLowerCase().includes(q) ||
        false
      )
    }
    return true
  })

  async function getMyLocation() {
    setGettingLocation(true)
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      )
      setForm(f => ({
        ...f,
        latitude: pos.coords.latitude.toFixed(6),
        longitude: pos.coords.longitude.toFixed(6),
      }))
      toast.success('Localização obtida!')
    } catch {
      toast.error('Não foi possível obter localização')
    } finally {
      setGettingLocation(false)
    }
  }

  async function handleUpvote(pointId: string) {
    const { error } = await supabase.rpc('increment', { id: pointId, table: 'trade_points', field: 'upvotes' })
    if (!error) {
      setPoints(prev => prev.map(p => p.id === pointId ? { ...p, upvotes: p.upvotes + 1 } : p))
      toast.success('Avaliação registrada!')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return toast.error('Faça login primeiro')
    if (!form.latitude || !form.longitude) return toast.error('Informe a localização')

    setSubmitting(true)
    const { error } = await supabase.from('trade_points').insert({
      name: form.name,
      description: form.description || null,
      address: form.address || null,
      city: form.city,
      state: form.state || null,
      schedule: form.schedule || null,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      type: 'comunidade',
      created_by: userId,
    })

    if (error) {
      toast.error('Erro ao adicionar ponto. Tente novamente.')
    } else {
      toast.success('Ponto de troca adicionado! 🎉')
      setShowAddForm(false)
      setForm(INITIAL_FORM)
      // Recarregar
      const { data } = await supabase.from('trade_points').select('*').eq('is_active', true).order('type', { ascending: false }).order('upvotes', { ascending: false })
      if (data) setPoints(data)
    }
    setSubmitting(false)
  }

  return (
    <div className="pb-4">
      {/* Header */}
      <div
        className="px-4 pt-12 pb-6"
        style={{
          background: 'linear-gradient(180deg, rgba(0,212,255,0.1) 0%, transparent 100%)',
        }}
      >
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-2xl font-black text-white">Pontos de Troca</h1>
            <p className="text-sm text-gray-400">Locais oficiais e da comunidade</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-black"
            style={{ background: 'linear-gradient(135deg, #00D4FF, #0099CC)' }}
          >
            <Plus className="w-4 h-4" />
            Indicar
          </button>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por nome ou cidade..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-field w-full pl-9 pr-4 py-3 rounded-xl text-sm"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {([
            { key: 'all', label: 'Todos', count: points.length },
            { key: 'oficial', label: 'Oficiais', count: points.filter(p => p.type === 'oficial').length },
            { key: 'comunidade', label: 'Comunidade', count: points.filter(p => p.type === 'comunidade').length },
          ] as { key: typeof activeTab; label: string; count: number }[]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5',
                activeTab === tab.key ? 'text-black' : 'text-gray-400 glass'
              )}
              style={activeTab === tab.key ? { background: 'linear-gradient(135deg, #00D4FF, #0099CC)' } : {}}
            >
              {tab.label}
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full font-bold',
                  activeTab === tab.key ? 'bg-black/20 text-black' : 'bg-white/10'
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Lista de pontos */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-brand-cyan mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Carregando pontos...</p>
          </div>
        ) : filteredPoints.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Nenhum ponto encontrado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPoints.map(point => (
              <div
                key={point.id}
                className="glass rounded-2xl overflow-hidden"
              >
                {/* Badge tipo */}
                <div
                  className="px-4 pt-3 pb-0 flex items-center gap-2"
                >
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                    style={
                      point.type === 'oficial'
                        ? { background: 'rgba(255,215,0,0.2)', color: '#FFD700' }
                        : { background: 'rgba(0,212,255,0.15)', color: '#00D4FF' }
                    }
                  >
                    {point.type === 'oficial' ? (
                      <Building2 className="w-3 h-3" />
                    ) : (
                      <Users className="w-3 h-3" />
                    )}
                    {point.type === 'oficial' ? 'Oficial Panini' : 'Comunidade'}
                  </div>
                  {point.upvotes > 0 && (
                    <span className="text-xs text-gray-500">
                      👍 {point.upvotes}
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-white text-base mb-1">{point.name}</h3>

                  {point.description && (
                    <p className="text-xs text-gray-400 mb-2">{point.description}</p>
                  )}

                  <div className="space-y-1.5">
                    {point.address && (
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-400">
                          {point.address} · {point.city}{point.state ? `, ${point.state}` : ''}
                        </p>
                      </div>
                    )}
                    {!point.address && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-500" />
                        <p className="text-xs text-gray-400">
                          {point.city}{point.state ? `, ${point.state}` : ''}
                        </p>
                      </div>
                    )}
                    {point.schedule && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        <p className="text-xs text-gray-400">{point.schedule}</p>
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 mt-3">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${point.latitude},${point.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-cyan flex-1 justify-center"
                      style={{ border: '1px solid rgba(0,212,255,0.2)', background: 'rgba(0,212,255,0.05)' }}
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Como chegar
                    </a>
                    {point.type === 'comunidade' && (
                      <button
                        onClick={() => handleUpvote(point.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-gold"
                        style={{ border: '1px solid rgba(255,215,0,0.2)', background: 'rgba(255,215,0,0.05)' }}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Confirmar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal adicionar ponto */}
      {showAddForm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-4"
          onClick={() => setShowAddForm(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-sm rounded-3xl overflow-hidden animate-slide-up"
            style={{
              background: '#1a1a35',
              border: '1px solid rgba(255,255,255,0.1)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black text-white">Indicar Ponto de Troca</h2>
                <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                    Nome do local *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Ex: Praça da Sé - São Paulo"
                    required
                    className="input-field w-full px-4 py-3 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    placeholder="Rua, número, bairro"
                    className="input-field w-full px-4 py-3 rounded-xl text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                      Cidade *
                    </label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                      placeholder="São Paulo"
                      required
                      className="input-field w-full px-4 py-3 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                      Estado
                    </label>
                    <input
                      type="text"
                      value={form.state}
                      onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                      placeholder="SP"
                      maxLength={2}
                      className="input-field w-full px-4 py-3 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                    Horário de funcionamento
                  </label>
                  <input
                    type="text"
                    value={form.schedule}
                    onChange={e => setForm(f => ({ ...f, schedule: e.target.value }))}
                    placeholder="Ex: Sáb e Dom, 9h-17h"
                    className="input-field w-full px-4 py-3 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                    Localização (GPS) *
                  </label>
                  <button
                    type="button"
                    onClick={getMyLocation}
                    disabled={gettingLocation}
                    className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 mb-2"
                    style={{ border: '1px solid rgba(0,212,255,0.3)', background: 'rgba(0,212,255,0.08)', color: '#00D4FF' }}
                  >
                    {gettingLocation ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Navigation className="w-4 h-4" />
                    )}
                    {form.latitude ? 'Localização obtida ✓' : 'Usar minha localização atual'}
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="any"
                      value={form.latitude}
                      onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))}
                      placeholder="Latitude"
                      className="input-field w-full px-3 py-2.5 rounded-xl text-xs"
                    />
                    <input
                      type="number"
                      step="any"
                      value={form.longitude}
                      onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))}
                      placeholder="Longitude"
                      className="input-field w-full px-3 py-2.5 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                    Descrição
                  </label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Descreva o local, como funciona a troca..."
                    rows={3}
                    className="input-field w-full px-4 py-3 rounded-xl text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !form.name || !form.city || !form.latitude}
                  className="w-full py-4 rounded-xl font-bold text-black text-base transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #00D4FF, #0099CC)' }}
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <MapPin className="w-5 h-5" />
                      Adicionar Ponto
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
