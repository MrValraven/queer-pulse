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
  'trans-hub-meetup': {
    slug: 'trans-hub-meetup',
    type: 'Meetup',
    day: '10',
    month: 'Jun',
    title: 'Trans & NB Hub — Monthly Meetup',
    hood: 'Arroios',
    host: 'Trans & NB Hub',
    hostSlug: '',
    spots: 'Open to all',
    cta: 'RSVP',
    body: 'A relaxed monthly evening for trans and non-binary folks to land, breathe, and be among people who get it. No agenda beyond company — tea, snacks, and whatever the room wants to talk about. New faces are always welcome; you can sit quietly until you feel like talking.',
  },
  'skills-exchange-intro': {
    slug: 'skills-exchange-intro',
    type: 'Workshop',
    day: '12',
    month: 'Jun',
    title: 'Skills Exchange — Intro Session',
    hood: 'Príncipe Real',
    host: 'QueerPulse',
    hostSlug: '',
    spots: '12 spots left',
    cta: 'Reserve a spot',
    body: 'An introduction to the QueerPulse skills barter — how to offer what you know, ask for what you need, and trade without money changing hands. We\'ll walk through real examples from the network and help you post your first offer by the end of the hour.',
  },
  'queer-parent-network': {
    slug: 'queer-parent-network',
    type: 'Meetup',
    day: '17',
    month: 'Jun',
    title: 'Queer Parent Network — First Meetup',
    hood: 'Estrela',
    host: 'QueerPulse',
    hostSlug: '',
    spots: 'Family-friendly',
    cta: 'RSVP',
    body: 'The first gathering of the Queer Parent Network — for LGBTQ+ parents, carers, and those thinking about it. Kids welcome; there\'s a corner of the park with shade and space to run. Come swap notes on schools, doctors, and the small daily logistics of raising a family here.',
  },
  'trans-mutual-aid': {
    slug: 'trans-mutual-aid',
    type: 'Mutual Aid',
    day: '20',
    month: 'Jun',
    title: 'Trans Mutual Aid — Open Meeting',
    hood: 'Mouraria',
    host: 'Trans Mutual Aid Lisboa',
    hostSlug: '',
    spots: 'Open to all',
    cta: 'RSVP',
    body: 'An open organising meeting for the trans mutual aid fund — where requests are reviewed, money is pooled, and the next month\'s priorities get set together. Everyone has a voice. If you need support or want to give it, this is the room where both happen.',
  },
  'queer-elders-social': {
    slug: 'queer-elders-social',
    type: 'Social',
    day: '24',
    month: 'Jun',
    title: 'Queer Elders — Monthly Social',
    hood: 'Chiado',
    host: 'Queer Elders Lisboa',
    hostSlug: '',
    spots: 'Open to all',
    cta: 'RSVP',
    body: 'An unhurried afternoon for queer elders and the friends who love them — coffee, cake, and the kind of stories that don\'t get told often enough. Intergenerational guests welcome. Step-free venue with seating throughout.',
  },
  'wellbeing-ama': {
    slug: 'wellbeing-ama',
    type: 'Q&A',
    day: '26',
    month: 'Jun',
    title: 'Wellbeing Q&A — Therapist AMA',
    hood: 'Online',
    host: 'QueerPulse',
    hostSlug: '',
    spots: 'Online',
    cta: 'Join online',
    body: 'A live, anonymous Q&A with a queer-affirming therapist from the QueerPulse wellbeing network. Bring your questions about burnout, anxiety, identity, relationships — or just listen. Submit questions ahead of time or in the chat; nothing is named or recorded.',
  },
  'queer-runners-run': {
    slug: 'queer-runners-run',
    type: 'Run Club',
    day: '28',
    month: 'Jun',
    title: 'Queer Runners — End-of-Month Run',
    hood: 'Tejo path',
    host: 'Queer Runners',
    hostSlug: '',
    spots: 'All paces',
    cta: 'RSVP',
    body: 'A flat, friendly 5K along the river to close out the month — all paces, walkers included, no one left behind. We meet by the water, run loose, and finish with coffee. First-timers, say hi when you arrive and we\'ll pair you up.',
  },
  'queer-youth-gathering': {
    slug: 'queer-youth-gathering',
    type: 'Meetup',
    day: '05',
    month: 'Jul',
    title: 'Queer Youth Network — First Gathering',
    hood: 'Arroios',
    host: 'Queer Youth Network',
    hostSlug: '',
    spots: 'Ages 16–25',
    cta: 'RSVP',
    body: 'The opening gathering of the Queer Youth Network, for LGBTQ+ people aged 16–25. A safe, low-key space to meet others, share what you\'re into, and shape what the group becomes. Facilitated by trained volunteers. Snacks provided.',
  },
  'disability-access-talk': {
    slug: 'disability-access-talk',
    type: 'Open Conversation',
    day: '09',
    month: 'Jul',
    title: 'Disability & Access — Open Conversation',
    hood: 'Online',
    host: 'QueerPulse',
    hostSlug: '',
    spots: 'Online',
    cta: 'Join online',
    body: 'An open conversation about disability, access, and chronic illness in queer community — what works, what doesn\'t, and what we want QueerPulse to do better. Live captions provided. Your input shapes the network\'s access commitments for the year.',
  },
  'legal-clinic': {
    slug: 'legal-clinic',
    type: 'Legal Clinic',
    day: '11',
    month: 'Jul',
    title: 'Free Legal Clinic',
    hood: 'Intendente',
    host: 'ILGA Portugal',
    hostSlug: '',
    spots: 'By appointment',
    cta: 'Book a slot',
    body: 'Free, confidential one-to-one sessions with volunteer lawyers from ILGA Portugal — name changes, residency, discrimination, housing, and more. Twenty-minute slots, booked in advance. Bring any relevant paperwork; everything discussed stays private.',
  },
  'queer-choir-rehearsal': {
    slug: 'queer-choir-rehearsal',
    type: 'Rehearsal',
    day: '14',
    month: 'Jul',
    title: 'Queer Choir — Monthly Rehearsal',
    hood: 'Príncipe Real',
    host: 'Lisbon Queer Choir',
    hostSlug: '',
    spots: 'No audition',
    cta: 'RSVP',
    body: 'Monthly rehearsal of the Lisbon Queer Choir — no audition, no sheet-music required, every voice welcome. We warm up together, learn by ear, and build toward the season\'s performances. Come for one song or stay for all of them.',
  },
  'resource-library-launch': {
    slug: 'resource-library-launch',
    type: 'Launch',
    day: '16',
    month: 'Jul',
    title: 'Resource Library Launch — Live Q&A',
    hood: 'Online',
    host: 'QueerPulse',
    hostSlug: '',
    spots: 'Online',
    cta: 'Join online',
    body: 'A live walkthrough of the new QueerPulse Resource Library — health, legal, housing, and community guides gathered in one place — followed by an open Q&A. Tell us what\'s missing; the first round of additions comes straight from this call.',
  },
  'micro-grants-office-hours': {
    slug: 'micro-grants-office-hours',
    type: 'Office Hours',
    day: '22',
    month: 'Jul',
    title: 'Micro-Grants — Q3 Open Office Hours',
    hood: 'Online',
    host: 'QueerPulse',
    hostSlug: '',
    spots: 'Drop in',
    cta: 'Join online',
    body: 'Drop-in office hours for the Q3 micro-grants round — bring a half-formed idea or a nearly-finished application and we\'ll help you shape it. No project is too small. The grants fund community projects up to €500, no strings, quick turnaround.',
  },
  'queer-of-colour-gathering': {
    slug: 'queer-of-colour-gathering',
    type: 'Gathering',
    day: '26',
    month: 'Jul',
    title: 'Queer & of Colour — Monthly Gathering',
    hood: 'Intendente',
    host: 'Queer & of Colour Collective',
    hostSlug: '',
    spots: 'Open to all',
    cta: 'RSVP',
    body: 'A monthly gathering centring QTIBIPOC experiences — food, music, and conversation in a space made by and for queer and trans people of colour. Allies who are invited by a member are welcome. Come as you are; this is a place to exhale.',
  },
  'queer-night-swim': {
    slug: 'queer-night-swim',
    type: 'Swim',
    day: '22',
    month: 'Jun',
    title: 'Queer Night Swim',
    hood: 'Piscina Municipal, Anjos',
    host: 'Queer Swimmers Lisboa',
    hostSlug: '',
    spots: '12 going',
    cta: "I'll be there",
    body: 'A laid-back evening swim for the queer community — lengths if you want them, floating and chatting if you don\'t. The lifeguarded municipal pool is ours for the hour after closing. Bring a suit and a towel; everything else is optional. New swimmers and nervous ones especially welcome.',
  },
  'queer-book-club': {
    slug: 'queer-book-club',
    type: 'Book Club',
    day: '19',
    month: 'Jul',
    title: 'Queer Book Club — July',
    hood: 'LX Factory, Alcântara',
    host: 'QueerPulse',
    hostSlug: '',
    spots: '12 going',
    cta: 'RSVP',
    body: 'This month we\'re reading a queer classic and meeting in the courtyard at LX Factory to talk it over. You don\'t need to have finished the book — or even started it — to come along. Wine, snacks, and an easy conversation from 6pm. The next read gets picked together at the end.',
  },
  // ── Detail pages for the member's own "My Events" dashboard ──
  // Each card in /account/events links here via its `slug`.
  'stone-butch-blues': {
    slug: 'stone-butch-blues',
    type: 'Book Club',
    day: '29',
    month: 'Jun',
    title: 'Queer Book Club — “Stone Butch Blues”',
    hood: 'Mouraria',
    host: 'Lisbon Queer Reads',
    hostSlug: '',
    spots: '11 going',
    cta: 'RSVP',
    body: 'We\'re sitting with Leslie Feinberg\'s “Stone Butch Blues” this month — chapter ten through the end. Come whether you\'ve finished or fallen behind; the conversation makes room for both. Tea from 6:45pm, discussion at 7. Room 2 on the first floor, step-free and sober throughout.',
  },
  'trans-joy-picnic': {
    slug: 'trans-joy-picnic',
    type: 'Picnic',
    day: '30',
    month: 'Jun',
    title: 'Trans Joy Picnic',
    hood: 'Jardim da Estrela',
    host: 'Trans Lisbon',
    hostSlug: '',
    spots: '18 going · 4 on the waitlist',
    cta: 'RSVP',
    body: 'A slow afternoon in the shade at Jardim da Estrela — blankets, snacks to share, and the easy company of trans and non-binary folks and the people who love them. There\'s a quiet corner away from the crowd if you need it. Step-free paths throughout. Bring what you can; there\'s always plenty to go round.',
  },
  'sober-queers-supper': {
    slug: 'sober-queers-supper',
    type: 'Supper Club',
    day: '05',
    month: 'Jul',
    title: 'Sober Queers Supper Club',
    hood: 'Príncipe Real',
    host: 'Sober Queers',
    hostSlug: '',
    spots: 'Waitlist open',
    cta: 'Join the waitlist',
    body: 'A shared dinner for sober and sober-curious queers — no pressure, no explaining yourself, just a good table and people who get it. Content note: open talk about recovery and addiction. The room is full this month, but the waitlist moves; we\'ll be in touch the moment a seat opens.',
  },
  'queer-karaoke-night': {
    slug: 'queer-karaoke-night',
    type: 'Nightlife',
    day: '03',
    month: 'Jul',
    title: 'Queer Karaoke Night',
    hood: 'Bairro Alto',
    host: 'QueerPulse Nightlife',
    hostSlug: '',
    spots: '28 going',
    cta: 'RSVP',
    body: 'Bring a power ballad, a guilty pleasure, or just your loudest cheering voice. A warm, no-judgement night of queer karaoke at Purex in Bairro Alto — every voice welcome, every key forgiven. Songbook opens at 9. Stay for one number or close the place down.',
  },
  'queer-film-tangerine': {
    slug: 'queer-film-tangerine',
    type: 'Film Night',
    day: '02',
    month: 'Jul',
    title: 'Queer Film Night — “Tangerine”',
    hood: 'Avenida da Liberdade',
    host: 'QueerPulse Cinema',
    hostSlug: '',
    spots: '24 going · €6',
    cta: 'Reserve a seat',
    body: 'A big-screen evening with Sean Baker\'s “Tangerine” at Cinema São Jorge, followed by an unhurried conversation in the foyer. Content note: brief scenes of transphobic violence. Doors at 7:30, film at 8. Tickets are €6 on the door or in advance; no one turned away for lack of funds.',
  },
  'drag-brunch-tia-maria': {
    slug: 'drag-brunch-tia-maria',
    type: 'Brunch',
    day: '04',
    month: 'Jul',
    title: 'Drag Brunch with Tia Maria',
    hood: 'Santa Apolónia',
    host: 'QueerPulse Nightlife',
    hostSlug: '',
    spots: '32 going · pay what you can',
    cta: 'RSVP',
    body: 'Bottomless eggs, a riverside view, and Tia Maria holding court from noon. A loud, loving daytime drag brunch at Lux Frágil — pay what you can, tip if you\'re flush, dance if the spirit moves you. Step-free access and a safer-space policy in place.',
  },
  'queer-craft-market': {
    slug: 'queer-craft-market',
    type: 'Market',
    day: '04',
    month: 'Jul',
    title: 'Queer Craft Market',
    hood: 'Alcântara',
    host: 'QueerPulse Makers',
    hostSlug: '',
    spots: '40 going',
    cta: 'RSVP',
    body: 'Forty makers, one sunny courtyard at LX Factory — ceramics, zines, prints, jewellery, and a fair amount of impulse buying. Come meet the queer artists behind the work, swap notes, and find something made by hand. Step-free throughout; bring cash and a tote.',
  },
  'mutual-aid-groceries': {
    slug: 'mutual-aid-groceries',
    type: 'Mutual Aid',
    day: '11',
    month: 'Jul',
    title: 'Mutual Aid Circle — groceries run',
    hood: 'Anjos',
    host: 'Mutual Aid Lisbon',
    hostSlug: '',
    spots: '9 going',
    cta: 'RSVP',
    body: 'We pool what we have and sort it into bags for neighbours who asked this month — a couple of hours of easy, practical solidarity at Casa do Comum. No experience needed; we\'ll show you the ropes. Step-free venue, masks encouraged. Many hands make it quick.',
  },
  'poly-open-discussion': {
    slug: 'poly-open-discussion',
    type: 'Discussion Circle',
    day: '18',
    month: 'Jul',
    title: 'Poly & Open Relationships Discussion Circle',
    hood: 'Online',
    host: 'Sober Queers',
    hostSlug: '',
    spots: '7 going · online',
    cta: 'RSVP',
    body: 'A facilitated, gentle conversation about polyamory, open relationships, and everything that doesn\'t fit a tidy script. Co-hosted on Zoom, cameras optional, safer-space norms read at the top. Bring a question or just listen. The join link arrives the morning of.',
  },
  'newcomers-mixer-july': {
    slug: 'newcomers-mixer-july',
    type: 'Mixer',
    day: '20',
    month: 'Jul',
    title: 'Newcomers Mixer — July',
    hood: 'Mouraria',
    host: 'Newcomers',
    hostSlug: '',
    spots: '5 going so far',
    cta: 'RSVP',
    body: 'New to the city, new to the network, or just ready to meet some people — this one\'s for you. A low-key evening at A Tasca in Mouraria with a host who\'ll actually introduce you around. Step-free and sober-friendly. Arrive whenever; we\'ll be the warm table in the corner.',
  },
}

export const defaultGatheringSlug = 'supper-club-12'

// ── Gathering detail routing: /gathering/<slug>-<shortId> ──
// Canonical convention. The shortId stands in for a real per-event id and is
// derived deterministically from the slug so links stay stable.

/** Stable 5-char short id derived from a slug. */
export function gatheringShortId(slug: string): string {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0
  return h.toString(36).slice(0, 5).padStart(5, '0')
}

/** Canonical path for a gathering detail page. */
export function gatheringPath(slug: string): string {
  return `/gathering/${slug}-${gatheringShortId(slug)}`
}

/** Resolve a `:slug` route param (`<slug>-<shortId>`) back to a gathering. */
export function resolveGathering(param: string | undefined): GatheringDetail {
  if (param) {
    for (const slug of Object.keys(gatheringDetails)) {
      if (`${slug}-${gatheringShortId(slug)}` === param) return gatheringDetails[slug]
    }
    const base = param.replace(/-[a-z0-9]+$/i, '')
    if (gatheringDetails[base]) return gatheringDetails[base]
  }
  return gatheringDetails[defaultGatheringSlug]
}

/** Official QueerPulse event vs member/community-created gathering. */
export function gatheringKind(g: GatheringDetail): 'event' | 'gathering' {
  return g.host === 'QueerPulse' ? 'event' : 'gathering'
}

// ── Community calendar events (month is 0-indexed) ──
export interface CalendarEvent {
  date: Date
  org: string
  orgColor: string
  title: string
  hood: string
  time: string
  to: string
  /** Official QueerPulse event vs member/community-created gathering. */
  kind: 'event' | 'gathering'
}

const ACCENT = 'var(--accent)'
const JADE = 'var(--jade)'
const COMMUNITY = 'var(--violet)'
const PARTNER = 'rgba(45,27,61,.7)'

/** Org category colours shared between the calendar and the events list. */
export const orgColors = {
  queerpulse: ACCENT,
  ilga: JADE,
  community: COMMUNITY,
  partner: PARTNER,
}

export const calendarEvents: CalendarEvent[] = [
  { date: new Date(2026, 5, 6), org: 'QueerPulse', orgColor: ACCENT, title: 'Queer Supper Club №12', hood: 'Mouraria', time: '7:30pm', to: gatheringPath('supper-club-12'), kind: 'gathering' },
  { date: new Date(2026, 5, 10), org: 'Community', orgColor: COMMUNITY, title: 'Trans & NB Hub — Monthly Meetup', hood: 'Arroios', time: '6:30pm', to: gatheringPath('trans-hub-meetup'), kind: 'gathering' },
  { date: new Date(2026, 5, 12), org: 'QueerPulse', orgColor: ACCENT, title: 'Skills Exchange — Intro Session', hood: 'Príncipe Real', time: '6pm', to: gatheringPath('skills-exchange-intro'), kind: 'event' },
  { date: new Date(2026, 5, 14), org: 'QueerPulse', orgColor: ACCENT, title: 'Portfolio Night: Designers & Photogs', hood: 'Príncipe Real', time: '7pm', to: gatheringPath('portfolio-night'), kind: 'event' },
  { date: new Date(2026, 5, 17), org: 'QueerPulse', orgColor: ACCENT, title: 'Queer Parent Network — First Meetup', hood: 'Estrela', time: '10:30am', to: gatheringPath('queer-parent-network'), kind: 'event' },
  { date: new Date(2026, 5, 18), org: 'ILGA Portugal', orgColor: JADE, title: 'LGBTQ+ Support Circle', hood: 'Intendente', time: '6:30pm', to: '/event', kind: 'gathering' },
  { date: new Date(2026, 5, 20), org: 'Community', orgColor: COMMUNITY, title: 'Trans Mutual Aid Open Meeting', hood: 'Mouraria', time: '6pm', to: gatheringPath('trans-mutual-aid'), kind: 'gathering' },
  { date: new Date(2026, 5, 21), org: 'QueerPulse', orgColor: ACCENT, title: "Inside Beatriz's Ceramics Studio", hood: 'Graça', time: '3pm', to: gatheringPath('studio-visit'), kind: 'gathering' },
  { date: new Date(2026, 5, 24), org: 'Community', orgColor: COMMUNITY, title: 'Queer Elders — Monthly Social', hood: 'Chiado', time: '5pm', to: gatheringPath('queer-elders-social'), kind: 'gathering' },
  { date: new Date(2026, 5, 25), org: 'Community', orgColor: COMMUNITY, title: 'Queer Film Screening: Moonlight', hood: 'Príncipe Real', time: '8pm', to: '/event', kind: 'gathering' },
  { date: new Date(2026, 5, 26), org: 'QueerPulse', orgColor: ACCENT, title: 'Wellbeing Q&A — Therapist AMA', hood: 'Online', time: '7pm', to: gatheringPath('wellbeing-ama'), kind: 'event' },
  { date: new Date(2026, 5, 28), org: 'Community', orgColor: COMMUNITY, title: 'Queer Runners — End-of-Month Run', hood: 'Tejo path', time: '9am', to: gatheringPath('queer-runners-run'), kind: 'gathering' },
  { date: new Date(2026, 6, 2), org: 'QueerPulse', orgColor: ACCENT, title: 'Founders & Builders Breakfast', hood: 'Marvila', time: '8:30am', to: gatheringPath('founders-breakfast'), kind: 'event' },
  { date: new Date(2026, 6, 5), org: 'Community', orgColor: COMMUNITY, title: 'Queer Youth Network — First Gathering', hood: 'Arroios', time: '5pm', to: gatheringPath('queer-youth-gathering'), kind: 'gathering' },
  { date: new Date(2026, 6, 7), org: 'Rede ex aequo', orgColor: PARTNER, title: 'Rede Monthly Gathering', hood: 'Lisbon', time: '6pm', to: '/event', kind: 'gathering' },
  { date: new Date(2026, 6, 9), org: 'QueerPulse', orgColor: ACCENT, title: 'Disability & Access — Open Conversation', hood: 'Online', time: '6:30pm', to: gatheringPath('disability-access-talk'), kind: 'event' },
  { date: new Date(2026, 6, 11), org: 'ILGA Portugal', orgColor: JADE, title: 'Free Legal Clinic', hood: 'Intendente', time: '2pm', to: gatheringPath('legal-clinic'), kind: 'gathering' },
  { date: new Date(2026, 6, 14), org: 'Community', orgColor: COMMUNITY, title: 'Queer Choir Monthly Rehearsal', hood: 'Príncipe Real', time: '7pm', to: gatheringPath('queer-choir-rehearsal'), kind: 'gathering' },
  { date: new Date(2026, 6, 16), org: 'QueerPulse', orgColor: ACCENT, title: 'Resource Library Launch — Live Q&A', hood: 'Online', time: '7pm', to: gatheringPath('resource-library-launch'), kind: 'event' },
  { date: new Date(2026, 6, 19), org: 'Opus Diversus', orgColor: JADE, title: 'Peer Support Circle — Open Session', hood: 'Estrela', time: '6:30pm', to: '/event', kind: 'gathering' },
  { date: new Date(2026, 6, 22), org: 'QueerPulse', orgColor: ACCENT, title: 'Micro-Grants — Q3 Open Office Hours', hood: 'Online', time: '12pm', to: gatheringPath('micro-grants-office-hours'), kind: 'event' },
  { date: new Date(2026, 6, 26), org: 'Community', orgColor: COMMUNITY, title: 'Queer & of Colour — Monthly Gathering', hood: 'Intendente', time: '5:30pm', to: gatheringPath('queer-of-colour-gathering'), kind: 'gathering' },
]

export const calendarLegend = [
  { label: 'QueerPulse', color: ACCENT },
  { label: 'ILGA Portugal', color: JADE },
  { label: 'Community', color: COMMUNITY },
  { label: 'Partner orgs', color: 'rgba(247,243,238,.5)' },
]
