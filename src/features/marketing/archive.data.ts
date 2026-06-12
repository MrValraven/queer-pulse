import type { ImageSlotTint } from '../../shared/components/ui'
import { memberName } from '../members/data/members'

export const FEATURED = {
  quote:
    "The neighbourhood that raised us should still have room for us. That's not a radical idea. It's just the most basic thing.",
  initials: 'CV',
  avBg: 'rgba(45,27,61,.1)',
  avColor: 'var(--plum)',
  name: 'Catarina Vaz',
  role: 'Housing activist · Mouraria · Recorded June 2026',
  excerpt:
    'Catarina has lived in Mouraria for 22 years. She watched the neighbourhood she grew up in become somewhere she could barely afford to stay — and decided to do something about it. This is her story, in her own words.',
  imgTint: 'plum' as ImageSlotTint,
}

export interface ArchiveCard {
  id: string
  imgTint: ImageSlotTint
  year: string
  quote: string
  desc: string
  initials: string
  avBg: string
  avColor: string
  name: string
  meta: string
}

export const ARCHIVE_CARDS: ArchiveCard[] = [
  {
    id: 'amara',
    imgTint: 'default',
    year: 'Recorded 2025',
    quote:
      'I came to Lisbon with one suitcase and the address of an ILGA Portugal meeting. That meeting changed everything.',
    desc:
      'Arriving from Kinshasa in 2019, navigating a new country and a new language while also figuring out who she was — Amara\'s story of building a life in Lisbon.',
    initials: 'AM',
    avBg: 'rgba(122,82,184,.15)',
    avColor: '#7A52B8',
    name: 'Amara Mbeki',
    meta: 'Community worker · Intendente',
  },
  {
    id: 'leonor',
    imgTint: 'coral',
    year: 'Recorded 2025',
    quote:
      'I was the first openly queer employee at my company. Then I was the last. The two things were not unrelated.',
    desc:
      "A product manager's account of coming out at a Lisbon startup, the backlash, and how she rebuilt her career on her own terms.",
    initials: 'LM',
    avBg: 'rgba(232,119,90,.15)',
    avColor: 'var(--accent-ink)',
    name: 'Leonor Marques',
    meta: 'Tech · Arroios',
  },
  {
    id: 'jose',
    imgTint: 'plum',
    year: 'Recorded 2024',
    quote:
      "We used to have a name for every bar on that street. Most of them are gone now. The names aren't.",
    desc:
      "A 62-year-old retired teacher traces queer Lisbon's nightlife history from the 1980s to today — what was lost, what survived, and why it mattered.",
    initials: 'JA',
    avBg: 'rgba(45,27,61,.1)',
    avColor: 'var(--plum)',
    name: 'José Abreu',
    meta: 'Retired teacher · Bairro Alto',
  },
  {
    id: 'jonas',
    imgTint: 'jade',
    year: 'Recorded 2024',
    quote:
      "My family didn't come to my transition. But the community did. That's something I think about every day.",
    desc:
      'Jonas documents his transition in Portugal in the era before the Gender Identity Law — the bureaucracy, the indignities, and the people who made it bearable.',
    initials: 'JF',
    avBg: 'rgba(74,140,111,.15)',
    avColor: 'var(--jade)',
    name: 'Jonas Ferreira',
    meta: 'Healthcare advocate',
  },
]

export interface OralQuote {
  name: string
  role: string
  quote: string
  year: string
}

export const ORAL_QUOTES: OralQuote[] = [
  {
    name: 'Fátima Mendes',
    role: 'Community organiser · Mouraria',
    quote:
      "When I arrived, there was nowhere for queer immigrants to go that didn't assume we were already settled, already safe. So we made it.",
    year: 'Recorded 2025',
  },
  {
    name: memberName('diogo'),
    role: 'Music producer · Bairro Alto',
    quote:
      "The dancefloor is the one place where being queer felt like an advantage, not a liability. I've been chasing that feeling ever since.",
    year: 'Recorded 2024',
  },
  {
    name: memberName('sofia'),
    role: 'Filmmaker · Alfama',
    quote:
      "I started filming queer stories because nobody else was. I kept going because the people in front of my camera kept teaching me things I didn't know I needed to learn.",
    year: 'Recorded 2024',
  },
  {
    name: memberName('mariana'),
    role: 'Psychologist · Estrela',
    quote:
      "The loneliness queer people carry isn't just personal — it's structural. Fixing it requires community. Not just therapy.",
    year: 'Recorded 2025',
  },
]
