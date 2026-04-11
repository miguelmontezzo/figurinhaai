'use client'

import { useState } from 'react'
import { X, Plus, Minus, Star, CheckCircle2, Loader2, Trash2 } from 'lucide-react'
import { cn, getPositionLabel, getPositionColor } from '@/lib/utils'
import type { Sticker } from '@/lib/stickers-data'

interface UserStickerData {
  id: string
  quantity: number
  is_pasted: boolean
}

interface StickerModalProps {
  sticker: Sticker | null
  userData?: UserStickerData
  onClose: () => void
  onRegister: (stickerId: number, action: 'add' | 'remove') => Promise<void>
}

export function StickerModal({ sticker, userData, onClose, onRegister }: StickerModalProps) {
  const [loading, setLoading] = useState(false)

  if (!sticker) return null

  const hasPasted = userData?.is_pasted ?? false
  const quantity = userData?.quantity ?? 0
  const duplicates = Math.max(quantity - 1, 0)

  async function handleAdd() {
    setLoading(true)
    await onRegister(sticker!.number, 'add')
    setLoading(false)
  }

  async function handleRemove() {
    setLoading(true)
    await onRegister(sticker!.number, 'remove')
    setLoading(false)
  }

  const positionColor = getPositionColor(sticker.playerPosition)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-sm rounded-3xl overflow-hidden animate-slide-up"
        style={{ background: '#1a1a35', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="relative p-6 pb-4"
          style={{
            background: sticker.type === 'especial'
              ? 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,215,0,0.05))'
              : sticker.teamFlag
              ? 'linear-gradient(135deg, rgba(26,26,53,0.9), rgba(18,18,42,0.9))'
              : 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(26,26,53,0.9))',
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Número + tipo */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-xs font-black px-2.5 py-1 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              #{String(sticker.number).padStart(3, '0')}
            </span>
            {sticker.type === 'especial' && (
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1"
                style={{ background: 'rgba(255,215,0,0.2)', color: '#FFD700' }}
              >
                <Star className="w-3 h-3 fill-current" />
                Especial
              </span>
            )}
            {sticker.playerPosition && sticker.playerPosition !== 'CT' && sticker.playerPosition !== 'TEC' && (
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-lg"
                style={{ background: `${positionColor}22`, color: positionColor }}
              >
                {sticker.playerPosition}
              </span>
            )}
          </div>

          {/* Flag + Nome do time */}
          {sticker.teamFlag && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl">{sticker.teamFlag}</span>
              <div>
                <p className="text-xs text-gray-400 font-medium">{sticker.sectionName}</p>
                <p className="text-sm font-bold text-white">{sticker.team}</p>
              </div>
            </div>
          )}

          {/* Nome da figurinha */}
          <h2 className="text-lg font-black text-white leading-tight">
            {sticker.playerPosition === 'CT'
              ? `Escudo – ${sticker.team}`
              : sticker.playerPosition === 'TEC'
              ? `Técnico – ${sticker.team}`
              : sticker.name}
          </h2>

          {sticker.playerPosition && !['CT', 'TEC'].includes(sticker.playerPosition) && (
            <p className="text-xs text-gray-400 mt-1">
              {getPositionLabel(sticker.playerPosition)}
            </p>
          )}

          {!sticker.teamFlag && (
            <p className="text-sm text-gray-400 mt-1">{sticker.sectionName}</p>
          )}
        </div>

        {/* Status atual */}
        <div className="px-6 py-4 border-t border-white/5">
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-3">
            Status na coleção
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p
                className="text-xl font-black"
                style={{ color: hasPasted ? '#00E676' : '#374151' }}
              >
                {hasPasted ? '✓' : '–'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Colada</p>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-xl font-black text-brand-cyan">{quantity}</p>
              <p className="text-xs text-gray-500 mt-0.5">Total</p>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-xl font-black" style={{ color: duplicates > 0 ? '#00D4FF' : '#374151' }}>
                {duplicates > 0 ? `+${duplicates}` : '–'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Repetidas</p>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="px-6 pb-6 space-y-3">
          {/* Botão principal: registrar */}
          <button
            onClick={handleAdd}
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-base transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{
              background: hasPasted
                ? 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,212,255,0.1))'
                : 'linear-gradient(135deg, #00E676, #00C853)',
              color: hasPasted ? '#00D4FF' : '#000',
              border: hasPasted ? '1px solid rgba(0,212,255,0.3)' : 'none',
            }}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : hasPasted ? (
              <>
                <Plus className="w-5 h-5" />
                Tenho mais uma (repetida)
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Tenho essa figurinha!
              </>
            )}
          </button>

          {/* Remover */}
          {quantity > 0 && (
            <button
              onClick={handleRemove}
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-red-400"
              style={{ border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)' }}
            >
              <Minus className="w-4 h-4" />
              {quantity === 1 ? 'Remover figurinha' : 'Remover uma repetida'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
