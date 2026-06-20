import { MEMBERS, memberName } from '../members/data/members'

export const CATS = [
  { id: 'all', name: 'All posts', icon: '🌐', count: 61 },
  { id: 'general', name: 'General', icon: '💬', count: 12 },
  { id: 'housing', name: 'Housing', icon: '🏠', count: 8 },
  { id: 'health', name: 'Health & Wellbeing', icon: '🧠', count: 9 },
  { id: 'arts', name: 'Arts & Culture', icon: '🎨', count: 6 },
  { id: 'activism', name: 'Activism & Proposals', icon: '✊', count: 8 },
  { id: 'guides', name: 'Guides & Resources', icon: '📖', count: 6 },
  { id: 'jobs', name: 'Jobs & Skills', icon: '💼', count: 7 },
  { id: 'trans', name: 'Trans & Non-Binary', icon: '⚡', count: 5 },
]

export const CAT_STYLE: Record<string, { bg: string; color: string }> = {
  general: { bg: 'rgba(45,27,61,.08)', color: 'var(--plum)' },
  housing: { bg: 'rgba(74,140,111,.1)', color: 'var(--jade)' },
  health: { bg: 'rgba(122,82,184,.1)', color: '#7A52B8' },
  arts: { bg: 'rgba(232,119,90,.1)', color: 'var(--accent-ink)' },
  activism: { bg: 'rgba(220,50,50,.07)', color: '#B91C1C' },
  guides: { bg: 'rgba(74,140,111,.1)', color: 'var(--jade)' },
  jobs: { bg: 'rgba(232,119,90,.1)', color: 'var(--accent-ink)' },
  trans: { bg: 'rgba(122,82,184,.1)', color: '#7A52B8' },
}

export interface Reply {
  av: string
  bg: string
  color: string
  name: string
  time: string
  isOP?: boolean
  helpful?: boolean
  quote?: { cite: string; text: string }
  body: string[]
  reactions: number
}

export interface Thread {
  id: number
  cat: string
  pinned?: boolean
  title: string
  excerpt: string
  author: { i: string; n: string; t: string; tt: string }
  posted: string
  views: number
  upvotes: number
  comments: number
  tags: string[]
  /** Full opening-post paragraphs shown on the thread page. */
  body: string[]
  replies: Reply[]
}

// Reusable avatar tints for reply authors.
const CORAL = { bg: 'rgba(232,119,90,.14)', color: 'var(--accent-ink)' }
const JADE = { bg: 'rgba(74,140,111,.15)', color: 'var(--jade)' }
const PLUM = { bg: 'rgba(45,27,61,.1)', color: 'var(--plum)' }
const PURPLE = { bg: 'rgba(112,80,170,.12)', color: '#7050AA' }

export const THREADS: Thread[] = [
  {
    id: 1,
    cat: 'guides',
    pinned: true,
    title: 'Master resource guide: LGBTQ+ in Lisbon',
    excerpt:
      'Everything you need to navigate Lisbon as a queer person — organisations, healthcare, housing, legal rights, and community. Updated monthly.',
    author: { i: 'QP', n: 'QueerPulse', t: '#E8775A', tt: '#fff' },
    posted: '2 months ago',
    views: 4120,
    upvotes: 201,
    comments: 12,
    tags: ['guide', 'resources'],
    body: [
      'This is the living index we point every new arrival to. It pulls together the organisations, healthcare routes, housing boards, legal contacts, and community spaces that members have vouched for — and we update it at the start of every month.',
      'Each section links out to a dedicated guide: trans-affirming healthcare, the housing board, emergency and legal resources, and the events calendar. If a contact has gone cold or a link is dead, reply here and a moderator will fix it within a day or two.',
      'Bookmark this thread. If you only read one thing on the forum, read this one first.',
    ],
    replies: [
      {
        av: 'RF',
        ...CORAL,
        name: 'Rita Fonseca',
        time: '6 weeks ago',
        helpful: true,
        body: [
          'Saving this. The healthcare section alone saved me weeks of guesswork when I moved over from Porto — the note about which SNS centres actually follow the trans pathway is gold.',
          'One addition: the AMPLOS parents-and-families group runs a monthly drop-in that isn\'t listed yet. Worth adding under community.',
        ],
        reactions: 14,
      },
      {
        av: 'QP',
        bg: 'rgba(232,119,90,.14)',
        color: 'var(--accent-ink)',
        name: 'QueerPulse',
        time: '6 weeks ago',
        isOP: true,
        quote: { cite: 'Rita Fonseca', text: 'the AMPLOS parents-and-families group runs a monthly drop-in…' },
        body: ['Added AMPLOS to the community section — thank you Rita. Keep them coming.'],
        reactions: 5,
      },
      {
        av: 'TB',
        ...PURPLE,
        name: 'Tomás B.',
        time: '3 weeks ago',
        body: ['Could we get a Portuguese translation of the legal-rights section? Happy to draft it if someone can review.'],
        reactions: 9,
      },
    ],
  },
  {
    id: 2,
    cat: 'health',
    pinned: true,
    title: 'Trans-affirming healthcare in Lisbon — the full guide',
    excerpt:
      'How to find a GP who will treat you with respect, how the SNS system handles trans healthcare, and who to call when it goes wrong.',
    author: { i: 'JF', n: 'Jonas Ferreira', t: '#4A8C6F', tt: '#fff' },
    posted: '5 weeks ago',
    views: 2870,
    upvotes: 87,
    comments: 31,
    tags: ['health', 'trans', 'guide'],
    body: [
      'I put this together after three years of navigating the system myself and helping a dozen other people through it. The short version: it is possible to get respectful, competent care on the SNS, but which centro de saúde you land at matters enormously.',
      'The guide covers how to register, how to request a referral to the gender team at the Hospital de Santa Maria, what documentation actually speeds things up, and — importantly — what to do when a GP stalls or misgenders you. There are escalation routes that work.',
      'I will keep this updated as the 2026 protocol changes land. If your experience differs from what is written here, please reply so the picture stays honest.',
    ],
    replies: [
      {
        av: 'AQ',
        ...JADE,
        name: 'Alex Quintela',
        time: '5 weeks ago',
        helpful: true,
        body: [
          'The escalation section is the part nobody tells you about. I spent eight months stuck because my GP "forgot" to send the referral twice. The patient-ombudsman letter template here got it moving in a fortnight.',
        ],
        reactions: 19,
      },
      {
        av: 'ML',
        ...PLUM,
        name: 'Mara L.',
        time: '4 weeks ago',
        body: [
          'Adding a data point: the Lapa centro de saúde was genuinely good for me. The GP had clearly worked with trans patients before and didn\'t make me explain the basics.',
        ],
        reactions: 11,
      },
      {
        av: 'JF',
        bg: 'rgba(74,140,111,.15)',
        color: 'var(--jade)',
        name: 'Jonas Ferreira',
        time: '4 weeks ago',
        isOP: true,
        body: ['Noted Lapa as a recommended centre. Thank you both — this is exactly the kind of ground-truth that makes the guide useful.'],
        reactions: 6,
      },
    ],
  },
  {
    id: 3,
    cat: 'general',
    pinned: true,
    title: 'Welcome thread — introduce yourself 👋',
    excerpt:
      "Say hello. Tell us who you are, where you're from, what you make, and what brought you to QueerPulse. We read every one.",
    author: { i: 'QP', n: 'QueerPulse', t: '#E8775A', tt: '#fff' },
    posted: '3 weeks ago',
    views: 3340,
    upvotes: 156,
    comments: 89,
    tags: ['welcome'],
    body: [
      'New here? This is the place to land. Tell us your name (or what you go by), where you came from, what you make or do, and what brought you to QueerPulse.',
      'No pressure to write an essay — a single line is welcome. The only rule is the one that runs through the whole forum: be kind, be useful.',
    ],
    replies: [
      {
        av: MEMBERS.carla.initials,
        ...CORAL,
        name: memberName('carla'),
        time: '3 weeks ago',
        body: [
          'Hi all — Carla, illustrator, moved here from Madrid in January. Still figuring out the city but the welcome here has been real. Looking for studio-share leads and people to draw with.',
        ],
        reactions: 12,
      },
      {
        av: MEMBERS.diogo.initials,
        ...JADE,
        name: memberName('diogo'),
        time: '3 weeks ago',
        body: ['Diogo, sound engineer, Lisbon born and back after six years in Berlin. Here for the music thread and to find collaborators. Say hi if you make anything noisy.'],
        reactions: 8,
      },
      {
        av: 'NK',
        ...PURPLE,
        name: 'Noor K.',
        time: '2 weeks ago',
        body: ['Noor, they/them, just arrived from Beirut. Nervous and excited. Grateful this exists.'],
        reactions: 21,
      },
    ],
  },
  {
    id: 5,
    cat: 'activism',
    title: 'Proposal: Monthly queer film night at Cinema São Jorge',
    excerpt:
      "Sofia is proposing a monthly queer film screening at Cinema São Jorge. She has a relationship with their programming team. Upvote if you'd come.",
    author: { i: MEMBERS.sofia.initials, n: memberName('sofia'), t: '#4A8C6F', tt: '#fff' },
    posted: '4 days ago',
    views: 612,
    upvotes: 38,
    comments: 24,
    tags: ['proposal', 'film'],
    body: [
      'I have been talking to the programming team at Cinema São Jorge and they are genuinely open to a recurring queer film night — one Tuesday a month, the small room, ticketed at cost so it stays affordable.',
      'Before I commit us, I want to know two things: would you actually come, and would you help? I can handle the cinema relationship and programming, but I would need a couple of people on the door and one on social.',
      'Upvote if you would come. Reply if you want to help make it happen.',
    ],
    replies: [
      {
        av: MEMBERS.ines.initials,
        ...CORAL,
        name: memberName('ines'),
        time: '4 days ago',
        helpful: true,
        body: ['Yes, and yes — I can do the door and bring the bookshop in as a small sponsor. A monthly anchor like this is exactly what the scene is missing.'],
        reactions: 13,
      },
      {
        av: 'RP',
        ...PURPLE,
        name: 'Rui P.',
        time: '3 days ago',
        body: ['Would absolutely come. Suggestion: keep one slot a quarter for Portuguese-language queer cinema specifically — there is more of it than people think and it never gets screened.'],
        reactions: 7,
      },
      {
        av: MEMBERS.sofia.initials,
        bg: 'rgba(74,140,111,.15)',
        color: 'var(--jade)',
        name: memberName('sofia'),
        time: '3 days ago',
        isOP: true,
        quote: { cite: 'Inês', text: 'I can do the door and bring the bookshop in as a small sponsor.' },
        body: ['Amazing — that covers door and a sponsor in one go. Rui, the Portuguese-cinema slot is a great idea, locking it in. I will draft a first season and post it next week.'],
        reactions: 9,
      },
    ],
  },
  {
    id: 6,
    cat: 'general',
    title: 'What queer spaces in Lisbon do you miss or want to see return?',
    excerpt:
      "Bars, clubs, bookshops, community centres — what's been lost, what never existed but should, and what we could build. Share yours.",
    author: { i: MEMBERS.diogo.initials, n: memberName('diogo'), t: '#4A8C6F', tt: '#fff' },
    posted: '6 days ago',
    views: 980,
    upvotes: 44,
    comments: 28,
    tags: ['spaces', 'culture'],
    body: [
      'I keep hearing people talk about places that used to exist — a bar in Príncipe Real, a women\'s night that ran for years, a bookshop that doubled as a meeting room. Some of it before my time.',
      'So: what do you miss, what never existed but should have, and — the real question — what could we actually build now, together? I am asking partly out of nostalgia and partly because I think a list like this is the start of a plan.',
    ],
    replies: [
      {
        av: 'CV',
        ...PLUM,
        name: 'Catarina Vaz',
        time: '5 days ago',
        body: [
          'A daytime space. Everything queer here is nocturnal and built around drinking. I want somewhere to sit with a coffee and a laptop at 3pm and not be the only one.',
        ],
        reactions: 17,
      },
      {
        av: 'HM',
        ...CORAL,
        name: 'Helena M.',
        time: '5 days ago',
        helpful: true,
        body: ['Seconding the daytime idea. The old Lisbon women\'s collective ran a café-library model in the 90s and it worked because it was useful, not just social. We could do a modern version with the micro-grants fund seeding it.'],
        reactions: 15,
      },
      {
        av: MEMBERS.diogo.initials,
        bg: 'rgba(74,140,111,.15)',
        color: 'var(--jade)',
        name: memberName('diogo'),
        time: '4 days ago',
        isOP: true,
        body: ['The café-library keeps coming up in DMs too. I am going to pull these into a proper proposal and tag the governance thread. Keep them coming.'],
        reactions: 6,
      },
    ],
  },
  {
    id: 8,
    cat: 'housing',
    title: 'Honest guide to finding a flat in Lisbon as a newcomer',
    excerpt:
      "Carla wrote this after three weeks on the rental market. Not encouraging. But useful, and more honest than anything you'll find on a portal.",
    author: { i: MEMBERS.carla.initials, n: memberName('carla'), t: '#E8775A', tt: '#fff' },
    posted: '2 weeks ago',
    views: 1740,
    upvotes: 41,
    comments: 22,
    tags: ['housing', 'guide'],
    body: [
      'Three weeks, forty-something viewings, two scams narrowly avoided. Here is what I wish someone had told me before I started looking.',
      'Budget for the deposit-plus-two-months reality, assume the photos are two years old, and never transfer anything before seeing a place in person — the "I am abroad, here are the keys by courier" message is always a scam. The fiador (guarantor) requirement is the wall most newcomers hit; I get into the workarounds below.',
      'This is not meant to discourage you. People do find homes here. It just takes longer and costs more than the portals admit, and going in clear-eyed helps.',
    ],
    replies: [
      {
        av: 'PS',
        ...JADE,
        name: 'Pedro S.',
        time: '2 weeks ago',
        helpful: true,
        body: [
          'The fiador workaround section is the most useful thing I have read on this forum. For anyone stuck: some landlords accept a larger deposit in lieu of a guarantor if you ask directly. It is negotiable more often than you think.',
        ],
        reactions: 16,
      },
      {
        av: 'LG',
        ...PURPLE,
        name: 'Lena G.',
        time: '12 days ago',
        body: ['Adding the obvious one people forget: the QueerPulse housing board has flatshares that never touch the public portals. I found my room there in a week after a month of portal misery.'],
        reactions: 10,
      },
    ],
  },
  {
    id: 16,
    cat: 'trans',
    pinned: true,
    title: 'Trans healthcare in Portugal 2026 — the complete SNS guide',
    excerpt:
      'How the SNS pathway works, which gender clinics in Lisbon are actually welcoming, and what to do when the system pushes back.',
    author: { i: 'JF', n: 'Jonas Ferreira', t: '#4A8C6F', tt: '#fff' },
    posted: '2 weeks ago',
    views: 2210,
    upvotes: 92,
    comments: 26,
    tags: ['trans', 'healthcare'],
    body: [
      'A companion to the Lisbon healthcare guide, this one focuses specifically on the 2026 SNS pathway end to end: registration, the gender-team referral, the assessment process, and what HRT access actually looks like once you are in the system.',
      'I have tried to be precise about timelines — what is realistic versus what the protocol promises — and to name the points where people most often get stuck. There is also a section on private routes for those who can afford them and want to bridge the wait.',
      'If the protocol shifts mid-year, I will flag the change here with a date so you can tell old advice from current.',
    ],
    replies: [
      {
        av: 'SA',
        ...CORAL,
        name: 'Sara A.',
        time: '11 days ago',
        helpful: true,
        body: ['The realistic-timeline section deserves to be pinned on its own. I went in expecting the protocol numbers and the honest version here stopped me spiralling when month four came and went with no appointment.'],
        reactions: 18,
      },
      {
        av: 'DN',
        ...PURPLE,
        name: 'Dani N.',
        time: '9 days ago',
        body: ['For the private-bridge section — worth noting a couple of the endocrinologists listed will coordinate with your SNS team so you are not running two parallel records. Ask before booking.'],
        reactions: 7,
      },
    ],
  },
  {
    id: 11,
    cat: 'arts',
    title: 'Vote: Queer film series — what do we watch in July?',
    excerpt:
      "We're doing our first proper screening. Submit and upvote films below. Foreign language films very welcome.",
    author: { i: MEMBERS.sofia.initials, n: memberName('sofia'), t: '#4A8C6F', tt: '#fff' },
    posted: '2 days ago',
    views: 430,
    upvotes: 18,
    comments: 12,
    tags: ['film', 'vote'],
    body: [
      'Following on from the São Jorge proposal — our first screening is happening in July and you get to pick it. Drop a film in the replies and upvote the ones you would turn up for.',
      'Two asks: foreign-language and Portuguese cinema very welcome, and try to keep it to things we can actually licence for a small one-off screening. I will tally the top three next Friday.',
    ],
    replies: [
      {
        av: 'BF',
        ...PLUM,
        name: 'Bruno F.',
        time: '2 days ago',
        body: ['"Tchindas" — a documentary from Cabo Verde, warm, funny, and almost never screened here. Would be a perfect opener.'],
        reactions: 9,
      },
      {
        av: 'MG',
        ...CORAL,
        name: 'Marta G.',
        time: '1 day ago',
        helpful: true,
        body: ['Seconding a Lusophone opener. If we want something with a bit of weight after, "Madame Satã" still holds up and gets people talking afterwards — which is half the point of a screening.'],
        reactions: 11,
      },
      {
        av: MEMBERS.sofia.initials,
        bg: 'rgba(74,140,111,.15)',
        color: 'var(--jade)',
        name: memberName('sofia'),
        time: '22h ago',
        isOP: true,
        body: ['Both on the shortlist. Keep voting — I will post the final three on Friday and we will run the top one as the July night.'],
        reactions: 4,
      },
    ],
  },
  {
    id: 13,
    cat: 'general',
    title: 'Should QueerPulse be more accessible to non-professionals?',
    excerpt:
      "The invite-only + 'professional network' framing might be excluding people who need community most. Thoughts?",
    author: { i: 'CV', n: 'Catarina Vaz', t: '#2D1B3D', tt: '#F7F3EE' },
    posted: '1 week ago',
    views: 1120,
    upvotes: 41,
    comments: 23,
    tags: ['platform', 'inclusion'],
    body: [
      'I want to raise something carefully. The invite-only model and the "professional network" language keep the quality high, but I worry they quietly select for people who already have stability — and screen out the ones who need community most.',
      'I am not arguing for throwing the doors open overnight. I am asking whether there is a middle path: a sponsored-membership route, an open resources tier, something. What would we lose, and what would we gain?',
    ],
    replies: [
      {
        av: 'AM',
        ...JADE,
        name: 'André M.',
        time: '7 days ago',
        body: ['I came in through a member sponsor with zero "professional" credentials and it changed my year. So I am living proof the middle path works — it just currently depends on knowing the right person, which is the problem you are naming.'],
        reactions: 14,
      },
      {
        av: 'TR',
        ...PURPLE,
        name: 'Teresa R.',
        time: '7 days ago',
        helpful: true,
        body: [
          'A two-tier idea worth costing: keep the curated network as-is, but make the resources, housing board, and emergency contacts fully open with no invite. The stuff that saves lives should not be behind a gate. The social layer can stay curated.',
        ],
        reactions: 22,
      },
      {
        av: 'CV',
        bg: 'rgba(45,27,61,.1)',
        color: 'var(--plum)',
        name: 'Catarina Vaz',
        time: '6 days ago',
        isOP: true,
        quote: { cite: 'Teresa R.', text: 'make the resources, housing board, and emergency contacts fully open…' },
        body: ['This is the sharpest version of what I was reaching for. I am going to write it up as a governance proposal — open safety layer, curated social layer. Thank you Teresa.'],
        reactions: 8,
      },
    ],
  },
  {
    id: 18,
    cat: 'activism',
    title: 'Micro-grants: Q3 2026 applications now open',
    excerpt:
      'The community fund has €840 available this quarter for projects, events, and emergencies. €50–200 grants, no bureaucracy.',
    author: { i: 'QP', n: 'QueerPulse', t: '#E8775A', tt: '#fff' },
    posted: '4 days ago',
    views: 760,
    upvotes: 22,
    comments: 9,
    tags: ['grants', 'fund'],
    body: [
      'The community fund stands at €840 for Q3. Grants run €50–200 and are meant to be quick: a paragraph on what you need it for, no forms, no jury theatre.',
      'Priority goes to three things — small queer-led projects and events, skills and equipment that pay forward, and genuine emergencies. Decisions are made by a rotating panel of three members and announced openly in the governance thread.',
      'Reply here or DM a moderator to apply. If you have benefited before, consider topping the fund up — it only exists because members keep it alive.',
    ],
    replies: [
      {
        av: 'IT',
        ...CORAL,
        name: 'Iris T.',
        time: '3 days ago',
        body: ['Applied for €120 toward materials for a binder-sewing workshop. Whatever the panel decides, thank you for making the process this painless — the no-forms part is why I actually applied.'],
        reactions: 10,
      },
      {
        av: 'GP',
        ...JADE,
        name: 'Gonçalo P.',
        time: '2 days ago',
        body: ['Topped up €30. Got a €150 emergency grant in February that covered a locksmith when I was locked out the week I arrived. Paying it forward.'],
        reactions: 13,
      },
    ],
  },
  {
    id: 15,
    cat: 'jobs',
    title: 'Queer-run bookshop in Anjos — hiring a bookseller',
    excerpt:
      "The bookshop we've been building is opening in September. Looking for a part-time bookseller with a love of queer literature.",
    author: { i: MEMBERS.ines.initials, n: memberName('ines'), t: '#E8775A', tt: '#fff' },
    posted: '1 day ago',
    views: 540,
    upvotes: 31,
    comments: 14,
    tags: ['jobs', 'bookshop'],
    body: [
      'It is really happening — the bookshop opens in Anjos in September, and we are hiring our first part-time bookseller. Three days a week to start, fair pay on the solidarity scale, with room to grow as we do.',
      'What we are looking for: someone who genuinely loves queer literature, is comfortable on a till and talking to strangers, and wants to help shape a space rather than just staff it. Portuguese and English both needed; other languages a bonus.',
      'No formal CV required — tell me about a book that changed you and why you want this. Reply here or DM me.',
    ],
    replies: [
      {
        av: 'JM',
        ...PURPLE,
        name: 'Joana M.',
        time: '22h ago',
        helpful: true,
        body: ['The book that changed me was "Stone Butch Blues" at nineteen, in a library copy I renewed four times because I couldn\'t afford my own. I have run a till for six years and I would love this. Sending a DM.'],
        reactions: 15,
      },
      {
        av: 'FA',
        ...CORAL,
        name: 'Filipe A.',
        time: '18h ago',
        body: ['Not applying but — if you need someone to build a few shelves before September, I do carpentry and I will trade it for a launch-night invite. Serious offer.'],
        reactions: 8,
      },
      {
        av: MEMBERS.ines.initials,
        bg: 'rgba(232,119,90,.14)',
        color: 'var(--accent-ink)',
        name: memberName('ines'),
        time: '15h ago',
        isOP: true,
        body: ['Joana, that is exactly the energy — replied to your DM. Filipe, yes please, the shelves are genuinely on the critical path. Let us talk.'],
        reactions: 6,
      },
    ],
  },
  {
    id: 19,
    cat: 'trans',
    title: 'Legal name change in Portugal — sharing experiences and tips',
    excerpt:
      'Possible since 2018, but in practice it depends heavily on which conservatória and official you see. Share your story.',
    author: { i: 'CV', n: 'Catarina Vaz', t: '#2D1B3D', tt: '#F7F3EE' },
    posted: '1 week ago',
    views: 1340,
    upvotes: 34,
    comments: 18,
    tags: ['trans', 'legal'],
    body: [
      'Self-determination of name and gender marker has been law since 2018, no medical report required. On paper it is one of the better frameworks in Europe. In practice, whether it goes smoothly depends a frustrating amount on which conservatória you walk into and who is behind the desk.',
      'I went through it last year and want to build a shared map: which offices were respectful, which dragged their feet, what documents actually got asked for, and how long it really took. The more data points, the less of a lottery it is for the next person.',
      'Share your experience below — good or bad. Anonymised is fine; just say the area, not your name.',
    ],
    replies: [
      {
        av: 'RM',
        ...JADE,
        name: 'Rafa M.',
        time: '6 days ago',
        helpful: true,
        body: [
          'Conservatória dos Registos Centrais (Lisbon) was straightforward for me — booked online, brought citizen card and the standard declaration, done in one visit and the new card arrived in about two weeks. The official was completely matter-of-fact about it.',
        ],
        reactions: 16,
      },
      {
        av: 'EP',
        ...PURPLE,
        name: 'Elif P.',
        time: '5 days ago',
        body: ['Less smooth at a smaller office outside the city — got asked for a "medical document" that the law explicitly does not require. I printed the statute, brought it back, and they processed it without comment. Know the law before you go.'],
        reactions: 12,
      },
      {
        av: 'CV',
        bg: 'rgba(45,27,61,.1)',
        color: 'var(--plum)',
        name: 'Catarina Vaz',
        time: '5 days ago',
        isOP: true,
        body: ['Both logged into the map — Registos Centrais green, the smaller office flagged with Elif\'s tip about bringing the statute. This is exactly the ground-truth I hoped for.'],
        reactions: 7,
      },
    ],
  },
]

export const REPLY_SORTS = ['Oldest', 'Newest', 'Most helpful'] as const
