import type { Person } from './communityDetails'
import { POOL } from './communityDetails.data'
import type {
  CommunityEvent,
  CommunityResource,
  LivingCommunity,
  ModReport,
  ModRequest,
  Post,
  PulseMoment,
  Reaction,
  ReactionKey,
  RosterMember,
} from './community.model'

/* ----------------------------------------------------------------------------
 * Helpers — keep the data below readable.
 * ------------------------------------------------------------------------- */

const bySlug: Record<string, Person> = Object.fromEntries(POOL.map((p) => [p.slug!, p]))

/** Look up a pool member as a Person (falls back to a plain coral avatar). */
function P(slug: string): Person {
  return bySlug[slug] ?? { initials: '··', name: slug, tint: 'coral' }
}

/** Build a roster entry from a pool member + role/metadata. */
function R(
  slug: string,
  role: RosterMember['role'],
  extra: { pronouns?: string; hood?: string; verified?: boolean } = {},
): RosterMember {
  const person = P(slug)
  return { ...person, role, title: person.role, ...extra }
}

const IMG = 'https://images.unsplash.com'
function img(id: string): string {
  return `${IMG}/${id}?q=80&w=800&auto=format&fit=crop`
}

function rx(...pairs: [ReactionKey, number, boolean?][]): Reaction[] {
  return pairs.map(([key, count, reacted]) => ({ key, count, reacted }))
}

/* ----------------------------------------------------------------------------
 * queer-runners — public, active, events-heavy
 * ------------------------------------------------------------------------- */

const RUNNERS_ROSTER: RosterMember[] = [
  R('monica', 'owner', { pronouns: 'she/her', hood: 'Alvalade', verified: true }),
  R('carla', 'mod', { pronouns: 'she/her', hood: 'Arroios', verified: true }),
  R('diogo', 'mod', { pronouns: 'he/him', hood: 'Marvila' }),
  R('sofia', 'member', { pronouns: 'she/her', hood: 'Graça', verified: true }),
  R('tomas', 'member', { pronouns: 'he/him', hood: 'Mouraria' }),
  R('kai', 'member', { pronouns: 'they/them', hood: 'Anjos' }),
  R('nuno', 'member', { pronouns: 'he/him', hood: 'Benfica' }),
  R('rita', 'member', { pronouns: 'she/her', hood: 'Intendente' }),
  R('beatriz', 'member', { pronouns: 'she/her', hood: 'Graça' }),
]

const RUNNERS_PULSE: Post[] = [
  {
    id: 'run-p1',
    author: P('monica'),
    kind: 'announcement',
    pinned: true,
    body: "Sunday's route is locked: the 7 km Parque das Nações loop, flat and step-free the whole way — perfect if it's your first time out with us. We split into three pace groups at the start, nobody runs alone, and coffee after at the usual spot. Meet 7:50, we move at 8:00 sharp.",
    image: img('photo-1571008887538-b36bb32f4571'),
    reactions: rx(['heart', 24, true], ['celebrate', 11], ['fire', 6]),
    replies: [
      { author: P('kai'), text: "First-timer here — is 7 km doable if I've only ever done 5?", time: '3h' },
      { author: P('monica'), text: 'Completely. The slow group walks the hills and nobody minds. You finish with us.', time: '2h' },
    ],
    time: '5h',
    communitySlug: 'queer-runners',
  },
  {
    id: 'run-p2',
    author: P('sofia'),
    kind: 'post',
    body: "PB this morning and I genuinely cried at the finish. Eight months ago I couldn't run for the bus. This group did that.",
    image: img('photo-1452626038306-9aae5e071dd3'),
    reactions: rx(['celebrate', 31, true], ['heart', 19], ['fire', 8]),
    replies: [
      { author: P('carla'), text: 'YES Sofia. Watching you build this has been the best part of my year.', time: '1h' },
    ],
    time: '6h',
    communitySlug: 'queer-runners',
  },
  {
    id: 'run-p3',
    author: P('carla'),
    kind: 'post',
    body: 'The Alfama tiles are destroying my ankles again. What are people running in for the cobbles? Looking for something I can actually buy in Lisbon this week.',
    reactions: rx(['support', 9], ['heart', 4]),
    replies: [
      { author: P('diogo'), text: 'ASICS Gel-Kayano. Pricey but my feet forgave me. Sportzone in Colombo has them.', time: '4h' },
      { author: P('sofia'), text: 'Brooks Adrenaline. Saved my knees on the Graça hills.', time: '3h' },
    ],
    time: '1d',
    communitySlug: 'queer-runners',
  },
  {
    id: 'run-p4',
    author: P('diogo'),
    kind: 'post',
    body: 'Reminder that the post-run coffee is half the point. If running anxiety is the thing stopping you, come for the coffee and just walk the loop. Same table, same people.',
    reactions: rx(['heart', 16, true], ['support', 5]),
    replies: [],
    time: '1d',
    communitySlug: 'queer-runners',
  },
  {
    id: 'run-p5',
    author: P('rita'),
    kind: 'post',
    body: 'Made us a little club flag for the group shots. Bringing it Sunday — find me at the start line.',
    image: img('photo-1476480862126-209bfaa8edc8'),
    reactions: rx(['celebrate', 22], ['heart', 14, true]),
    replies: [
      { author: P('monica'), text: 'Rita this is so good. Putting it on the events page immediately.', time: '20h' },
    ],
    time: '2d',
    communitySlug: 'queer-runners',
  },
  {
    id: 'run-p6',
    author: P('nuno'),
    kind: 'post',
    body: 'Anyone training for the Lisbon half in October? Looking for a couple of people to do the long Saturday runs with so I stop talking myself out of them.',
    reactions: rx(['fire', 12], ['heart', 6]),
    replies: [
      { author: P('kai'), text: "I'm in. I need the accountability more than the training.", time: '18h' },
    ],
    time: '2d',
    communitySlug: 'queer-runners',
  },
]

const RUNNERS_MOMENTS: PulseMoment[] = [
  { id: 'run-m1', kind: 'joined', text: 'Kai joined the community', time: '3h' },
  { id: 'run-m2', kind: 'event', text: 'New gathering posted — Sunrise run, Parque das Nações', time: '1d' },
  { id: 'run-m3', kind: 'joined', text: 'Beatriz joined the community', time: '2d' },
]

const RUNNERS_EVENTS: CommunityEvent[] = [
  { id: 'run-e1', dd: '8', mm: 'Jun', title: 'Sunrise run — Parque das Nações', meta: 'Sunday · 8:00 · 7 km loop', spots: '9 spots remaining' },
  { id: 'run-e2', dd: '15', mm: 'Jun', title: 'Hill repeats + brunch', meta: 'Sunday · 8:00 · Monsanto', spots: 'open to all' },
  { id: 'run-e3', dd: '22', mm: 'Jun', title: 'Beginners-only 5 km', meta: 'Sunday · 9:00 · riverside flat', spots: 'beginners welcome' },
  { id: 'run-e4', dd: '1', mm: 'Jun', title: 'June Pride 10 km', meta: 'Sunday · 8:00 · finished', past: true, recapHref: '#' },
]

const RUNNERS_RESOURCES: CommunityResource[] = [
  { title: 'Pace-group guide (5K → half)', href: '#', kind: 'guide', note: 'Which group is yours, honestly' },
  { title: 'Step-free Lisbon routes map', href: '#', kind: 'doc', note: '12 loops, all verified accessible' },
  { title: 'Post-run coffee spots', href: '#', kind: 'link' },
  { title: 'What to bring your first time', href: '#', kind: 'guide' },
]

const RUNNERS_RULES = [
  'Every pace belongs. Nobody runs alone and nobody gets left.',
  'The slowest runner sets the warm-up. We regroup at every turn.',
  'No pace-shaming, no body-shaming, no "you should" about anyone\'s training.',
  'What gets shared on a run stays on the run.',
  'Coffee after is not optional (it is — but come anyway).',
]

/* ----------------------------------------------------------------------------
 * trans-hub — request-to-join, resources + safety heavy
 * ------------------------------------------------------------------------- */

const HUB_ROSTER: RosterMember[] = [
  R('catarina-vaz', 'owner', { pronouns: 'she/her', hood: 'Anjos', verified: true }),
  R('anika', 'mod', { pronouns: 'she/her', hood: 'Arroios', verified: true }),
  R('jonas', 'mod', { pronouns: 'he/him', hood: 'Intendente', verified: true }),
  R('rui', 'member', { pronouns: 'he/him', hood: 'Anjos', verified: true }),
  R('kai', 'member', { pronouns: 'they/them', hood: 'Anjos' }),
  R('rita', 'member', { pronouns: 'she/her', hood: 'Intendente' }),
  R('nuno', 'member', { pronouns: 'he/him', hood: 'Benfica' }),
  R('sofia-castano', 'member', { pronouns: 'she/her', hood: 'Marvila' }),
]

const HUB_PULSE: Post[] = [
  {
    id: 'hub-p1',
    author: P('anika'),
    kind: 'announcement',
    pinned: true,
    body: 'Hormone supply update: two pharmacies are short again this month. Farmácia do Carmo will hold stock if you call ahead, and there\'s an in-supply alternative formulation — full details in the pinned doc. Please don\'t ration without talking to a clinician first. If a shortage is being used to gatekeep your prescription, that is not on you — flag it here.',
    reactions: rx(['support', 28, true], ['heart', 12]),
    replies: [
      { author: P('jonas'), text: 'Confirming Farmácia do Carmo — Rui at the counter is excellent and never makes it weird.', time: '5h' },
      { author: P('rui'), text: 'And if you need the name-change paperwork walked through, I do it pro bono. DM me.', time: '4h' },
    ],
    time: '6h',
    communitySlug: 'trans-hub',
  },
  {
    id: 'hub-p2',
    author: P('catarina-vaz'),
    kind: 'post',
    body: 'The June vetted-clinician list is live: 47 names, all re-checked in the last 90 days, with notes on what each is good for. Two new endocrinology entries near Anjos. Corrections always welcome — this only works because we keep it honest together.',
    reactions: rx(['heart', 21, true], ['celebrate', 9]),
    replies: [
      { author: P('kai'), text: 'This list got me through my first appointment without the fifteen-minutes-of-explaining tax. Thank you.', time: '3h' },
    ],
    time: '1d',
    communitySlug: 'trans-hub',
  },
  {
    id: 'hub-p3',
    author: P('rui'),
    kind: 'post',
    body: 'Legal name-change workshop this Friday with ILGA legal. Bring your questions and, if you have them, your documents — we go through the actual forms together, line by line. 12 spots left.',
    reactions: rx(['celebrate', 17], ['heart', 8, true]),
    replies: [],
    time: '1d',
    communitySlug: 'trans-hub',
  },
  {
    id: 'hub-p4',
    author: P('jonas'),
    kind: 'post',
    body: 'Soft reminder that the open clinic night is a no-question-too-small space. Last time we covered everything from blood tests to how to ask a GP for a referral without it becoming a whole thing. Thursday, Café Beirão, drop-in.',
    image: img('photo-1488521787991-ed7bbaae773c'),
    reactions: rx(['heart', 19, true], ['support', 7]),
    replies: [
      { author: P('rita'), text: 'The first one I went to, I didn\'t say a word and still left lighter. Recommend even if you just listen.', time: '12h' },
    ],
    time: '2d',
    communitySlug: 'trans-hub',
  },
]

const HUB_MOMENTS: PulseMoment[] = [
  { id: 'hub-m1', kind: 'resource', text: 'Anika pinned a resource — Vetted clinician list (June)', time: '1d' },
  { id: 'hub-m2', kind: 'event', text: 'New gathering posted — Legal name-change workshop', time: '1d' },
  { id: 'hub-m3', kind: 'joined', text: 'A new member joined the Hub', time: '2d' },
]

const HUB_EVENTS: CommunityEvent[] = [
  { id: 'hub-e1', dd: '20', mm: 'Jun', title: 'Legal name-change workshop', meta: 'Friday · 18:30 · with ILGA legal', spots: '12 spots left' },
  { id: 'hub-e2', dd: '12', mm: 'Jun', title: 'Open clinic night — bring questions', meta: 'Thursday · 19:00 · Café Beirão', spots: 'drop-in' },
  { id: 'hub-e3', dd: '5', mm: 'Jun', title: 'Peer support circle', meta: 'Thursday · 19:00 · members only', past: true, recapHref: '#' },
]

const HUB_RESOURCES: CommunityResource[] = [
  { title: 'Vetted clinician list (June)', href: '#', kind: 'doc', note: '47 names, re-checked every 90 days' },
  { title: 'Hormone supply + alternatives guide', href: '#', kind: 'guide', note: 'What to do during a shortage' },
  { title: 'Legal name change — step by step', href: '#', kind: 'guide', note: 'Forms, costs, timelines' },
  { title: 'Healthcare rights one-pager', href: '#', kind: 'doc' },
  { title: 'ILGA Portugal legal helpline', href: '#', kind: 'link' },
  { title: 'Peer support — how it works', href: '#', kind: 'link' },
]

const HUB_RULES = [
  'Confidentiality is the first rule and the last. What\'s shared here stays here.',
  'No outing anyone — including yourself accidentally. Reduced visibility by default.',
  'Vetted means vetted: only add a provider you\'ve actually seen.',
  'Medical info is peer experience, not prescription. Always loop in a clinician.',
  'We assume good faith and protect each other\'s safety over comfort.',
]

/* ----------------------------------------------------------------------------
 * rainbow-arts — public, creative, image-rich
 * ------------------------------------------------------------------------- */

const ARTS_ROSTER: RosterMember[] = [
  R('luisa', 'owner', { pronouns: 'she/her', hood: 'Príncipe Real', verified: true }),
  R('rita', 'mod', { pronouns: 'she/her', hood: 'Intendente', verified: true }),
  R('beatriz', 'mod', { pronouns: 'she/her', hood: 'Graça' }),
  R('sofia-castano', 'member', { pronouns: 'she/her', hood: 'Marvila', verified: true }),
  R('sofia', 'member', { pronouns: 'she/her', hood: 'Graça' }),
  R('tomas', 'member', { pronouns: 'he/him', hood: 'Mouraria' }),
  R('kai', 'member', { pronouns: 'they/them', hood: 'Anjos' }),
  R('nuno', 'member', { pronouns: 'he/him', hood: 'Benfica' }),
]

const ARTS_PULSE: Post[] = [
  {
    id: 'art-p1',
    author: P('luisa'),
    kind: 'announcement',
    pinned: true,
    body: 'Open crit this Saturday — bring ONE work, finished or not. The rule stays the same: honest, kind, specific. We look at the work in front of us, not the CV behind it. 8 easels, 8 spots, coffee and a long table after.',
    image: img('photo-1513475382585-d06e58bcb0e0'),
    reactions: rx(['celebrate', 19, true], ['heart', 11], ['fire', 5]),
    replies: [
      { author: P('kai'), text: 'Bringing a half-finished risograph thing and I\'m terrified. See you there.', time: '4h' },
      { author: P('luisa'), text: 'Half-finished is exactly what a crit is for. That\'s the brave version.', time: '3h' },
    ],
    time: '7h',
    communitySlug: 'rainbow-arts',
  },
  {
    id: 'art-p2',
    author: P('rita'),
    kind: 'post',
    body: 'Group-buy update: six of us are in for the reconditioned two-colour riso. It lives at the atelier for collective use once it lands. If you want in on the last share, shout now.',
    image: img('photo-1561214115-f2f134cc4912'),
    reactions: rx(['fire', 24, true], ['celebrate', 13]),
    replies: [
      { author: P('beatriz'), text: 'In. I\'ll use it constantly for zine covers and help maintain it.', time: '2h' },
      { author: P('sofia-castano'), text: 'Yes — and I\'ll document the first print run for the collective\'s page.', time: '1h' },
    ],
    time: '9h',
    communitySlug: 'rainbow-arts',
  },
  {
    id: 'art-p3',
    author: P('beatriz'),
    kind: 'post',
    body: 'New glazes out of the kiln this week. The deep coral one took four tries and I almost gave up on it. Crit me hard on Saturday.',
    image: img('photo-1490578474895-699cd4e2cf59'),
    reactions: rx(['heart', 27, true], ['celebrate', 8]),
    replies: [
      { author: P('luisa'), text: 'That coral is going straight into the autumn show. No notes.', time: '5h' },
    ],
    time: '1d',
    communitySlug: 'rainbow-arts',
  },
  {
    id: 'art-p4',
    author: P('sofia-castano'),
    kind: 'post',
    body: 'Documented last month\'s group show before we struck it. Full set going up on the collective page — tag yourself, grab anything with your work in it.',
    image: img('photo-1452860606245-08befc0ff44b'),
    reactions: rx(['celebrate', 21], ['heart', 16, true]),
    replies: [],
    time: '1d',
    communitySlug: 'rainbow-arts',
  },
  {
    id: 'art-p5',
    author: P('kai'),
    kind: 'post',
    body: 'Does anyone have wall space they\'re not using? Looking to test-hang a small series before deciding the order, and my flat is too small to see them all at once.',
    reactions: rx(['support', 9], ['heart', 5]),
    replies: [
      { author: P('rita'), text: 'The atelier back wall is free most weekday afternoons. Keys are with me.', time: '20h' },
    ],
    time: '2d',
    communitySlug: 'rainbow-arts',
  },
  {
    id: 'art-p6',
    author: P('tomas'),
    kind: 'post',
    body: 'I cook, you crit. Proposing a supper-club-meets-crit night — I feed everyone, we look at work between courses. Who\'s in?',
    image: img('photo-1547891654-e66ed7ebb968'),
    reactions: rx(['fire', 18, true], ['celebrate', 14], ['heart', 7]),
    replies: [
      { author: P('luisa'), text: 'This is the best idea posted here all year. Let\'s do it next month.', time: '16h' },
    ],
    time: '3d',
    communitySlug: 'rainbow-arts',
  },
]

const ARTS_MOMENTS: PulseMoment[] = [
  { id: 'art-m1', kind: 'event', text: 'New gathering posted — Open crit, Atelier Pulso', time: '7h' },
  { id: 'art-m2', kind: 'joined', text: 'Nuno joined the collective', time: '1d' },
  { id: 'art-m3', kind: 'resource', text: 'Sofia Castaño pinned a resource — Group show photo set', time: '1d' },
]

const ARTS_EVENTS: CommunityEvent[] = [
  { id: 'art-e1', dd: '21', mm: 'Jun', title: 'Open crit — bring one work', meta: 'Saturday · 15:00 · Atelier Pulso', spots: '8 spots left' },
  { id: 'art-e2', dd: '28', mm: 'Jun', title: 'Riso print day (collective use)', meta: 'Saturday · 13:00 · Atelier Pulso', spots: 'sign up inside' },
  { id: 'art-e3', dd: '24', mm: 'May', title: 'Spring group show — "Soft Edges"', meta: 'borrowed space, Marvila', past: true, recapHref: '#' },
]

const ARTS_RESOURCES: CommunityResource[] = [
  { title: 'How our crits work', href: '#', kind: 'guide', note: 'Honest, kind, specific — in that order' },
  { title: 'Shared equipment + booking', href: '#', kind: 'doc', note: 'Riso, kiln, projector' },
  { title: 'Open-call & grant board', href: '#', kind: 'link' },
  { title: 'Group show photo archive', href: '#', kind: 'link' },
]

const ARTS_RULES = [
  'Crits are honest, kind, and specific. Vague praise helps no one.',
  'We critique the work, never the person.',
  'No gatekeeping by medium, stage, or institution. Practice is the only ticket.',
  'Shared equipment stays shared — book it, clean it, log it.',
  'Document generously, credit always.',
]

/* ----------------------------------------------------------------------------
 * Moderation seeds (mod-tools tab)
 * ------------------------------------------------------------------------- */

const HUB_REQUESTS: ModRequest[] = [
  { id: 'hub-r1', person: P('nuno'), note: 'Just moved to Lisbon, starting HRT next month and looking for peers who get it.', time: '2h' },
  { id: 'hub-r2', person: P('luisa'), note: 'Referred by Catarina. Happy to verify.', time: '1d' },
  { id: 'hub-r3', person: P('tomas'), time: '3d' },
]
const HUB_REPORTS: ModReport[] = [
  {
    id: 'hub-rep1',
    postExcerpt: 'You don\'t need a doctor, just order from this site, way cheaper and no questions…',
    author: { initials: '··', name: 'Removed account', tint: 'plum' },
    reason: 'Unsafe medical advice — bypasses clinician',
    reporter: P('jonas'),
    time: '5h',
  },
  {
    id: 'hub-rep2',
    postExcerpt: 'Can everyone share their full name and clinic so I can put together a list?',
    author: P('sofia-castano'),
    reason: 'Privacy — requesting identifying info in a safe space',
    reporter: P('rui'),
    time: '1d',
  },
]

const RUNNERS_REPORTS: ModReport[] = [
  {
    id: 'run-rep1',
    postExcerpt: 'Honestly if you can\'t keep a 5min/km pace maybe this isn\'t the group for you.',
    author: { initials: '··', name: 'A member', tint: 'coral' },
    reason: 'Pace-shaming — against rule 3',
    reporter: P('carla'),
    time: '6h',
  },
]

/* ----------------------------------------------------------------------------
 * Registry
 * ------------------------------------------------------------------------- */

export const LIVING: Record<string, LivingCommunity> = {
  'queer-runners': {
    slug: 'queer-runners',
    accessTier: 'public',
    rules: RUNNERS_RULES,
    resources: RUNNERS_RESOURCES,
    events: RUNNERS_EVENTS,
    roster: RUNNERS_ROSTER,
    pinned: RUNNERS_PULSE.filter((p) => p.pinned),
    pulse: RUNNERS_PULSE.filter((p) => !p.pinned),
    moments: RUNNERS_MOMENTS,
    stats: { members: 214, activeThisWeek: 63, postsThisWeek: 11 },
    reports: RUNNERS_REPORTS,
  },
  'trans-hub': {
    slug: 'trans-hub',
    accessTier: 'request',
    rules: HUB_RULES,
    resources: HUB_RESOURCES,
    events: HUB_EVENTS,
    roster: HUB_ROSTER,
    pinned: HUB_PULSE.filter((p) => p.pinned),
    pulse: HUB_PULSE.filter((p) => !p.pinned),
    moments: HUB_MOMENTS,
    stats: { members: 147, activeThisWeek: 41, postsThisWeek: 7 },
    joinRequests: HUB_REQUESTS,
    reports: HUB_REPORTS,
  },
  'rainbow-arts': {
    slug: 'rainbow-arts',
    accessTier: 'public',
    rules: ARTS_RULES,
    resources: ARTS_RESOURCES,
    events: ARTS_EVENTS,
    roster: ARTS_ROSTER,
    pinned: ARTS_PULSE.filter((p) => p.pinned),
    pulse: ARTS_PULSE.filter((p) => !p.pinned),
    moments: ARTS_MOMENTS,
    stats: { members: 128, activeThisWeek: 37, postsThisWeek: 9 },
  },
}

export function getLiving(slug?: string): LivingCommunity | undefined {
  return slug ? LIVING[slug] : undefined
}
