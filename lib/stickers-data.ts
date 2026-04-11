// ============================================================
// FigurinhaAI - Copa do Mundo FIFA 2026™
// Mapeamento completo das 980 figurinhas
// 912 regulares (couché) + 68 especiais (papel metalizado)
// Formato: 49 x 65 mm | Envelopes: 80 x 100 mm com 7 figurinhas
// ============================================================

export type StickerType = 'regular' | 'especial'

export interface Sticker {
  number: number
  name: string
  section: string
  sectionName: string
  type: StickerType
  groupName?: string
  team?: string
  teamCode?: string
  teamFlag?: string
  playerPosition?: string
  description?: string
}

export interface StickerSection {
  id: string
  name: string
  group?: string
  teamCode?: string
  flag?: string
  startNumber: number
  endNumber: number
  color: string
}

// ============================================================
// TIMES DA COPA 2026 (48 seleções em 12 grupos)
// ============================================================
interface TeamData {
  name: string
  code: string
  flag: string
  group: string
  confederation: string
}

export const TEAMS: TeamData[] = [
  // Grupo A
  { name: 'Estados Unidos', code: 'USA', flag: '🇺🇸', group: 'A', confederation: 'CONCACAF' },
  { name: 'Alemanha', code: 'GER', flag: '🇩🇪', group: 'A', confederation: 'UEFA' },
  { name: 'Marrocos', code: 'MAR', flag: '🇲🇦', group: 'A', confederation: 'CAF' },
  { name: 'Japão', code: 'JPN', flag: '🇯🇵', group: 'A', confederation: 'AFC' },
  // Grupo B
  { name: 'México', code: 'MEX', flag: '🇲🇽', group: 'B', confederation: 'CONCACAF' },
  { name: 'França', code: 'FRA', flag: '🇫🇷', group: 'B', confederation: 'UEFA' },
  { name: 'Senegal', code: 'SEN', flag: '🇸🇳', group: 'B', confederation: 'CAF' },
  { name: 'Coreia do Sul', code: 'KOR', flag: '🇰🇷', group: 'B', confederation: 'AFC' },
  // Grupo C
  { name: 'Canadá', code: 'CAN', flag: '🇨🇦', group: 'C', confederation: 'CONCACAF' },
  { name: 'Espanha', code: 'ESP', flag: '🇪🇸', group: 'C', confederation: 'UEFA' },
  { name: 'Nigéria', code: 'NGA', flag: '🇳🇬', group: 'C', confederation: 'CAF' },
  { name: 'Irã', code: 'IRN', flag: '🇮🇷', group: 'C', confederation: 'AFC' },
  // Grupo D
  { name: 'Brasil', code: 'BRA', flag: '🇧🇷', group: 'D', confederation: 'CONMEBOL' },
  { name: 'Inglaterra', code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'D', confederation: 'UEFA' },
  { name: 'Egito', code: 'EGY', flag: '🇪🇬', group: 'D', confederation: 'CAF' },
  { name: 'Arábia Saudita', code: 'KSA', flag: '🇸🇦', group: 'D', confederation: 'AFC' },
  // Grupo E
  { name: 'Argentina', code: 'ARG', flag: '🇦🇷', group: 'E', confederation: 'CONMEBOL' },
  { name: 'Portugal', code: 'POR', flag: '🇵🇹', group: 'E', confederation: 'UEFA' },
  { name: 'Costa do Marfim', code: 'CIV', flag: '🇨🇮', group: 'E', confederation: 'CAF' },
  { name: 'Austrália', code: 'AUS', flag: '🇦🇺', group: 'E', confederation: 'AFC' },
  // Grupo F
  { name: 'Colômbia', code: 'COL', flag: '🇨🇴', group: 'F', confederation: 'CONMEBOL' },
  { name: 'Holanda', code: 'NED', flag: '🇳🇱', group: 'F', confederation: 'UEFA' },
  { name: 'Argélia', code: 'ALG', flag: '🇩🇿', group: 'F', confederation: 'CAF' },
  { name: 'Catar', code: 'QAT', flag: '🇶🇦', group: 'F', confederation: 'AFC' },
  // Grupo G
  { name: 'Uruguai', code: 'URU', flag: '🇺🇾', group: 'G', confederation: 'CONMEBOL' },
  { name: 'Itália', code: 'ITA', flag: '🇮🇹', group: 'G', confederation: 'UEFA' },
  { name: 'Gana', code: 'GHA', flag: '🇬🇭', group: 'G', confederation: 'CAF' },
  { name: 'Iraque', code: 'IRQ', flag: '🇮🇶', group: 'G', confederation: 'AFC' },
  // Grupo H
  { name: 'Equador', code: 'ECU', flag: '🇪🇨', group: 'H', confederation: 'CONMEBOL' },
  { name: 'Bélgica', code: 'BEL', flag: '🇧🇪', group: 'H', confederation: 'UEFA' },
  { name: 'África do Sul', code: 'RSA', flag: '🇿🇦', group: 'H', confederation: 'CAF' },
  { name: 'Jordânia', code: 'JOR', flag: '🇯🇴', group: 'H', confederation: 'AFC' },
  // Grupo I
  { name: 'Venezuela', code: 'VEN', flag: '🇻🇪', group: 'I', confederation: 'CONMEBOL' },
  { name: 'Croácia', code: 'CRO', flag: '🇭🇷', group: 'I', confederation: 'UEFA' },
  { name: 'Camarões', code: 'CMR', flag: '🇨🇲', group: 'I', confederation: 'CAF' },
  { name: 'Nova Zelândia', code: 'NZL', flag: '🇳🇿', group: 'I', confederation: 'OFC' },
  // Grupo J
  { name: 'Polônia', code: 'POL', flag: '🇵🇱', group: 'J', confederation: 'UEFA' },
  { name: 'Panamá', code: 'PAN', flag: '🇵🇦', group: 'J', confederation: 'CONCACAF' },
  { name: 'Turquia', code: 'TUR', flag: '🇹🇷', group: 'J', confederation: 'UEFA' },
  { name: 'Paraguai', code: 'PAR', flag: '🇵🇾', group: 'J', confederation: 'CONMEBOL' },
  // Grupo K
  { name: 'Dinamarca', code: 'DEN', flag: '🇩🇰', group: 'K', confederation: 'UEFA' },
  { name: 'Honduras', code: 'HON', flag: '🇭🇳', group: 'K', confederation: 'CONCACAF' },
  { name: 'Sérvia', code: 'SRB', flag: '🇷🇸', group: 'K', confederation: 'UEFA' },
  { name: 'Ucrânia', code: 'UKR', flag: '🇺🇦', group: 'K', confederation: 'UEFA' },
  // Grupo L
  { name: 'Suíça', code: 'SUI', flag: '🇨🇭', group: 'L', confederation: 'UEFA' },
  { name: 'Jamaica', code: 'JAM', flag: '🇯🇲', group: 'L', confederation: 'CONCACAF' },
  { name: 'Áustria', code: 'AUT', flag: '🇦🇹', group: 'L', confederation: 'UEFA' },
  { name: 'Hungria', code: 'HUN', flag: '🇭🇺', group: 'L', confederation: 'UEFA' },
]

// ============================================================
// SEDES (16 estádios)
// ============================================================
const VENUES = [
  { name: 'MetLife Stadium', city: 'New York/New Jersey', country: 'EUA', emoji: '🏟️' },
  { name: 'Rose Bowl', city: 'Los Angeles', country: 'EUA', emoji: '🏟️' },
  { name: "Levi's Stadium", city: 'San Francisco', country: 'EUA', emoji: '🏟️' },
  { name: 'Lumen Field', city: 'Seattle', country: 'EUA', emoji: '🏟️' },
  { name: 'AT&T Stadium', city: 'Dallas', country: 'EUA', emoji: '🏟️' },
  { name: 'NRG Stadium', city: 'Houston', country: 'EUA', emoji: '🏟️' },
  { name: 'Mercedes-Benz Stadium', city: 'Atlanta', country: 'EUA', emoji: '🏟️' },
  { name: 'Gillette Stadium', city: 'Boston', country: 'EUA', emoji: '🏟️' },
  { name: 'Arrowhead Stadium', city: 'Kansas City', country: 'EUA', emoji: '🏟️' },
  { name: 'Hard Rock Stadium', city: 'Miami', country: 'EUA', emoji: '🏟️' },
  { name: 'Lincoln Financial Field', city: 'Filadélfia', country: 'EUA', emoji: '🏟️' },
  { name: 'BMO Field', city: 'Toronto', country: 'Canadá', emoji: '🏟️' },
  { name: 'BC Place', city: 'Vancouver', country: 'Canadá', emoji: '🏟️' },
  { name: 'Estadio Azteca', city: 'Cidade do México', country: 'México', emoji: '🏟️' },
  { name: 'Estadio Akron', city: 'Guadalajara', country: 'México', emoji: '🏟️' },
  { name: 'Estadio BBVA', city: 'Monterrey', country: 'México', emoji: '🏟️' },
]

// ============================================================
// GERADOR DAS 980 FIGURINHAS
// ============================================================
export function generateAllStickers(): Sticker[] {
  const stickers: Sticker[] = []

  // ----------------------------------------------------------
  // SEÇÃO 1: Apresentação (1-9) - 4 especiais
  // ----------------------------------------------------------
  const apresentacao = [
    { name: 'Logo Oficial Copa 2026™', type: 'especial' as StickerType, desc: 'Logotipo oficial do torneio' },
    { name: 'Taça FIFA', type: 'especial' as StickerType, desc: 'A taça mais cobiçada do futebol' },
    { name: 'Mascote Oficial', type: 'especial' as StickerType, desc: 'Mascote do torneio' },
    { name: 'Copa 2026 - Panorama', type: 'regular' as StickerType, desc: '48 seleções, 3 países anfitriões' },
    { name: 'Países Anfitriões', type: 'especial' as StickerType, desc: 'Estados Unidos, Canadá e México' },
    { name: 'EUA - País Anfitrião', type: 'regular' as StickerType, desc: 'United States of America' },
    { name: 'Canadá - País Anfitrião', type: 'regular' as StickerType, desc: 'Canada' },
    { name: 'México - País Anfitrião', type: 'regular' as StickerType, desc: 'México' },
    { name: 'Programação do Torneio', type: 'regular' as StickerType, desc: 'Calendário e formato de competição' },
  ]
  apresentacao.forEach((s, i) => {
    stickers.push({
      number: i + 1,
      name: s.name,
      section: 'apresentacao',
      sectionName: 'Apresentação',
      type: s.type,
      description: s.desc,
    })
  })

  // ----------------------------------------------------------
  // SEÇÃO 2: Sedes (10-57) - 16 sedes × 3 figurinhas
  // ----------------------------------------------------------
  let n = 10
  VENUES.forEach((venue, i) => {
    stickers.push({
      number: n++,
      name: `${venue.city} - Vista Geral`,
      section: 'sedes',
      sectionName: 'Sedes',
      type: 'regular',
      description: `${venue.city}, ${venue.country}`,
    })
    stickers.push({
      number: n++,
      name: venue.name,
      section: 'sedes',
      sectionName: 'Sedes',
      type: 'regular',
      description: `Estádio em ${venue.city}`,
    })
    stickers.push({
      number: n++,
      name: `${venue.city} - Detalhes`,
      section: 'sedes',
      sectionName: 'Sedes',
      type: 'regular',
      description: `Capacidade e informações de ${venue.name}`,
    })
  })
  // n deve ser 58 agora

  // ----------------------------------------------------------
  // SEÇÃO 3: Grupos A-L (58-921) - 12 grupos × 4 times × 18 figurinhas
  // ----------------------------------------------------------
  const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
  const positions = ['GK', 'GK', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'MID', 'MID', 'FWD', 'FWD', 'FWD']

  groups.forEach((group) => {
    const groupTeams = TEAMS.filter(t => t.group === group)
    groupTeams.forEach((team) => {
      // Figurinha 1: Escudo (ESPECIAL METALIZADO)
      stickers.push({
        number: n++,
        name: `${team.name} - Escudo`,
        section: `grupo_${group.toLowerCase()}`,
        sectionName: `Grupo ${group}`,
        type: 'especial',
        groupName: group,
        team: team.name,
        teamCode: team.code,
        teamFlag: team.flag,
        playerPosition: 'CT',
        description: `Escudo oficial de ${team.name}`,
      })
      // Figurinha 2: Foto da Seleção
      stickers.push({
        number: n++,
        name: `${team.name} - Seleção`,
        section: `grupo_${group.toLowerCase()}`,
        sectionName: `Grupo ${group}`,
        type: 'regular',
        groupName: group,
        team: team.name,
        teamCode: team.code,
        teamFlag: team.flag,
        playerPosition: 'CT',
        description: `Foto oficial da seleção de ${team.name}`,
      })
      // Figurinha 3: Técnico
      stickers.push({
        number: n++,
        name: `${team.name} - Técnico`,
        section: `grupo_${group.toLowerCase()}`,
        sectionName: `Grupo ${group}`,
        type: 'regular',
        groupName: group,
        team: team.name,
        teamCode: team.code,
        teamFlag: team.flag,
        playerPosition: 'TEC',
        description: `Comissão técnica de ${team.name}`,
      })
      // Figurinhas 4-18: Jogadores (15 jogadores)
      positions.forEach((pos, pi) => {
        stickers.push({
          number: n++,
          name: `${team.name} - Jogador ${pi + 1}`,
          section: `grupo_${group.toLowerCase()}`,
          sectionName: `Grupo ${group}`,
          type: 'regular',
          groupName: group,
          team: team.name,
          teamCode: team.code,
          teamFlag: team.flag,
          playerPosition: pos,
          description: `Jogador ${pi + 1} da seleção de ${team.name}`,
        })
      })
    })
  })
  // n deve ser 922 agora

  // ----------------------------------------------------------
  // SEÇÃO 4: Fase Final (922-980) - 16 especiais
  // ----------------------------------------------------------
  const faseFinal = [
    { name: 'Fase de Grupos - Panorama', type: 'especial' as StickerType },
    { name: 'Oitavas de Final', type: 'regular' as StickerType },
    { name: 'Oitavas - Jogo 1', type: 'regular' as StickerType },
    { name: 'Oitavas - Jogo 2', type: 'regular' as StickerType },
    { name: 'Oitavas - Jogo 3', type: 'regular' as StickerType },
    { name: 'Oitavas - Jogo 4', type: 'regular' as StickerType },
    { name: 'Oitavas - Jogo 5', type: 'regular' as StickerType },
    { name: 'Oitavas - Jogo 6', type: 'regular' as StickerType },
    { name: 'Oitavas - Jogo 7', type: 'regular' as StickerType },
    { name: 'Oitavas - Jogo 8', type: 'regular' as StickerType },
    { name: 'Quartas de Final', type: 'especial' as StickerType },
    { name: 'Quartas - Jogo 1', type: 'regular' as StickerType },
    { name: 'Quartas - Jogo 2', type: 'regular' as StickerType },
    { name: 'Quartas - Jogo 3', type: 'regular' as StickerType },
    { name: 'Quartas - Jogo 4', type: 'regular' as StickerType },
    { name: 'Semifinais', type: 'especial' as StickerType },
    { name: 'Semifinal 1', type: 'regular' as StickerType },
    { name: 'Semifinal 2', type: 'regular' as StickerType },
    { name: 'Disputa pelo 3º Lugar', type: 'regular' as StickerType },
    { name: 'Grande Final', type: 'especial' as StickerType },
    { name: 'Final - Aquecimento', type: 'regular' as StickerType },
    { name: 'Final - Primeiro Tempo', type: 'regular' as StickerType },
    { name: 'Final - Segundo Tempo', type: 'regular' as StickerType },
    { name: 'Final - Pênaltis', type: 'regular' as StickerType },
    { name: 'Final - A Conquista', type: 'especial' as StickerType },
    { name: 'Campeão 2026™', type: 'especial' as StickerType },
    { name: 'Levantando a Taça', type: 'especial' as StickerType },
    { name: 'Artilheiro do Torneio', type: 'especial' as StickerType },
    { name: 'Melhor Jogador (Bola de Ouro)', type: 'especial' as StickerType },
    { name: 'Melhor Goleiro (Luva de Ouro)', type: 'especial' as StickerType },
    { name: 'Melhor Jovem', type: 'especial' as StickerType },
    { name: 'Gol do Torneio', type: 'especial' as StickerType },
    { name: 'Melhor Equipe do Torneio - GK', type: 'especial' as StickerType },
    { name: 'Melhor Equipe do Torneio - DEF 1', type: 'especial' as StickerType },
    { name: 'Melhor Equipe do Torneio - DEF 2', type: 'regular' as StickerType },
    { name: 'Melhor Equipe do Torneio - DEF 3', type: 'regular' as StickerType },
    { name: 'Melhor Equipe do Torneio - DEF 4', type: 'regular' as StickerType },
    { name: 'Melhor Equipe do Torneio - MID 1', type: 'especial' as StickerType },
    { name: 'Melhor Equipe do Torneio - MID 2', type: 'regular' as StickerType },
    { name: 'Melhor Equipe do Torneio - MID 3', type: 'regular' as StickerType },
    { name: 'Melhor Equipe do Torneio - ATK 1', type: 'especial' as StickerType },
    { name: 'Melhor Equipe do Torneio - ATK 2', type: 'regular' as StickerType },
    { name: 'Melhor Equipe do Torneio - ATK 3', type: 'regular' as StickerType },
    { name: 'Copa 2026 - Retrospectiva', type: 'regular' as StickerType },
    { name: 'Copa 2026 - Legado', type: 'regular' as StickerType },
    { name: 'Copa 2026 - Torcida', type: 'regular' as StickerType },
    { name: 'Copa 2026 - Emoção', type: 'regular' as StickerType },
    { name: 'Copa 2026 - Galeria de Campeões', type: 'regular' as StickerType },
    { name: 'Copa 2026 - Até a Próxima!', type: 'regular' as StickerType },
    { name: 'Copa 2026 - FIM', type: 'regular' as StickerType },
    // Completar exatamente até 980 (59 stickers na seção 4)
    { name: 'Copa 2026 - Recordes', type: 'regular' as StickerType },
    { name: 'Copa 2026 - Estatísticas', type: 'regular' as StickerType },
    { name: 'Copa 2026 - Classificação Final', type: 'regular' as StickerType },
    { name: 'Copa 2026 - Artilharia', type: 'regular' as StickerType },
    { name: 'Copa 2026 - Fair Play', type: 'regular' as StickerType },
    { name: 'Copa 2026 - Assistências', type: 'regular' as StickerType },
    { name: 'Copa 2026 - Goleiros Destaque', type: 'regular' as StickerType },
    { name: 'Copa 2026 - Defesas do Torneio', type: 'regular' as StickerType },
    { name: 'Copa 2026 - Momentos Mágicos', type: 'regular' as StickerType },
  ]

  faseFinal.forEach((s, i) => {
    stickers.push({
      number: n++,
      name: s.name,
      section: 'fase_final',
      sectionName: 'Fase Final',
      type: s.type,
      description: s.name,
    })
  })

  return stickers
}

// Cache das figurinhas
let _stickersCache: Sticker[] | null = null

export function getAllStickers(): Sticker[] {
  if (!_stickersCache) {
    _stickersCache = generateAllStickers()
  }
  return _stickersCache
}

export function getStickerByNumber(number: number): Sticker | undefined {
  return getAllStickers().find(s => s.number === number)
}

export function getStickersBySection(section: string): Sticker[] {
  return getAllStickers().filter(s => s.section === section)
}

export function getStickersByTeam(teamCode: string): Sticker[] {
  return getAllStickers().filter(s => s.teamCode === teamCode)
}

export function getStickersByGroup(group: string): Sticker[] {
  return getAllStickers().filter(s => s.groupName === group)
}

// Todas as seções únicas
export function getAllSections(): { id: string; name: string; count: number; group?: string }[] {
  const stickers = getAllStickers()
  const sections = new Map<string, { id: string; name: string; count: number; group?: string }>()

  stickers.forEach(s => {
    if (!sections.has(s.section)) {
      sections.set(s.section, {
        id: s.section,
        name: s.sectionName,
        count: 0,
        group: s.groupName,
      })
    }
    sections.get(s.section)!.count++
  })

  return Array.from(sections.values())
}

// Verifica totais
export function getAlbumStats() {
  const all = getAllStickers()
  const total = all.length
  const especiais = all.filter(s => s.type === 'especial').length
  const regulares = all.filter(s => s.type === 'regular').length
  return { total, especiais, regulares }
}
