// Dados mock para preview/desenvolvimento sem Supabase configurado

export const IS_PREVIEW = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

export const MOCK_PROFILE = {
  id: 'mock-user-id',
  username: 'figurinha_fan',
  display_name: 'Figurinha Fan',
  avatar_url: null,
  bio: null,
  pasted_count: 312,
  duplicate_count: 47,
  total_stickers: 312,
  completion_percent: 31.84,
  created_at: '2026-01-15T00:00:00Z',
}

// Gera um set de figurinhas mock (simula usuário com ~31% do álbum)
export function generateMockUserStickers(): Map<number, { sticker_id: number; quantity: number; is_pasted: boolean }> {
  const map = new Map<number, { sticker_id: number; quantity: number; is_pasted: boolean }>()

  // Coladas: numbers "aleatórios" mas determinísticos
  const pastedNumbers = new Set<number>()
  for (let i = 1; i <= 980; i++) {
    // ~32% de chance de ter a figurinha (baseado em hash simples)
    if ((i * 7 + i * i * 3) % 10 < 3) {
      pastedNumbers.add(i)
    }
  }

  // Repetidas: ~47 figurinhas com quantity > 1
  const dupNumbers = new Set<number>()
  Array.from(pastedNumbers).slice(0, 47).forEach(n => dupNumbers.add(n))

  pastedNumbers.forEach(n => {
    const qty = dupNumbers.has(n) ? 2 + (n % 3) : 1
    map.set(n, { sticker_id: n, quantity: qty, is_pasted: true })
  })

  return map
}
