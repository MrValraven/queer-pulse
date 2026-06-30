import { routes } from '../../app/routeMap'
import { MEMBERS, memberName } from '../members/data/members'

export const PROFILE = routes.members
export const INVITE = routes.requestInvite

export type Tint = 'coral' | 'jade' | 'plum'
export const TINT_BG: Record<Tint, string> = {
  coral: 'rgba(232,119,90,.15)',
  jade: 'rgba(74,140,111,.15)',
  plum: 'rgba(45,27,61,.1)',
}
export const TINT_FG: Record<Tint, string> = {
  coral: 'var(--accent-ink)',
  jade: 'var(--jade)',
  plum: 'var(--plum)',
}

export interface Featured {
  nameMain: string
  nameEm: string
  discipline: string
  quote: string
  badges: string[]
}
export const FEATURED: Featured[] = [
  { nameMain: 'André ', nameEm: 'Quintela', discipline: 'Analog Photography · Medium Format Film', quote: 'I photograph people who have never liked having their photograph taken. Something always happens.', badges: ['commission', 'open call'] },
  { nameMain: 'Diogo ', nameEm: 'Vasques', discipline: 'Electronic Music · Live Sets · Film Scoring', quote: 'The best show I ever played was to 12 people in a basement. No one was performing anything.', badges: ['commission', 'live sets'] },
  { nameMain: 'Lena ', nameEm: 'Ferraz', discipline: 'Textile Art · Embroidery · Installation', quote: 'I embroider bodies because bodies are the first thing that gets erased.', badges: ['exhibition', 'commission'] },
]

export interface ArtWork {
  artist: string
  initials: string
  tint: Tint
  hood: string
  medium: string
  title: string
  statement: string
  imgH: number
  badges: string[]
}
export const ART_WORKS: ArtWork[] = [
  { artist: memberName('ines'), initials: MEMBERS.ines!.initials, tint: 'coral', hood: 'Príncipe Real', medium: 'Editorial & Type Design', title: 'Pulso Display — variable serif', statement: 'A typeface rooted in 1970s Portuguese protest printing, reworked for contemporary queer editorial.', imgH: 200, badges: ['commission'] },
  { artist: memberName('andre'), initials: MEMBERS.andre!.initials, tint: 'jade', hood: 'Cais do Sodré', medium: 'Analog Photography', title: 'Faces of the Bairro', statement: '40 medium-format portraits of Mouraria residents shot over six months. No retouching, no direction.', imgH: 300, badges: ['commission', 'open call'] },
  { artist: memberName('beatriz'), initials: MEMBERS.beatriz!.initials, tint: 'plum', hood: 'Graça', medium: 'Studio Ceramics', title: 'Slow Objects — functional series', statement: 'Bowls, cups, vessels designed for daily use. Each piece fired once and left to age.', imgH: 170, badges: ['exhibition'] },
  { artist: 'Lena Ferraz', initials: 'LF', tint: 'coral', hood: 'Intendente', medium: 'Textile & Embroidery', title: 'Corpo Presente', statement: 'Large-scale embroidered figures exploring trans embodiment. Currently touring community spaces.', imgH: 260, badges: ['exhibition', 'commission'] },
  { artist: 'Mateus Oliveira', initials: 'MO', tint: 'jade', hood: 'Mouraria', medium: 'Illustration', title: 'Lisbon Queer Zine Series', statement: "Self-published zines documenting queer life in Lisbon's historic bairros since 2023.", imgH: 210, badges: ['open call'] },
  { artist: memberName('sofia'), initials: MEMBERS.sofia!.initials, tint: 'jade', hood: 'Alfama', medium: 'Documentary Film', title: 'O Café das Seis', statement: 'A 22-minute portrait of a Mouraria café and the chosen family that lives inside it.', imgH: 160, badges: ['exhibition'] },
  { artist: 'Clara Melo', initials: 'CM', tint: 'plum', hood: 'LX Factory', medium: 'Mural & Public Art', title: 'Arco — Príncipe Real mural', statement: 'A 14-metre mural commissioned by the neighbourhood association. Pigment on exposed brick.', imgH: 230, badges: ['commission'] },
]

export interface MusicArtist {
  id: string
  name: string
  tint: Tint
  hood: string
  genre: string
  bio: string
  badges: string[]
  tracks: { title: string; dur: string }[]
}
export const MUSIC_ARTISTS: MusicArtist[] = [
  { id: 'm1', name: memberName('diogo'), tint: 'jade', hood: 'Bairro Alto', genre: 'Electronic · Club · Ambient', bio: 'Diogo produces textured electronic music rooted in queer club culture. He scores films, runs a live set residency at Lux, and shares a studio above a café in Bairro Alto with two other producers.', badges: ['commission', 'live sets'], tracks: [{ title: 'Pulso (Club Edit)', dur: '6:14' }, { title: 'Noite Longa', dur: '8:02' }, { title: 'Réstia', dur: '4:48' }, { title: 'Cais (feat. Mariana L.)', dur: '5:33' }] },
  { id: 'm2', name: 'Mara Santos', tint: 'coral', hood: 'Arroios', genre: 'Folk · New Portuguese · Voice', bio: 'Mara writes and performs in Portuguese, drawing on fado structures and dismantling them. Her debut record came out in March on a small Lisbon label. She performs in spaces that feel like living rooms.', badges: ['bookings open'], tracks: [{ title: 'Espelho', dur: '3:41' }, { title: 'Março', dur: '4:22' }, { title: 'Cidade Pequena', dur: '5:08' }] },
  { id: 'm3', name: 'Kiko Neves', tint: 'plum', hood: 'Marvila', genre: 'Jazz · Experimental · Improv', bio: 'Kiko plays piano and keys and leads a quartet focused on improvisation and composition in equal measure. They play roughly once a month at a natural wine bar in Marvila.', badges: ['live sets', 'commission'], tracks: [{ title: 'Quarta-Feira', dur: '7:18' }, { title: 'Forma Livre', dur: '9:44' }, { title: 'Estação', dur: '5:29' }] },
  { id: 'm4', name: 'Vera Luz', tint: 'jade', hood: 'Estrela', genre: 'R&B · Soul · Production', bio: "Vera writes, produces, and sings — mostly late at night in a home studio that used to be a pantry. Her sound lives between late 90s R&B and something she hasn't named yet.", badges: ['collab'], tracks: [{ title: 'Tarde de Abril', dur: '3:55' }, { title: 'Ninguém Vê', dur: '4:14' }, { title: 'Mel', dur: '3:38' }, { title: 'Distância Zero', dur: '5:02' }] },
]

export const ART_FILTERS = ['All', 'Photography', 'Ceramics', 'Typography', 'Film', 'Illustration', 'Textile', 'Mural']
export const MUSIC_FILTERS = ['All', 'Electronic', 'Folk', 'Jazz', 'R&B', 'Live sets', 'Commission open']

export function parseDur(s: string) {
  const [m = 0, sec = 0] = s.split(':').map(Number)
  return m * 60 + sec
}

export function seededHeights(id: string, bars: number) {
  let seed = id.split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  const heights: number[] = []
  for (let i = 0; i < bars; i++) {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff
    heights.push(0.25 + Math.abs((seed & 0xff) / 255) * 0.75)
  }
  return heights
}
