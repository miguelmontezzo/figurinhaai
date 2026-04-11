'use client'

import { cn } from '@/lib/utils'
import type { Sticker } from '@/lib/stickers-data'

interface UserStickerData {
  quantity: number
  is_pasted: boolean
}

interface StickerCardProps {
  sticker: Sticker
  userData?: UserStickerData
  onPress: (sticker: Sticker) => void
  size?: 'sm' | 'md'
}

export function StickerCard({ sticker, userData, onPress, size = 'md' }: StickerCardProps) {
  const hasPasted = userData?.is_pasted ?? false
  const duplicates = userData ? Math.max(userData.quantity - 1, 0) : 0
  const isEmpty = !userData || (!hasPasted && userData.quantity === 0)

  const isSmall = size === 'sm'

  return (
    <button
      onClick={() => onPress(sticker)}
      className={cn(
        'sticker-card relative rounded-xl border text-left transition-all',
        isSmall ? 'p-2' : 'p-3',
        sticker.type === 'especial' ? 'sticker-especial' : '',
        isEmpty
          ? 'border-white/5 bg-white/3'
          : hasPasted
          ? 'border-white/15 bg-white/5'
          : 'border-white/10 bg-white/3'
      )}
      style={
        hasPasted && !isSmall
          ? { boxShadow: `0 0 0 1px rgba(0, 230, 118, 0.2)` }
          : sticker.type === 'especial' && hasPasted
          ? { boxShadow: `0 0 0 1px rgba(255, 215, 0, 0.3)` }
          : undefined
      }
    >
      {/* Número */}
      <div className="flex items-start justify-between gap-1 mb-1">
        <span
          className={cn(
            'font-black leading-none',
            isEmpty ? 'text-gray-600' : 'text-white',
            isSmall ? 'text-xs' : 'text-sm'
          )}
        >
          {String(sticker.number).padStart(3, '0')}
        </span>
        {sticker.type === 'especial' && (
          <span className="text-brand-gold" style={{ fontSize: '8px' }}>★</span>
        )}
      </div>

      {/* Flag + Team */}
      {sticker.teamFlag && !isSmall && (
        <div className="flex items-center gap-1 mb-1">
          <span style={{ fontSize: '12px' }}>{sticker.teamFlag}</span>
          <span
            className="text-xs font-bold truncate"
            style={{ color: isEmpty ? '#4B5563' : '#9CA3AF', fontSize: '9px' }}
          >
            {sticker.teamCode}
          </span>
        </div>
      )}

      {/* Nome */}
      {!isSmall && (
        <p
          className="truncate leading-tight"
          style={{
            fontSize: '9px',
            color: isEmpty ? '#374151' : '#6B7280',
          }}
        >
          {sticker.playerPosition === 'CT'
            ? 'Escudo'
            : sticker.playerPosition === 'TEC'
            ? 'Técnico'
            : sticker.name.replace(/.*- /, '')}
        </p>
      )}

      {/* Status badges */}
      <div className="flex items-center gap-1 mt-1.5">
        {hasPasted && (
          <div
            className="rounded-full flex items-center justify-center"
            style={{
              width: isSmall ? '14px' : '16px',
              height: isSmall ? '14px' : '16px',
              background: sticker.type === 'especial'
                ? 'linear-gradient(135deg, #FFD700, #F0A500)'
                : 'rgba(0, 230, 118, 0.2)',
            }}
          >
            <svg
              className="fill-current"
              style={{
                width: isSmall ? '8px' : '9px',
                height: isSmall ? '8px' : '9px',
                color: sticker.type === 'especial' ? '#000' : '#00E676',
              }}
              viewBox="0 0 12 12"
            >
              <path d="M10.28 2.28L4 8.56 1.72 6.28a1 1 0 00-1.41 1.41l3 3a1 1 0 001.41 0l7-7a1 1 0 00-1.41-1.41z" />
            </svg>
          </div>
        )}
        {duplicates > 0 && (
          <div
            className="rounded-full px-1 flex items-center justify-center"
            style={{
              height: isSmall ? '14px' : '16px',
              background: 'rgba(0, 212, 255, 0.2)',
              minWidth: isSmall ? '14px' : '16px',
            }}
          >
            <span
              className="font-bold text-brand-cyan leading-none"
              style={{ fontSize: isSmall ? '8px' : '9px' }}
            >
              +{duplicates}
            </span>
          </div>
        )}
      </div>
    </button>
  )
}
