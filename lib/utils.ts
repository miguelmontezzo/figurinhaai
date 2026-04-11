import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

export function getProgressColor(percent: number): string {
  if (percent >= 80) return 'text-brand-green'
  if (percent >= 50) return 'text-brand-cyan'
  if (percent >= 25) return 'text-brand-gold'
  return 'text-gray-400'
}

export function getProgressBg(percent: number): string {
  if (percent >= 80) return 'bg-brand-green'
  if (percent >= 50) return 'bg-brand-cyan'
  if (percent >= 25) return 'bg-brand-gold'
  return 'bg-gray-500'
}

export function distanceToString(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`
  return `${km.toFixed(1)}km`
}

export function getSectionColor(section: string): string {
  if (section === 'apresentacao') return '#7C3AED'
  if (section === 'sedes') return '#0099CC'
  if (section === 'fase_final') return '#FFD700'
  // grupos
  const groupColors: Record<string, string> = {
    grupo_a: '#EF4444',
    grupo_b: '#F97316',
    grupo_c: '#EAB308',
    grupo_d: '#22C55E',
    grupo_e: '#14B8A6',
    grupo_f: '#06B6D4',
    grupo_g: '#3B82F6',
    grupo_h: '#8B5CF6',
    grupo_i: '#EC4899',
    grupo_j: '#F59E0B',
    grupo_k: '#10B981',
    grupo_l: '#6366F1',
  }
  return groupColors[section] || '#6B7280'
}

export function getPositionLabel(position?: string): string {
  const labels: Record<string, string> = {
    GK: 'Goleiro',
    DEF: 'Defensor',
    MID: 'Meio-campo',
    FWD: 'Atacante',
    CT: 'Escudo/Time',
    TEC: 'Técnico',
  }
  return labels[position || ''] || position || ''
}

export function getPositionColor(position?: string): string {
  const colors: Record<string, string> = {
    GK: '#F59E0B',
    DEF: '#22C55E',
    MID: '#3B82F6',
    FWD: '#EF4444',
    CT: '#8B5CF6',
    TEC: '#6B7280',
  }
  return colors[position || ''] || '#6B7280'
}
