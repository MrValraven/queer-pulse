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
  { title: 'Pace-group guide (5K → half)', href: '/resources/running-guide', kind: 'guide', note: 'Which group is yours, honestly' },
  { title: 'Step-free Lisbon routes map', href: '/resources/accessible-lisbon', kind: 'doc', note: '12 loops, all verified accessible' },
  { title: 'Post-run coffee spots', href: '/gatherings', kind: 'link' },
  { title: 'What to bring your first time', href: '/resources/running-guide', kind: 'guide' },
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
  { title: 'Vetted clinician list (June)', href: '/resources/trans-healthcare', kind: 'doc', note: '47 names, re-checked every 90 days' },
  { title: 'Hormone supply + alternatives guide', href: '/resources/trans-healthcare', kind: 'guide', note: 'What to do during a shortage' },
  { title: 'Legal name change — step by step', href: '/resources/legal', kind: 'guide', note: 'Forms, costs, timelines' },
  { title: 'Healthcare rights one-pager', href: '/resources/trans-healthcare', kind: 'doc' },
  { title: 'ILGA Portugal legal helpline', href: 'https://ilga-portugal.pt', kind: 'link' },
  { title: 'Peer support — how it works', href: '/resources/peer-support', kind: 'link' },
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
  { title: 'How our crits work', href: '/resources/art-crit-guide', kind: 'guide', note: 'Honest, kind, specific — in that order' },
  { title: 'Shared equipment + booking', href: '/resources/shared-equipment', kind: 'doc', note: 'Riso, kiln, projector' },
  { title: 'Open-call & grant board', href: '/resources/micro-grants', kind: 'link' },
  { title: 'Group show photo archive', href: '/resources/group-show-archive', kind: 'link' },
]

const ARTS_RULES = [
  'Crits are honest, kind, and specific. Vague praise helps no one.',
  'We critique the work, never the person.',
  'No gatekeeping by medium, stage, or institution. Practice is the only ticket.',
  'Shared equipment stays shared — book it, clean it, log it.',
  'Document generously, credit always.',
]

/* ----------------------------------------------------------------------------
 * queer-social — public, monthly meetups, low-key social
 * ------------------------------------------------------------------------- */

const SOCIAL_ROSTER: RosterMember[] = [
  R('tomas', 'owner', { pronouns: 'he/him', hood: 'Mouraria', verified: true }),
  R('sofia', 'mod', { pronouns: 'she/her', hood: 'Graça', verified: true }),
  R('carla', 'mod', { pronouns: 'she/her', hood: 'Arroios' }),
  R('kai', 'member', { pronouns: 'they/them', hood: 'Anjos' }),
  R('nuno', 'member', { pronouns: 'he/him', hood: 'Benfica' }),
  R('rita', 'member', { pronouns: 'she/her', hood: 'Intendente' }),
  R('luisa', 'member', { pronouns: 'she/her', hood: 'Príncipe Real' }),
  R('beatriz', 'member', { pronouns: 'she/her', hood: 'Graça', verified: true }),
]

const SOCIAL_PULSE: Post[] = [
  {
    id: 'soc-p1',
    author: P('tomas'),
    kind: 'announcement',
    pinned: true,
    body: "June is the Park rooftop — Thursday the 19th, 19:00. Step-free from the east lift, space to move and corners to retreat to, and the sunset is worth showing up for. No dress code, no agenda. Bring someone new if you want; come alone if you want. I'll be at the lift at 18:50.",
    reactions: rx(['heart', 31, true], ['celebrate', 18], ['fire', 7]),
    replies: [
      { author: P('carla'), text: 'Step-free confirmed — I checked last week. Lift is at the east entrance on Rua Castilho.', time: '5h' },
      { author: P('kai'), text: 'First-timer here — will there be a way to spot the group?', time: '4h' },
      { author: P('tomas'), text: 'I\'ll be in a plum scarf at the lift at 18:50, then we move up together.', time: '3h' },
    ],
    time: '6h',
    communitySlug: 'queer-social',
  },
  {
    id: 'soc-p2',
    author: P('sofia'),
    kind: 'post',
    body: "Six months in Lisbon and I've met more people I actually like through this group than anywhere else. Told a friend who just moved here about it. Thought you should know that what you've built matters.",
    reactions: rx(['heart', 44, true], ['celebrate', 21]),
    replies: [
      { author: P('tomas'), text: 'This is exactly why we do it. Thank you, genuinely.', time: '3h' },
    ],
    time: '1d',
    communitySlug: 'queer-social',
  },
  {
    id: 'soc-p3',
    author: P('carla'),
    kind: 'post',
    body: "Can we build a list of quieter venue options? Looking for somewhere low-noise, mostly seated, and central. Some of us find loud spaces hard to work with for more than an hour and I'd love options that aren't the rooftop when the weather goes wrong.",
    reactions: rx(['support', 19, true], ['heart', 8]),
    replies: [
      { author: P('luisa'), text: 'Arquivo in Príncipe Real — library-café, genuinely quiet and beautiful.', time: '7h' },
      { author: P('nuno'), text: 'Adding Heim in Arroios. Seated, low music, good coffee.', time: '6h' },
    ],
    time: '2d',
    communitySlug: 'queer-social',
  },
  {
    id: 'soc-p4',
    author: P('kai'),
    kind: 'post',
    body: "First meetup last month. Came alone, left with three people's numbers and plans to go to a gallery. I was so nervous I almost turned around at the door. Glad I didn't.",
    reactions: rx(['celebrate', 37], ['heart', 26, true], ['fire', 4]),
    replies: [
      { author: P('beatriz'), text: 'I almost turned around at my first one too. Now I help set up. It gets easy.', time: '20h' },
    ],
    time: '3d',
    communitySlug: 'queer-social',
  },
  {
    id: 'soc-p5',
    author: P('nuno'),
    kind: 'post',
    body: "The book swap table at the last meetup went down really well. Proposing we make it a regular thing — a small pile on the table each time. Gives first-timers something to do with their hands for the first ten minutes, which helps.",
    reactions: rx(['heart', 22], ['celebrate', 11, true]),
    replies: [
      { author: P('rita'), text: 'Brought three last time, took one home. Perfect format.', time: '15h' },
    ],
    time: '4d',
    communitySlug: 'queer-social',
  },
]

const SOCIAL_MOMENTS: PulseMoment[] = [
  { id: 'soc-m1', kind: 'joined', text: 'Kai joined the group', time: '4h' },
  { id: 'soc-m2', kind: 'event', text: 'New gathering posted — June meetup, Park rooftop', time: '6h' },
  { id: 'soc-m3', kind: 'joined', text: 'Luísa joined the group', time: '2d' },
]

const SOCIAL_EVENTS: CommunityEvent[] = [
  { id: 'soc-e1', dd: '19', mm: 'Jun', title: 'June meetup — Park rooftop', meta: 'Thursday · 19:00 · Bairro Alto', spots: 'open to all' },
  { id: 'soc-e2', dd: '17', mm: 'Jul', title: 'July meetup — Jardim da Estrela', meta: 'Thursday · 18:30 · open air', spots: 'open to all' },
  { id: 'soc-e3', dd: '18', mm: 'May', title: 'May meetup — Graça terrace', meta: 'Thursday · 19:00', past: true, recapHref: '#' },
]

const SOCIAL_RESOURCES: CommunityResource[] = [
  { title: 'Getting the most from your first meetup', href: '/resources/first-meetup-guide', kind: 'guide', note: 'No agenda, no pressure — here\'s what to expect' },
  { title: 'Past venues map', href: '/gatherings', kind: 'link' },
  { title: 'Community values — what "no agenda" means', href: '/resources/first-meetup-guide', kind: 'doc' },
  { title: 'Suggest a venue', href: '/gatherings', kind: 'link', note: 'Step-free and quiet options especially welcome' },
]

const SOCIAL_RULES = [
  'No agenda, no pitch, no "so what do you do?" — just show up.',
  'You don\'t need to be out, or out in any particular way, to be here.',
  'Ask before taking photos — always, of everyone.',
  'Look after first-timers; we were all one once.',
  'What\'s shared in person stays in person.',
]

/* ----------------------------------------------------------------------------
 * trans-mutual-aid — public, peer support, practical
 * ------------------------------------------------------------------------- */

const AID_ROSTER: RosterMember[] = [
  R('anika', 'owner', { pronouns: 'she/her', hood: 'Arroios', verified: true }),
  R('jonas', 'mod', { pronouns: 'he/him', hood: 'Intendente', verified: true }),
  R('rui', 'mod', { pronouns: 'he/him', hood: 'Anjos', verified: true }),
  R('kai', 'member', { pronouns: 'they/them', hood: 'Anjos' }),
  R('fatima', 'member', { pronouns: 'she/her', hood: 'Mouraria' }),
  R('monica', 'member', { pronouns: 'she/her', hood: 'Alvalade', verified: true }),
  R('catarina-vaz', 'member', { pronouns: 'she/her', hood: 'Anjos', verified: true }),
]

const AID_PULSE: Post[] = [
  {
    id: 'aid-p1',
    author: P('anika'),
    kind: 'announcement',
    pinned: true,
    body: "Updated resource board is live: clinician list refreshed (49 names now), two new pharmacies on the supply map, and a new section on navigating insurance paperwork. Everything is peer-maintained — if you see something wrong or missing, flag it here. This only works because we all keep it honest.",
    reactions: rx(['support', 34, true], ['heart', 17], ['celebrate', 8]),
    replies: [
      { author: P('jonas'), text: 'Added Dr. Marta Fonseca to the endocrinology section — she\'s new to Lisbon and genuinely good.', time: '4h' },
      { author: P('rui'), text: 'The insurance section was long overdue. Thank you, Anika.', time: '3h' },
    ],
    time: '5h',
    communitySlug: 'trans-mutual-aid',
  },
  {
    id: 'aid-p2',
    author: P('jonas'),
    kind: 'post',
    body: "Open clinic night this Thursday — bring any question, no question is too basic. Last time we covered blood tests, GP referrals, and how to ask for a letter without it becoming an appointment about your identity. Drop-in from 19:00 at Café Beirão.",
    reactions: rx(['heart', 21], ['celebrate', 12, true]),
    replies: [
      { author: P('kai'), text: 'Coming for the first time. Thank you for making it genuinely drop-in.', time: '6h' },
    ],
    time: '1d',
    communitySlug: 'trans-mutual-aid',
  },
  {
    id: 'aid-p3',
    author: P('rui'),
    kind: 'post',
    body: "Name-change clinic Friday with ILGA Portugal legal — we go through the actual forms together. Twelve spots left. If you've been putting it off because the paperwork feels impossible, this is the session for you. We do it line by line.",
    reactions: rx(['celebrate', 16, true], ['heart', 9]),
    replies: [],
    time: '1d',
    communitySlug: 'trans-mutual-aid',
  },
  {
    id: 'aid-p4',
    author: P('kai'),
    kind: 'post',
    body: "The spare-room board got me my flat. Wanted to say it out loud because when I posted there six months ago I wasn't sure anything would come of it. If you need safe housing, post there — the network is real.",
    reactions: rx(['heart', 28, true], ['celebrate', 14], ['support', 6]),
    replies: [
      { author: P('anika'), text: 'This is everything the board is for. So glad it worked.', time: '10h' },
    ],
    time: '3d',
    communitySlug: 'trans-mutual-aid',
  },
]

const AID_MOMENTS: PulseMoment[] = [
  { id: 'aid-m1', kind: 'resource', text: 'Anika updated the resource board — clinician list June refresh', time: '5h' },
  { id: 'aid-m2', kind: 'event', text: 'New gathering posted — name-change clinic with ILGA', time: '1d' },
  { id: 'aid-m3', kind: 'joined', text: 'A new member joined the network', time: '2d' },
]

const AID_EVENTS: CommunityEvent[] = [
  { id: 'aid-e1', dd: '13', mm: 'Jun', title: 'Open clinic night — bring any question', meta: 'Thursday · 19:00 · Café Beirão', spots: 'drop-in' },
  { id: 'aid-e2', dd: '20', mm: 'Jun', title: 'Name-change clinic with ILGA Portugal', meta: 'Friday · 18:30 · ILGA office', spots: '12 spots left' },
  { id: 'aid-e3', dd: '6', mm: 'Jun', title: 'Peer exchange — navigating healthcare', meta: 'Thursday · 19:00 · Café Beirão', past: true, recapHref: '#' },
]

const AID_RESOURCES: CommunityResource[] = [
  { title: 'Vetted clinician list (June)', href: '/resources/trans-healthcare', kind: 'doc', note: '49 names, peer-maintained, re-checked every 90 days' },
  { title: 'Hormone supply + pharmacy map', href: '/resources/trans-healthcare', kind: 'guide', note: 'What to do when stock is short' },
  { title: 'Legal name change — step by step', href: '/resources/legal', kind: 'guide', note: 'Forms, costs, and timelines in Portugal' },
  { title: 'Spare-room board', href: '/work/flatmates', kind: 'link', note: 'Safe housing, queer-friendly' },
  { title: 'ILGA Portugal helpline', href: 'https://ilga-portugal.pt', kind: 'link' },
]

const AID_RULES = [
  'What\'s shared here stays here — confidentiality is the first rule.',
  'This is peer experience, not medical advice. Always loop in a clinician for health decisions.',
  'Mutual means reciprocal: give what you can, take what you need, no ledger kept.',
  'No outing anyone — including yourself accidentally. Reduced visibility by default.',
  'Practical help is valued as much as emotional support; both are needed.',
]

/* ----------------------------------------------------------------------------
 * queer-parents — public, family-friendly, fortnightly
 * ------------------------------------------------------------------------- */

const PARENTS_ROSTER: RosterMember[] = [
  R('fatima', 'owner', { pronouns: 'she/her', hood: 'Mouraria', verified: true }),
  R('carla', 'mod', { pronouns: 'she/her', hood: 'Arroios', verified: true }),
  R('beatriz', 'mod', { pronouns: 'she/her', hood: 'Graça' }),
  R('sofia', 'member', { pronouns: 'she/her', hood: 'Graça', verified: true }),
  R('tomas', 'member', { pronouns: 'he/him', hood: 'Mouraria' }),
  R('nuno', 'member', { pronouns: 'he/him', hood: 'Benfica' }),
  R('monica', 'member', { pronouns: 'she/her', hood: 'Alvalade' }),
  R('rita', 'member', { pronouns: 'she/her', hood: 'Intendente' }),
]

const PARENTS_PULSE: Post[] = [
  {
    id: 'par-p1',
    author: P('fatima'),
    kind: 'announcement',
    pinned: true,
    body: "Jardim da Estrela family picnic this Sunday — bring blankets, kids, and whatever you like to eat. We've got a patch reserved near the fountain. No programme, no itinerary; the kids run and the grown-ups finally get to talk for a bit. All family structures, all ages, all welcome.",
    reactions: rx(['heart', 29, true], ['celebrate', 16], ['fire', 4]),
    replies: [
      { author: P('carla'), text: 'We\'ll be there — ours are 4 and 7, happy to help tire out any other kids in range.', time: '6h' },
      { author: P('tomas'), text: 'Bringing a lot of food. Please nobody else bring food, I always overcook.', time: '5h' },
    ],
    time: '8h',
    communitySlug: 'queer-parents',
  },
  {
    id: 'par-p2',
    author: P('carla'),
    kind: 'post',
    body: "Looking for a paediatrician in central Lisbon who won't blink at two mums on the intake form and talks to both of us equally. Ours just retired. Anyone have someone they genuinely trust?",
    reactions: rx(['support', 23, true], ['heart', 11]),
    replies: [
      { author: P('fatima'), text: 'Dr. Sousa in Arroios — both my kids see her, she\'s brilliant and matter-of-fact about it.', time: '5h' },
      { author: P('monica'), text: 'Dr. Alves in Santos — a bit further but worth it. Very good with anxious kids too.', time: '3h' },
    ],
    time: '2d',
    communitySlug: 'queer-parents',
  },
  {
    id: 'par-p3',
    author: P('sofia'),
    kind: 'post',
    body: "I've been making a short documentary about queer families in Lisbon and I'd love to talk to anyone willing to share their story — no faces required, voice-only is fine. The stories that never get told are the ones I want.",
    reactions: rx(['heart', 18], ['celebrate', 9, true]),
    replies: [
      { author: P('beatriz'), text: 'DM me. Our adoption story is unusual and worth telling.', time: '20h' },
    ],
    time: '3d',
    communitySlug: 'queer-parents',
  },
  {
    id: 'par-p4',
    author: P('nuno'),
    kind: 'post',
    body: "My kid starts school in September. The intake form has two 'parent' fields, no gender specified. Asked the school about using both our names everywhere and they said yes without hesitation. Small thing but wanted to mark it.",
    reactions: rx(['celebrate', 31, true], ['heart', 22], ['fire', 6]),
    replies: [
      { author: P('fatima'), text: 'This is genuinely the update I need to hear. Which school?', time: '12h' },
    ],
    time: '4d',
    communitySlug: 'queer-parents',
  },
]

const PARENTS_MOMENTS: PulseMoment[] = [
  { id: 'par-m1', kind: 'event', text: 'New gathering posted — family picnic, Jardim da Estrela', time: '8h' },
  { id: 'par-m2', kind: 'joined', text: 'Rita joined the network', time: '2d' },
  { id: 'par-m3', kind: 'resource', text: 'Fátima pinned — queer-friendly paediatricians list', time: '3d' },
]

const PARENTS_EVENTS: CommunityEvent[] = [
  { id: 'par-e1', dd: '15', mm: 'Jun', title: 'Family picnic — Jardim da Estrela', meta: 'Sunday · 11:00 · bring a blanket', spots: 'all families welcome' },
  { id: 'par-e2', dd: '29', mm: 'Jun', title: 'Parents coffee — no kids required', meta: 'Sunday · 10:30 · central café', spots: 'open to all' },
  { id: 'par-e3', dd: '4', mm: 'May', title: 'Spring playdate — Parque Eduardo VII', meta: 'Sunday · 11:00', past: true, recapHref: '#' },
]

const PARENTS_RESOURCES: CommunityResource[] = [
  { title: 'Queer-friendly paediatricians in Lisbon', href: '/resources/queer-paediatricians', kind: 'doc', note: 'Peer-verified, updated regularly' },
  { title: 'School intake forms — navigating the fields', href: '/resources/school-forms-guide', kind: 'guide', note: 'What to ask, what to expect' },
  { title: 'Adoption and co-parenting legal guide', href: '/resources/legal', kind: 'link' },
  { title: 'Family-friendly venues — step-free and good for kids', href: '/resources/accessible-lisbon', kind: 'link' },
]

const PARENTS_RULES = [
  'Kids are welcome at in-person gatherings unless specifically noted otherwise.',
  'Different family structures are all valid here — none need explaining or defending.',
  'Medical experiences: share your story, not prescriptions for other families.',
  'What\'s shared in the network stays in the network.',
  'We look after the grown-ups too, not just the children.',
]

/* ----------------------------------------------------------------------------
 * coming-out — private, low-visibility, weekly
 * ------------------------------------------------------------------------- */

const COMINGOUT_ROSTER: RosterMember[] = [
  R('catarina-vaz', 'owner', { pronouns: 'she/her', hood: 'Anjos', verified: true }),
  R('jonas', 'mod', { pronouns: 'he/him', hood: 'Intendente', verified: true }),
  R('kai', 'member', { pronouns: 'they/them', hood: 'Anjos' }),
  R('nuno', 'member', { pronouns: 'he/him', hood: 'Benfica' }),
  R('sofia', 'member', { pronouns: 'she/her', hood: 'Graça' }),
]

const COMINGOUT_PULSE: Post[] = [
  {
    id: 'cout-p1',
    author: P('catarina-vaz'),
    kind: 'announcement',
    pinned: true,
    body: "Wednesday check-in circle is open — 19:00, members only. If you're here and haven't said anything yet, that's fine. Being here is already something. The only rule for tonight: you don't owe anyone a full story.",
    reactions: rx(['support', 19, true], ['heart', 14]),
    replies: [
      { author: P('jonas'), text: 'If anyone wants to talk one-on-one before or after, I\'m here. DM open.', time: '3h' },
    ],
    time: '4h',
    communitySlug: 'coming-out',
  },
  {
    id: 'cout-p2',
    author: { initials: '··', name: 'A member', tint: 'plum' },
    kind: 'post',
    body: "Told my sister last weekend. It went better than I let myself imagine. She cried and then said she'd known for years and had been waiting for me to be ready. I don't have words for how that feels except: thank you for helping me get there.",
    reactions: rx(['heart', 38, true], ['celebrate', 24], ['support', 11]),
    replies: [
      { author: P('catarina-vaz'), text: 'You did it. This is yours.', time: '2h' },
      { author: P('jonas'), text: 'Rooting for you was easy. Thank you for coming back to tell us.', time: '1h' },
    ],
    time: '2d',
    communitySlug: 'coming-out',
  },
  {
    id: 'cout-p3',
    author: P('jonas'),
    kind: 'post',
    body: "Reminder that this space has reduced visibility by default — nothing here appears on your public profile, and the member list is not shown to other members unless you choose to connect. You control what's visible, always.",
    reactions: rx(['support', 16, true], ['heart', 7]),
    replies: [],
    time: '5d',
    communitySlug: 'coming-out',
  },
]

const COMINGOUT_MOMENTS: PulseMoment[] = [
  { id: 'cout-m1', kind: 'joined', text: 'A new member joined the space', time: '1d' },
  { id: 'cout-m2', kind: 'event', text: 'Weekly check-in circle — Wednesday 19:00', time: '2d' },
  { id: 'cout-m3', kind: 'joined', text: 'A new member joined the space', time: '4d' },
]

const COMINGOUT_EVENTS: CommunityEvent[] = [
  { id: 'cout-e1', dd: '18', mm: 'Jun', title: 'Weekly check-in circle', meta: 'Wednesday · 19:00 · members only', spots: 'private' },
  { id: 'cout-e2', dd: '25', mm: 'Jun', title: 'Weekly check-in circle', meta: 'Wednesday · 19:00 · members only', spots: 'private' },
  { id: 'cout-e3', dd: '11', mm: 'Jun', title: 'Weekly check-in circle', meta: 'Wednesday · 19:00', past: true, recapHref: '#' },
]

const COMINGOUT_RESOURCES: CommunityResource[] = [
  { title: 'How this space works — privacy and visibility', href: '/resources/community-privacy', kind: 'guide', note: 'What is and isn\'t visible from your profile' },
  { title: 'Coming out at work — a guide', href: '/resources/coming-out-at-work', kind: 'guide' },
  { title: 'Mental health support in Portugal', href: '/resources/mental-health', kind: 'link' },
  { title: 'ILGA Portugal helpline', href: 'https://ilga-portugal.pt', kind: 'link' },
]

const COMINGOUT_RULES = [
  'Confidentiality is the first rule and the last. What\'s shared here stays here.',
  'No pressure to share anything, ever. Presence is enough.',
  'No outing anyone — not here, not outside. This is absolute.',
  'We don\'t give advice unless it\'s asked for.',
  'Nothing here appears on your public profile. Reduced visibility by default.',
]

/* ----------------------------------------------------------------------------
 * queer-elders — public, 50+, monthly daytime
 * ------------------------------------------------------------------------- */

const ELDERS_ROSTER: RosterMember[] = [
  R('rui', 'owner', { pronouns: 'he/him', hood: 'Anjos', verified: true }),
  R('catarina-vaz', 'mod', { pronouns: 'she/her', hood: 'Anjos', verified: true }),
  R('luisa', 'mod', { pronouns: 'she/her', hood: 'Príncipe Real' }),
  R('monica', 'member', { pronouns: 'she/her', hood: 'Alvalade', verified: true }),
  R('sofia', 'member', { pronouns: 'she/her', hood: 'Graça' }),
  R('nuno', 'member', { pronouns: 'he/him', hood: 'Benfica' }),
  R('beatriz', 'member', { pronouns: 'she/her', hood: 'Graça' }),
  R('jonas', 'member', { pronouns: 'he/him', hood: 'Intendente' }),
]

const ELDERS_PULSE: Post[] = [
  {
    id: 'eld-p1',
    author: P('rui'),
    kind: 'announcement',
    pinned: true,
    body: "Long lunch at Cervejaria Trindade, Wednesday the 18th, 13:00 — accessible via the Chiado entrance, all seating, excellent acoustics for a group this size. Table booked in the back room. We usually run until mid-afternoon. No agenda; the conversation always finds its own way.",
    reactions: rx(['heart', 26, true], ['celebrate', 14]),
    replies: [
      { author: P('catarina-vaz'), text: 'The back room is much quieter — good call, Rui.', time: '6h' },
      { author: P('monica'), text: 'Looking forward to it. Bringing the archive print-outs I mentioned last time.', time: '4h' },
    ],
    time: '8h',
    communitySlug: 'queer-elders',
  },
  {
    id: 'eld-p2',
    author: P('catarina-vaz'),
    kind: 'post',
    body: "The oral history project has its first four recordings confirmed — Sofia is doing the interviews and they're going to be extraordinary. If you haven't said yes yet and want to, there are still slots. Your story doesn't have to be dramatic to be worth keeping.",
    reactions: rx(['heart', 22, true], ['celebrate', 11]),
    replies: [
      { author: P('sofia'), text: 'These first sessions have been remarkable. History walks in the room and sits down.', time: '5h' },
    ],
    time: '2d',
    communitySlug: 'queer-elders',
  },
  {
    id: 'eld-p3',
    author: P('sofia'),
    kind: 'post',
    body: "Thank you to everyone who spoke with me so far. I wasn't prepared for how much this would move me. I'm treating each recording with everything I have. The documentary will take time — but it will be honest.",
    reactions: rx(['heart', 33], ['celebrate', 17, true], ['support', 8]),
    replies: [
      { author: P('rui'), text: 'We trust you with it completely.', time: '3h' },
    ],
    time: '3d',
    communitySlug: 'queer-elders',
  },
  {
    id: 'eld-p4',
    author: P('monica'),
    kind: 'post',
    body: "Flagging: there's a new guide on aging and healthcare specifically for LGBTQ+ people over 50, just translated into Portuguese. Useful for navigating GPs who don't know what questions to ask. Pinning in the resources tab.",
    reactions: rx(['support', 19, true], ['heart', 9]),
    replies: [],
    time: '5d',
    communitySlug: 'queer-elders',
  },
]

const ELDERS_MOMENTS: PulseMoment[] = [
  { id: 'eld-m1', kind: 'event', text: 'New gathering posted — long lunch, Cervejaria Trindade', time: '8h' },
  { id: 'eld-m2', kind: 'resource', text: 'Mónica pinned — LGBTQ+ aging and healthcare guide (PT)', time: '5d' },
  { id: 'eld-m3', kind: 'joined', text: 'A new member joined the group', time: '1w' },
]

const ELDERS_EVENTS: CommunityEvent[] = [
  { id: 'eld-e1', dd: '18', mm: 'Jun', title: 'Long lunch — Cervejaria Trindade', meta: 'Wednesday · 13:00 · accessible, Chiado', spots: '10 seats' },
  { id: 'eld-e2', dd: '16', mm: 'Jul', title: 'Oral history recording session', meta: 'Wednesday · 14:00 · by invitation', spots: 'private' },
  { id: 'eld-e3', dd: '21', mm: 'May', title: 'Spring tea — Pátio da Galé', meta: 'Wednesday · 15:00', past: true, recapHref: '#' },
]

const ELDERS_RESOURCES: CommunityResource[] = [
  { title: 'LGBTQ+ aging and healthcare guide (PT)', href: '/resources/lgbtq-aging-guide', kind: 'doc', note: 'Just translated into Portuguese' },
  { title: 'Oral history project — how to participate', href: '/resources/oral-history-project', kind: 'guide' },
  { title: 'Accessible venues in Lisbon', href: '/resources/accessible-lisbon', kind: 'link', note: 'Peer-verified by the group' },
  { title: 'ILGA Portugal — elder services', href: 'https://ilga-portugal.pt', kind: 'link' },
]

const ELDERS_RULES = [
  'We start from respect — for histories, choices, and years lived differently from our own.',
  'We don\'t ask anyone to represent a past they didn\'t all share.',
  'Medical experiences: peer wisdom only. Always loop in a clinician for health decisions.',
  'Accessibility: if you need something, ask — it will be arranged without fuss.',
  'No tech required to participate. We figure things out together.',
]

/* ----------------------------------------------------------------------------
 * queer-youth — public, 18–25, weekly evenings
 * ------------------------------------------------------------------------- */

const YOUTH_ROSTER: RosterMember[] = [
  R('rita', 'owner', { pronouns: 'she/her', hood: 'Intendente', verified: true }),
  R('nuno', 'mod', { pronouns: 'he/him', hood: 'Marvila', verified: true }),
  R('kai', 'mod', { pronouns: 'they/them', hood: 'Anjos' }),
  R('sofia-castano', 'member', { pronouns: 'she/her', hood: 'Marvila', verified: true }),
  R('beatriz', 'member', { pronouns: 'she/her', hood: 'Graça' }),
  R('luisa', 'member', { pronouns: 'she/her', hood: 'Príncipe Real' }),
  R('diogo', 'member', { pronouns: 'he/him', hood: 'Mouraria' }),
  R('tomas', 'member', { pronouns: 'he/him', hood: 'Mouraria' }),
]

const YOUTH_PULSE: Post[] = [
  {
    id: 'yth-p1',
    author: P('rita'),
    kind: 'announcement',
    pinned: true,
    body: "CVs and first-jobs clinic this Friday — bring your laptop and whatever draft you've got, even if it's a mess. Nuno and I will go through them with you, and there'll be people who've done the hiring as well as people who've just survived the interview. 15 spots, no experience required.",
    reactions: rx(['celebrate', 26, true], ['heart', 18], ['fire', 9]),
    replies: [
      { author: P('nuno'), text: 'I\'ll be there early to set up. Bring your laptop and anything you\'ve written so far.', time: '5h' },
      { author: P('kai'), text: 'Can I bring a freelance portfolio question or is this more 9–5 focused?', time: '4h' },
      { author: P('rita'), text: 'Both — we\'ve got creatives and people in traditional roles. Bring whatever you have.', time: '3h' },
    ],
    time: '6h',
    communitySlug: 'queer-youth',
  },
  {
    id: 'yth-p2',
    author: P('nuno'),
    kind: 'post',
    body: "Dropping three junior opportunities this week: one product role at a Lisbon startup that's explicitly queer-friendly (spoken to them), one design internship in Marvila, and one opening at a cultural foundation in Belém. Full details in the jobs board.",
    reactions: rx(['fire', 31, true], ['celebrate', 19], ['heart', 7]),
    replies: [
      { author: P('sofia-castano'), text: 'Applied for the Marvila one this morning. Thank you.', time: '4h' },
    ],
    time: '1d',
    communitySlug: 'queer-youth',
  },
  {
    id: 'yth-p3',
    author: P('kai'),
    kind: 'post',
    body: "Moved to Lisbon six months ago, didn't know anyone. This group got me a flat (flatmate board), a job lead (Nuno's post), and a crit on my portfolio (thanks Luísa). The city felt enormous. Now it doesn't.",
    reactions: rx(['heart', 48, true], ['celebrate', 27], ['fire', 8]),
    replies: [
      { author: P('rita'), text: 'This is what we built it for. So glad you\'re here.', time: '2h' },
    ],
    time: '2d',
    communitySlug: 'queer-youth',
  },
  {
    id: 'yth-p4',
    author: P('sofia-castano'),
    kind: 'post',
    body: "Freelancing question: when someone asks for a 'portfolio rate', is that code for 'please work for free' or is there sometimes a real offer behind it? I keep getting offers that evaporate when I give a real quote.",
    reactions: rx(['support', 22, true], ['heart', 11]),
    replies: [
      { author: P('luisa'), text: 'Almost always the former. \'Portfolio rate\' is not a rate. Your quote was right.', time: '8h' },
      { author: P('nuno'), text: 'There are exceptions — early commissions from institutions that will actually publish your name. But \'evaporates at a real quote\' is a no.', time: '6h' },
    ],
    time: '3d',
    communitySlug: 'queer-youth',
  },
  {
    id: 'yth-p5',
    author: P('diogo'),
    kind: 'post',
    body: "Music scene entry points in Lisbon: Musicbox and ZDB are the obvious ones but the real connections happen at smaller venues. Happy to introduce people at the next gig I'm at. Just say so.",
    reactions: rx(['fire', 17], ['heart', 12, true]),
    replies: [
      { author: P('kai'), text: 'Yes please. I\'ve been trying to break in and keep hitting walls.', time: '15h' },
    ],
    time: '4d',
    communitySlug: 'queer-youth',
  },
]

const YOUTH_MOMENTS: PulseMoment[] = [
  { id: 'yth-m1', kind: 'event', text: 'New gathering posted — CVs and first-jobs clinic', time: '6h' },
  { id: 'yth-m2', kind: 'joined', text: 'Beatriz joined the network', time: '2d' },
  { id: 'yth-m3', kind: 'resource', text: 'Nuno pinned 3 new job opportunities', time: '1d' },
]

const YOUTH_EVENTS: CommunityEvent[] = [
  { id: 'yth-e1', dd: '13', mm: 'Jun', title: 'CVs & first-jobs clinic', meta: 'Friday · 18:00 · bring a laptop', spots: '15 spots' },
  { id: 'yth-e2', dd: '27', mm: 'Jun', title: 'Freelance toolkit night', meta: 'Friday · 18:00 · invoicing, contracts, rates', spots: 'open to all' },
  { id: 'yth-e3', dd: '30', mm: 'May', title: 'Flatmates meetup', meta: 'Friday · 18:00 · housing & neighbourhoods', past: true, recapHref: '#' },
]

const YOUTH_RESOURCES: CommunityResource[] = [
  { title: 'Queer-friendly employers in Lisbon', href: '/work/employer-reviews', kind: 'doc', note: 'Peer-reviewed, updated monthly' },
  { title: 'Freelancing as a creative — the basics', href: '/economy', kind: 'guide', note: 'Invoicing, rates, contracts' },
  { title: 'Flatmate board', href: '/work/flatmates', kind: 'link', note: 'Queer-friendly shares, updated weekly' },
  { title: 'First-gen professional toolkit', href: '/work/mentorship', kind: 'guide' },
]

const YOUTH_RULES = [
  'This room belongs to the under-25s. Older members contribute when asked, not by default.',
  'No unsolicited career advice or "in my day…" — there are better formats for that.',
  'Share opportunities generously; credit the person who shared it when you pass it on.',
  'Money is not a taboo topic here. Financial honesty is part of solidarity.',
  'We look out for each other\'s mental health, not just their CVs.',
]

/* ----------------------------------------------------------------------------
 * queer-poc — public, intersectional, monthly
 * ------------------------------------------------------------------------- */

const POC_ROSTER: RosterMember[] = [
  R('fatima', 'owner', { pronouns: 'she/her', hood: 'Mouraria', verified: true }),
  R('kai', 'mod', { pronouns: 'they/them', hood: 'Anjos', verified: true }),
  R('sofia-castano', 'mod', { pronouns: 'she/her', hood: 'Marvila' }),
  R('nuno', 'member', { pronouns: 'he/him', hood: 'Benfica' }),
  R('tomas', 'member', { pronouns: 'he/him', hood: 'Mouraria' }),
  R('luisa', 'member', { pronouns: 'she/her', hood: 'Príncipe Real', verified: true }),
  R('beatriz', 'member', { pronouns: 'she/her', hood: 'Graça' }),
  R('anika', 'member', { pronouns: 'she/her', hood: 'Arroios' }),
]

const POC_PULSE: Post[] = [
  {
    id: 'poc-p1',
    author: P('fatima'),
    kind: 'announcement',
    pinned: true,
    body: "Supper & sounds in Mouraria this Saturday — Tomas is cooking, we've got a playlist that goes from Nairobi to São Paulo, and we'll eat together until it's late. RSVP inside, there are only a few spots left. Bring something to contribute to the table if you can, but come even if you can't.",
    reactions: rx(['fire', 34, true], ['heart', 22], ['celebrate', 14]),
    replies: [
      { author: P('tomas'), text: 'Menu confirmed: four courses, completely ridiculous, you\'ll leave full. Come hungry.', time: '5h' },
      { author: P('kai'), text: 'Adding Amara\'s playlist from last month to the queue. It was perfect.', time: '4h' },
    ],
    time: '7h',
    communitySlug: 'queer-poc',
  },
  {
    id: 'poc-p2',
    author: P('kai'),
    kind: 'post',
    body: "The ingredients-from-home map now has 34 entries from 14 countries. Printing a version and posting it on the board for anyone who wants a physical copy. If you spot something missing, it's never too late to add your spot.",
    reactions: rx(['heart', 27, true], ['celebrate', 16]),
    replies: [
      { author: P('fatima'), text: 'This map is one of the best things we\'ve made together.', time: '3h' },
      { author: P('nuno'), text: 'Adding the Cape Verdean bakery near Anjos — open Saturday mornings.', time: '2h' },
    ],
    time: '2d',
    communitySlug: 'queer-poc',
  },
  {
    id: 'poc-p3',
    author: P('sofia-castano'),
    kind: 'post',
    body: "Documented the last gathering properly — full photo set going up in the archive this week. It was a beautiful evening. Tag yourselves in the album and grab what you need.",
    reactions: rx(['celebrate', 21], ['heart', 18, true]),
    replies: [],
    time: '3d',
    communitySlug: 'queer-poc',
  },
  {
    id: 'poc-p4',
    author: P('nuno'),
    kind: 'post',
    body: "Article worth reading: 'Queer and of colour in Lisbon — a visibility gap'. It's not perfect but it names some things that needed naming. Leaving it here for discussion, not as a verdict.",
    reactions: rx(['support', 18, true], ['heart', 11], ['fire', 5]),
    replies: [
      { author: P('luisa'), text: 'The section on cultural institutions is painfully accurate. We\'ve tried.', time: '14h' },
    ],
    time: '5d',
    communitySlug: 'queer-poc',
  },
]

const POC_MOMENTS: PulseMoment[] = [
  { id: 'poc-m1', kind: 'event', text: 'New gathering posted — supper & sounds, Mouraria', time: '7h' },
  { id: 'poc-m2', kind: 'resource', text: 'Kai updated the ingredients-from-home map — 34 entries', time: '2d' },
  { id: 'poc-m3', kind: 'joined', text: 'Luísa joined the space', time: '4d' },
]

const POC_EVENTS: CommunityEvent[] = [
  { id: 'poc-e1', dd: '22', mm: 'Jun', title: 'Supper & sounds — Mouraria', meta: 'Saturday · 20:00 · shared dinner', spots: 'few spots left' },
  { id: 'poc-e2', dd: '13', mm: 'Jul', title: 'Intersectional futures salon', meta: 'Sunday · 17:00 · open conversation', spots: 'open to all' },
  { id: 'poc-e3', dd: '25', mm: 'May', title: 'Mouraria walkabout + tea', meta: 'Sunday · 16:00', past: true, recapHref: '#' },
]

const POC_RESOURCES: CommunityResource[] = [
  { title: 'Ingredients from home — Lisbon map', href: '/resources/ingredients-map', kind: 'doc', note: '34 spots from 14 countries, crowd-sourced' },
  { title: 'Queer POC organisations in Portugal', href: '/resources/qtipoc-organisations', kind: 'link' },
  { title: 'Anti-discrimination rights in Portugal', href: '/resources/legal', kind: 'guide' },
  { title: 'QTIPOC archive project', href: '/resources/qtipoc-archive', kind: 'link' },
]

const POC_RULES = [
  'This is a space by and for queer people of colour. White guests by explicit invitation only.',
  'Race and queerness are held equally here — neither is a footnote of the other.',
  'No migration-status policing or assumptions about anyone\'s background.',
  'Joy is as political as solidarity. Both are welcome, neither is obligatory.',
  'Credit all labour, especially emotional labour.',
]

/* ----------------------------------------------------------------------------
 * disabled-queers — public, hybrid, monthly
 * ------------------------------------------------------------------------- */

const DISABLED_ROSTER: RosterMember[] = [
  R('beatriz', 'owner', { pronouns: 'she/her', hood: 'Graça', verified: true }),
  R('anika', 'mod', { pronouns: 'she/her', hood: 'Arroios', verified: true }),
  R('catarina-vaz', 'mod', { pronouns: 'she/her', hood: 'Anjos', verified: true }),
  R('kai', 'member', { pronouns: 'they/them', hood: 'Anjos' }),
  R('nuno', 'member', { pronouns: 'he/him', hood: 'Benfica' }),
  R('fatima', 'member', { pronouns: 'she/her', hood: 'Mouraria' }),
  R('monica', 'member', { pronouns: 'she/her', hood: 'Alvalade', verified: true }),
  R('sofia', 'member', { pronouns: 'she/her', hood: 'Graça' }),
]

const DISABLED_PULSE: Post[] = [
  {
    id: 'dis-p1',
    author: P('beatriz'),
    kind: 'announcement',
    pinned: true,
    body: "Low-sensory hangout this Sunday — hybrid, as always. In-person is at Maria Caxuxa in Intendente (genuinely step-free, hearing loop, no loud music). Online link in the events tab. Carers and PAs are always welcome, no booking needed for them. Come in whatever state you're in — we're not measuring.",
    reactions: rx(['heart', 24, true], ['support', 16], ['celebrate', 7]),
    replies: [
      { author: P('anika'), text: 'Verified the venue last week — everything listed is accurate, and the staff are brilliant.', time: '6h' },
      { author: P('catarina-vaz'), text: 'Online link is live in the events tab. Zoom room opens 15 min early for people who want to settle in.', time: '5h' },
    ],
    time: '7h',
    communitySlug: 'disabled-queers',
  },
  {
    id: 'dis-p2',
    author: P('anika'),
    kind: 'post',
    body: "Two more step-free venue additions today: A Cena in Mouraria (purpose-built, hearing loop, accessible toilet, staff who know what they're doing) and Solar dos Presuntos which has just completed works. Only add places you've been yourself — the list is only useful if it's honest.",
    reactions: rx(['support', 21, true], ['heart', 13]),
    replies: [
      { author: P('catarina-vaz'), text: 'Can confirm A Cena. Added accessible toilet detail and exact entrance location.', time: '4h' },
    ],
    time: '2d',
    communitySlug: 'disabled-queers',
  },
  {
    id: 'dis-p3',
    author: P('kai'),
    kind: 'post',
    body: "Chronic pain and exercise: anyone else navigating how to stay active on the bad days without making them worse? Started running again after a long rest but I'm scared of the spiral. Looking for people who've found their own version of it.",
    reactions: rx(['support', 19, true], ['heart', 14]),
    replies: [
      { author: P('monica'), text: 'Physiotherapist here — the spiral you\'re describing is real and common. DM me if you want to talk it through properly.', time: '10h' },
      { author: P('beatriz'), text: 'Permission to rest is also training. I had to learn that slowly.', time: '8h' },
    ],
    time: '3d',
    communitySlug: 'disabled-queers',
  },
  {
    id: 'dis-p4',
    author: P('monica'),
    kind: 'post',
    body: "Flagging a new guide: 'Navigating Portuguese healthcare with a disability or chronic condition' — not perfect but the sections on referrals and accessible GP practices in Lisbon are useful and recent. Adding to the resources tab.",
    reactions: rx(['support', 17, true], ['heart', 9]),
    replies: [],
    time: '5d',
    communitySlug: 'disabled-queers',
  },
]

const DISABLED_MOMENTS: PulseMoment[] = [
  { id: 'dis-m1', kind: 'event', text: 'New gathering posted — low-sensory hangout (hybrid)', time: '7h' },
  { id: 'dis-m2', kind: 'resource', text: 'Anika updated step-free venues list — 2 additions', time: '2d' },
  { id: 'dis-m3', kind: 'joined', text: 'A new member joined the space', time: '4d' },
]

const DISABLED_EVENTS: CommunityEvent[] = [
  { id: 'dis-e1', dd: '16', mm: 'Jun', title: 'Low-sensory hangout (hybrid)', meta: 'Sunday · 16:00 · in-person + online', spots: 'drop-in' },
  { id: 'dis-e2', dd: '7', mm: 'Jul', title: 'Online check-in — July', meta: 'Monday · 18:00 · members only', spots: 'open to members' },
  { id: 'dis-e3', dd: '19', mm: 'May', title: 'Accessible Lisbon walkabout', meta: 'Sunday · 15:00 · Baixa', past: true, recapHref: '#' },
]

const DISABLED_RESOURCES: CommunityResource[] = [
  { title: 'Step-free venues in Lisbon', href: '/resources/accessible-lisbon', kind: 'doc', note: 'Peer-verified only — please check before adding' },
  { title: 'Navigating Portuguese healthcare with a disability', href: '/resources/disability-healthcare', kind: 'guide' },
  { title: 'Disability rights in Portugal — plain language', href: '/resources/legal', kind: 'guide' },
  { title: 'Spoon theory — what it is and how we use it here', href: '/resources/spoon-theory', kind: 'link' },
]

const DISABLED_RULES = [
  'Every gathering is hybrid by default — online is never second class.',
  'Access needs are mentioned up front and accommodated without question or comment.',
  'Never ask what someone\'s diagnosis is unless they offer it.',
  'Carers and personal assistants are always welcome — no booking, no fuss.',
  'No inspiration-porn — we are not anyone\'s motivation.',
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
  'queer-social': {
    slug: 'queer-social',
    accessTier: 'public',
    rules: SOCIAL_RULES,
    resources: SOCIAL_RESOURCES,
    events: SOCIAL_EVENTS,
    roster: SOCIAL_ROSTER,
    pinned: SOCIAL_PULSE.filter((p) => p.pinned),
    pulse: SOCIAL_PULSE.filter((p) => !p.pinned),
    moments: SOCIAL_MOMENTS,
    stats: { members: 340, activeThisWeek: 78, postsThisWeek: 14 },
  },
  'trans-mutual-aid': {
    slug: 'trans-mutual-aid',
    accessTier: 'public',
    rules: AID_RULES,
    resources: AID_RESOURCES,
    events: AID_EVENTS,
    roster: AID_ROSTER,
    pinned: AID_PULSE.filter((p) => p.pinned),
    pulse: AID_PULSE.filter((p) => !p.pinned),
    moments: AID_MOMENTS,
    stats: { members: 89, activeThisWeek: 24, postsThisWeek: 6 },
  },
  'queer-parents': {
    slug: 'queer-parents',
    accessTier: 'public',
    rules: PARENTS_RULES,
    resources: PARENTS_RESOURCES,
    events: PARENTS_EVENTS,
    roster: PARENTS_ROSTER,
    pinned: PARENTS_PULSE.filter((p) => p.pinned),
    pulse: PARENTS_PULSE.filter((p) => !p.pinned),
    moments: PARENTS_MOMENTS,
    stats: { members: 62, activeThisWeek: 18, postsThisWeek: 5 },
  },
  'coming-out': {
    slug: 'coming-out',
    accessTier: 'private',
    rules: COMINGOUT_RULES,
    resources: COMINGOUT_RESOURCES,
    events: COMINGOUT_EVENTS,
    roster: COMINGOUT_ROSTER,
    pinned: COMINGOUT_PULSE.filter((p) => p.pinned),
    pulse: COMINGOUT_PULSE.filter((p) => !p.pinned),
    moments: COMINGOUT_MOMENTS,
    stats: { members: 67, activeThisWeek: 14, postsThisWeek: 3 },
  },
  'queer-elders': {
    slug: 'queer-elders',
    accessTier: 'public',
    rules: ELDERS_RULES,
    resources: ELDERS_RESOURCES,
    events: ELDERS_EVENTS,
    roster: ELDERS_ROSTER,
    pinned: ELDERS_PULSE.filter((p) => p.pinned),
    pulse: ELDERS_PULSE.filter((p) => !p.pinned),
    moments: ELDERS_MOMENTS,
    stats: { members: 38, activeThisWeek: 12, postsThisWeek: 4 },
  },
  'queer-youth': {
    slug: 'queer-youth',
    accessTier: 'public',
    rules: YOUTH_RULES,
    resources: YOUTH_RESOURCES,
    events: YOUTH_EVENTS,
    roster: YOUTH_ROSTER,
    pinned: YOUTH_PULSE.filter((p) => p.pinned),
    pulse: YOUTH_PULSE.filter((p) => !p.pinned),
    moments: YOUTH_MOMENTS,
    stats: { members: 93, activeThisWeek: 31, postsThisWeek: 11 },
  },
  'queer-poc': {
    slug: 'queer-poc',
    accessTier: 'public',
    rules: POC_RULES,
    resources: POC_RESOURCES,
    events: POC_EVENTS,
    roster: POC_ROSTER,
    pinned: POC_PULSE.filter((p) => p.pinned),
    pulse: POC_PULSE.filter((p) => !p.pinned),
    moments: POC_MOMENTS,
    stats: { members: 76, activeThisWeek: 22, postsThisWeek: 7 },
  },
  'disabled-queers': {
    slug: 'disabled-queers',
    accessTier: 'public',
    rules: DISABLED_RULES,
    resources: DISABLED_RESOURCES,
    events: DISABLED_EVENTS,
    roster: DISABLED_ROSTER,
    pinned: DISABLED_PULSE.filter((p) => p.pinned),
    pulse: DISABLED_PULSE.filter((p) => !p.pinned),
    moments: DISABLED_MOMENTS,
    stats: { members: 44, activeThisWeek: 13, postsThisWeek: 4 },
  },
}

export function getLiving(slug?: string): LivingCommunity | undefined {
  return slug ? LIVING[slug] : undefined
}
