export interface Therapist {
  name: string
  creds: string
  langs: string[]
  specs: string[]
  format: string
  note: string
  avBg: string
  avCol: string
}

export const THERAPISTS: Therapist[] = [
  {
    name: 'Dr. Marta Silva',
    creds: 'Clinical Psychologist · COP registered',
    langs: ['Portuguese', 'English'],
    specs: ['Trauma', 'Identity', 'LGBTQ+'],
    format: 'In-person · Chiado',
    note: '"My practice is specifically focused on LGBTQ+ clients. I have been doing this for 12 years and will not make you explain your identity to me."',
    avBg: 'rgba(74,140,111,.16)',
    avCol: 'var(--jade)',
  },
  {
    name: 'James Chen',
    creds: 'Psychotherapist · UKCP registered',
    langs: ['English', 'Mandarin'],
    specs: ['Expat adjustment', 'Relationships', 'Anxiety'],
    format: 'Online only',
    note: '"I work with queer expats specifically — I understand the particular stress of building a life in a new country while navigating your identity."',
    avBg: 'rgba(232,119,90,.16)',
    avCol: 'var(--accent-ink)',
  },
  {
    name: 'Ana Lima',
    creds: 'Psychologist · OPP registered',
    langs: ['Portuguese', 'Spanish'],
    specs: ['Sexuality', 'Depression', 'Family'],
    format: 'In-person & online · Arroios',
    note: '"I offer a non-judgmental space for people navigating sexual orientation, gender identity, and family relationships. Sliding scale available."',
    avBg: 'rgba(45,27,61,.12)',
    avCol: 'var(--plum)',
  },
  {
    name: 'Sarah Okafor',
    creds: 'Counselling Psychologist · BPS chartered',
    langs: ['English', 'French'],
    specs: ['Intersectionality', 'Trauma', 'Race & identity'],
    format: 'Online only',
    note: '"I work at the intersection of race, queerness, and displacement. If you\'ve struggled to find a therapist who holds all of it, I do."',
    avBg: 'rgba(122,82,184,.14)',
    avCol: '#7A52B8',
  },
  {
    name: 'Pedro Carvalho',
    creds: 'Psychotherapist · APAF member',
    langs: ['Portuguese', 'English'],
    specs: ['Coming out', 'Couples', 'Trans-affirming'],
    format: 'In-person · Príncipe Real',
    note: '"Queer myself. I have specific experience working with coming-out processes at all ages, trans identities, and queer couples and relationships."',
    avBg: 'rgba(74,140,111,.16)',
    avCol: 'var(--jade)',
  },
]

export const CRISIS: { name: string; num: string; note: string }[] = [
  { name: 'SOS Voz Amiga', num: '213 544 545', note: '24h · Portuguese & English' },
  { name: 'SNS 24', num: '808 24 24 24', note: 'Health line · 24h' },
  { name: 'ILGA Portugal', num: '213 887 239', note: 'LGBTQ+ support line' },
  { name: 'Samaritans (online)', num: 'jo@samaritans.org', note: 'Email · English · 24h response' },
]

export const EXPERIENCES: { title: string; text: string }[] = [
  {
    title: 'Starting over in a new community',
    text: 'Losing your queer social network when you move is a genuine grief. Building a new one takes time and feels unnatural at first. The people who've been here longest remember it — it does get easier, but the early months are hard and it's okay to say so.',
  },
  {
    title: 'Navigating visibility in a new culture',
    text: 'Lisbon is broadly safe but queer visibility works differently here. Some members feel more visible than at home; others feel less. Reading social situations in a second language or culture is exhausting and disorienting in ways that are hard to explain to people who haven't experienced it.',
  },
  {
    title: 'The administrative grind',
    text: 'Visas, NIF, AIMA, healthcare registration, bank accounts that won't open. The bureaucratic weight of building a life in a new country is a documented source of chronic stress. It's not weakness — it's a lot. Naming it as a mental health factor is valid.',
  },
  {
    title: 'Trans and non-binary experiences in a new system',
    text: 'Navigating healthcare, legal documents, and social situations as a trans or non-binary person in Portugal adds a specific layer of stress and labour. Portugal's legal framework is progressive but administrative reality varies. The Trans Hub has specific resources.',
  },
  {
    title: 'Distance from family of origin',
    text: 'Moving to another country often means physical distance from family — chosen or biological. For queer people whose family relationships are complicated or conditional, this distance can be both a relief and its own kind of grief. Both are real at the same time.',
  },
  {
    title: 'Financial anxiety',
    text: 'Lisbon's rising cost of living affects queer expats acutely. Housing insecurity, visa costs, and the pressure to perform a certain kind of queer expat life are all real stressors. The community talks about money honestly — the forum's economics thread is a good start.',
  },
]

export const SNS: { num: string; title: string; text: string }[] = [
  {
    num: '01',
    title: 'Register with a GP first',
    text: 'You need to be registered with a Centro de Saúde before accessing SNS mental health services. Register with your AR card or EU registration certificate and NISS number. Waiting lists for GP registration exist in some areas.',
  },
  {
    num: '02',
    title: 'GP referral for psychology',
    text: 'Your GP can refer you to a psychologist or psychiatrist through the SNS. Waiting times for the first appointment are typically 3–6 months. For urgent needs, explain severity clearly — this can speed up the referral.',
  },
  {
    num: '03',
    title: 'Language matters',
    text: 'SNS therapists and psychiatrists typically work in Portuguese. If your Portuguese is limited, private therapy in English is more practical for most expats. Online platforms (BetterHelp, Zenklub) offer English-speaking therapists at lower cost than Lisbon private rates.',
  },
  {
    num: '04',
    title: 'Private rates in Lisbon',
    text: 'Private therapy ranges from €50–120 per session. Some therapists offer sliding scale fees — it's always worth asking. Several therapists in our directory offer community member rates for QueerPulse members.',
  },
]

export const LANGS = ['all', 'English', 'Portuguese', 'Spanish', 'French']
