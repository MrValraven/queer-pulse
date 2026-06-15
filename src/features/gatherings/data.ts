import { memberName } from '../members/data/members'

export interface GatheringDetail {
  slug: string
  type: string
  day: string
  month: string
  title: string
  hood: string
  host: string
  hostSlug: string
  spots: string
  cta: string
  body: string
}

export const gatheringDetails: Record<string, GatheringDetail> = {
  'supper-club-12': {
    slug: 'supper-club-12',
    type: 'Supper Club',
    day: '06',
    month: 'Jun',
    title: 'Queer Supper Club №12',
    hood: 'Mouraria',
    host: memberName('tomas'),
    hostSlug: 'tomas',
    spots: '8 seats left',
    cta: 'Reserve a seat',
    body: 'Twelve seats, no menu, whatever came in that week. Tomás cooks with whatever is seasonal and beautiful. Guests bring wine. The conversation takes care of itself. Doors open at 7:30pm, dinner at 8. The address is shared on the morning of the event.',
  },
  'portfolio-night': {
    slug: 'portfolio-night',
    type: 'Mixer',
    day: '14',
    month: 'Jun',
    title: 'Portfolio Night: Designers & Photographers',
    hood: 'Príncipe Real',
    host: 'QueerPulse',
    hostSlug: '',
    spots: '32 going',
    cta: "I'll be there",
    body: 'Bring a portfolio, a laptop, a phone — whatever your work lives on. This is an informal evening for designers and photographers in the network to share work-in-progress and meet each other without an agenda. Drinks from 7pm at a borrowed space in Príncipe Real.',
  },
  'studio-visit': {
    slug: 'studio-visit',
    type: 'Studio Visit',
    day: '21',
    month: 'Jun',
    title: "Inside Beatriz's Ceramics Studio",
    hood: 'Graça',
    host: memberName('beatriz'),
    hostSlug: 'beatriz',
    spots: '3 spots left',
    cta: 'Request a spot',
    body: "A slow Sunday afternoon in Beatriz's studio in Graça. She'll talk through her practice, show the kiln, and there will be clay to touch. Limited to 10 people. Tea provided. The studio is at the top of a steep hill and worth every step.",
  },
  'founders-breakfast': {
    slug: 'founders-breakfast',
    type: 'Breakfast',
    day: '02',
    month: 'Jul',
    title: 'Founders & Builders Breakfast',
    hood: 'Marvila',
    host: 'QueerPulse',
    hostSlug: '',
    spots: 'Casual',
    cta: 'RSVP',
    body: 'An early-morning gathering for people building things — companies, studios, projects, community organisations. No pitching. No networking. Just good coffee, bread from a bakery in Mouraria, and honest conversation about what it\'s actually like to build something.',
  },
}

export const defaultGatheringSlug = 'supper-club-12'

// ── Community calendar events (month is 0-indexed) ──
export interface CalendarEvent {
  date: Date
  org: string
  orgColor: string
  title: string
  hood: string
  time: string
  to: string
}

const ACCENT = 'var(--accent)'
const JADE = 'var(--jade)'
const COMMUNITY = '#7A52B8'
const PARTNER = 'rgba(45,27,61,.7)'

/** Org category colours shared between the calendar and the events list. */
export const orgColors = {
  queerpulse: ACCENT,
  ilga: JADE,
  community: COMMUNITY,
  partner: PARTNER,
}

export const calendarEvents: CalendarEvent[] = [
  { date: new Date(2026, 5, 6), org: 'QueerPulse', orgColor: ACCENT, title: 'Queer Supper Club №12', hood: 'Mouraria', time: '7:30pm', to: '/gathering#supper-club-12' },
  { date: new Date(2026, 5, 10), org: 'Community', orgColor: COMMUNITY, title: 'Trans & NB Hub — Monthly Meetup', hood: 'Arroios', time: '6:30pm', to: '/trans-hub' },
  { date: new Date(2026, 5, 12), org: 'QueerPulse', orgColor: ACCENT, title: 'Skills Exchange — Intro Session', hood: 'Príncipe Real', time: '6pm', to: '/barter' },
  { date: new Date(2026, 5, 14), org: 'QueerPulse', orgColor: ACCENT, title: 'Portfolio Night: Designers & Photogs', hood: 'Príncipe Real', time: '7pm', to: '/gathering#portfolio-night' },
  { date: new Date(2026, 5, 17), org: 'QueerPulse', orgColor: ACCENT, title: 'Queer Parent Network — First Meetup', hood: 'Estrela', time: '10:30am', to: '/parents' },
  { date: new Date(2026, 5, 18), org: 'ILGA Portugal', orgColor: JADE, title: 'LGBTQ+ Support Circle', hood: 'Intendente', time: '6:30pm', to: '/event' },
  { date: new Date(2026, 5, 20), org: 'Community', orgColor: COMMUNITY, title: 'Trans Mutual Aid Open Meeting', hood: 'Mouraria', time: '6pm', to: '/communities' },
  { date: new Date(2026, 5, 21), org: 'QueerPulse', orgColor: ACCENT, title: "Inside Beatriz's Ceramics Studio", hood: 'Graça', time: '3pm', to: '/gathering#studio-visit' },
  { date: new Date(2026, 5, 24), org: 'Community', orgColor: COMMUNITY, title: 'Queer Elders — Monthly Social', hood: 'Chiado', time: '5pm', to: '/communities' },
  { date: new Date(2026, 5, 25), org: 'Community', orgColor: COMMUNITY, title: 'Queer Film Screening: Moonlight', hood: 'Príncipe Real', time: '8pm', to: '/event' },
  { date: new Date(2026, 5, 26), org: 'QueerPulse', orgColor: ACCENT, title: 'Wellbeing Q&A — Therapist AMA', hood: 'Online', time: '7pm', to: '/wellbeing' },
  { date: new Date(2026, 5, 28), org: 'Community', orgColor: COMMUNITY, title: 'Queer Runners — End-of-Month Run', hood: 'Tejo path', time: '9am', to: '/communities' },
  { date: new Date(2026, 6, 2), org: 'QueerPulse', orgColor: ACCENT, title: 'Founders & Builders Breakfast', hood: 'Marvila', time: '8:30am', to: '/gathering#founders-breakfast' },
  { date: new Date(2026, 6, 5), org: 'Community', orgColor: COMMUNITY, title: 'Queer Youth Network — First Gathering', hood: 'Arroios', time: '5pm', to: '/communities' },
  { date: new Date(2026, 6, 7), org: 'Rede ex aequo', orgColor: PARTNER, title: 'Rede Monthly Gathering', hood: 'Lisbon', time: '6pm', to: '/event' },
  { date: new Date(2026, 6, 9), org: 'QueerPulse', orgColor: ACCENT, title: 'Disability & Access — Open Conversation', hood: 'Online', time: '6:30pm', to: '/communities' },
  { date: new Date(2026, 6, 11), org: 'ILGA Portugal', orgColor: JADE, title: 'Free Legal Clinic', hood: 'Intendente', time: '2pm', to: '/legal' },
  { date: new Date(2026, 6, 14), org: 'Community', orgColor: COMMUNITY, title: 'Queer Choir Monthly Rehearsal', hood: 'Príncipe Real', time: '7pm', to: '/communities' },
  { date: new Date(2026, 6, 16), org: 'QueerPulse', orgColor: ACCENT, title: 'Resource Library Launch — Live Q&A', hood: 'Online', time: '7pm', to: '/library' },
  { date: new Date(2026, 6, 19), org: 'Opus Diversus', orgColor: JADE, title: 'Peer Support Circle — Open Session', hood: 'Estrela', time: '6:30pm', to: '/event' },
  { date: new Date(2026, 6, 22), org: 'QueerPulse', orgColor: ACCENT, title: 'Micro-Grants — Q3 Open Office Hours', hood: 'Online', time: '12pm', to: '/grants' },
  { date: new Date(2026, 6, 26), org: 'Community', orgColor: COMMUNITY, title: 'Queer & of Colour — Monthly Gathering', hood: 'Intendente', time: '5:30pm', to: '/communities' },
]

export const calendarLegend = [
  { label: 'QueerPulse', color: ACCENT },
  { label: 'ILGA Portugal', color: JADE },
  { label: 'Community', color: COMMUNITY },
  { label: 'Partner orgs', color: 'rgba(247,243,238,.5)' },
]
