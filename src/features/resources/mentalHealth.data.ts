export interface Therapist {
  /** Stable slug used as a key and for opening the profile. */
  id: string;
  name: string;
  /** Avatar initials, kept as a fallback when the photo can't load. */
  initials: string;
  pronouns: string;
  creds: string;
  /** Professional body registration shown as a verified credential. */
  registration: string;
  langs: string[];
  specs: string[];
  format: string;
  /** Short pull-quote shown on the card. */
  note: string;
  photo: string;
  avBg: string;
  avCol: string;
  /** Whether the therapist is currently taking on new clients. */
  acceptingNew: boolean;
  /** Years in practice. */
  years: number;
  /** Per-session price range, already formatted. */
  rate: string;
  slidingScale: boolean;
  /** Where they practise / neighbourhood, plain text. */
  location: string;
  /** Typical wait for a first appointment. */
  availability: string;
  /** Longer professional bio, one paragraph per entry. */
  bio: string[];
  /** Therapeutic modalities and methods they draw on. */
  approach: string[];
  /** Training and qualifications, most recent first. */
  training: string[];
  /** What a first session looks like. */
  firstSession: string;
}

export const THERAPISTS: Therapist[] = [
  {
    id: "marta-silva",
    name: "Dr. Marta Silva",
    initials: "MS",
    pronouns: "she/her",
    creds: "Clinical Psychologist · COP registered",
    registration: "Ordem dos Psicólogos Portugueses · OPP 4821",
    langs: ["Portuguese", "English"],
    specs: ["Trauma", "Identity", "LGBTQ+"],
    format: "In-person · Chiado",
    note: '"My practice is specifically focused on LGBTQ+ clients. I have been doing this for 12 years and will not make you explain your identity to me."',
    photo:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop",
    avBg: "rgba(74,140,111,.16)",
    avCol: "var(--jade)",
    acceptingNew: true,
    years: 12,
    rate: "€70–90 / session",
    slidingScale: true,
    location: "Praça Luís de Camões, Chiado",
    availability: "Usually within 1–2 weeks",
    bio: [
      "I am a clinical psychologist working exclusively with LGBTQ+ adults. My practice grew out of a simple frustration: queer clients spending the first months of therapy educating their therapist instead of being helped by them. That does not happen here.",
      "Much of my work is with trauma — both the acute kind and the slow, accumulated weight of moving through a world that was not built for you. I work relationally and at your pace. Nothing is rushed, and nothing about who you are is up for debate.",
    ],
    approach: [
      "Trauma-informed",
      "EMDR",
      "Relational psychotherapy",
      "Affirmative practice",
    ],
    training: [
      "PhD Clinical Psychology — Universidade de Lisboa",
      "EMDR Europe Accredited Practitioner",
      "Certificate in LGBTQ+ Affirmative Therapy — Pink Therapy, London",
    ],
    firstSession:
      "A relaxed 50-minute conversation. No intake forms to fill alone — we talk through what brought you here and whether we are a good fit. There is no obligation to continue.",
  },
  {
    id: "james-chen",
    name: "James Chen",
    initials: "JC",
    pronouns: "he/him",
    creds: "Psychotherapist · UKCP registered",
    registration: "UK Council for Psychotherapy · UKCP 2019148921",
    langs: ["English", "Mandarin"],
    specs: ["Expat adjustment", "Relationships", "Anxiety"],
    format: "Online only",
    note: '"I work with queer expats specifically — I understand the particular stress of building a life in a new country while navigating your identity."',
    photo:
      "https://images.unsplash.com/photo-1544168190-79c17527004f?q=80&w=600&auto=format&fit=crop",
    avBg: "rgba(232,119,90,.16)",
    avCol: "var(--accent-ink)",
    acceptingNew: true,
    years: 9,
    rate: "€55–75 / session",
    slidingScale: false,
    location: "Online · sessions across time zones",
    availability: "Usually within a week",
    bio: [
      "I am a psychotherapist working entirely online, which means distance is never a barrier — I see clients in Lisbon, across Europe, and back home. My focus is the particular experience of being queer and far from where you started.",
      "Anxiety, relationships, the disorientation of rebuilding a life in a second language — these are the threads most of my clients are holding. I am bilingual in English and Mandarin, and I understand how identity reshapes itself across cultures.",
    ],
    approach: [
      "Integrative psychotherapy",
      "CBT",
      "Mindfulness-based",
      "Cross-cultural",
    ],
    training: [
      "MSc Psychotherapy & Counselling — University of Edinburgh",
      "UKCP Accredited Psychotherapist",
      "Advanced training in cross-cultural therapy",
    ],
    firstSession:
      "A 30-minute video call at no charge, so we can both get a feel for working together before you commit. I will ask what you are hoping for and explain how I work.",
  },
  {
    id: "ana-lima",
    name: "Ana Lima",
    initials: "AL",
    pronouns: "she/her",
    creds: "Psychologist · OPP registered",
    registration: "Ordem dos Psicólogos Portugueses · OPP 5117",
    langs: ["Portuguese", "Spanish"],
    specs: ["Sexuality", "Depression", "Family"],
    format: "In-person & online · Arroios",
    note: '"I offer a non-judgmental space for people navigating sexual orientation, gender identity, and family relationships. Sliding scale available."',
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop",
    avBg: "rgba(45,27,61,.12)",
    avCol: "var(--plum)",
    acceptingNew: false,
    years: 7,
    rate: "€50–70 / session",
    slidingScale: true,
    location: "Rua de Arroios, Arroios",
    availability: "Waitlist — currently full",
    bio: [
      "I work with people navigating sexual orientation, gender identity, and the family relationships that sit alongside them. A lot of my clients arrive carrying questions they have never felt safe to say out loud. My room is built for exactly that.",
      "I also work in Spanish, and I keep a sliding scale because access should not depend on income. When my caseload is full I still answer messages — tell me what you need and I will point you somewhere good.",
    ],
    approach: [
      "Person-centred",
      "Systemic / family",
      "Affirmative practice",
      "Narrative therapy",
    ],
    training: [
      "MSc Clinical & Health Psychology — ISPA Lisboa",
      "Postgraduate diploma in Systemic Family Therapy",
      "Member, OPP Working Group on Sexual & Gender Diversity",
    ],
    firstSession:
      "We start with what feels most pressing — there is no script. First sessions are 50 minutes, in Portuguese or Spanish, in person in Arroios or online.",
  },
  {
    id: "sarah-okafor",
    name: "Sarah Okafor",
    initials: "SO",
    pronouns: "she/they",
    creds: "Counselling Psychologist · BPS chartered",
    registration: "British Psychological Society · BPS Chartered 365112",
    langs: ["English", "French"],
    specs: ["Intersectionality", "Trauma", "Race & identity"],
    format: "Online only",
    note: '"I work at the intersection of race, queerness, and displacement. If you\'ve struggled to find a therapist who holds all of it, I do."',
    photo:
      "https://images.unsplash.com/photo-1638727295415-286409421143?q=80&w=600&auto=format&fit=crop",
    avBg: "rgba(122,82,184,.14)",
    avCol: "var(--violet)",
    acceptingNew: true,
    years: 11,
    rate: "€65–85 / session",
    slidingScale: true,
    location: "Online · UK & EU clients",
    availability: "Usually within 2 weeks",
    bio: [
      "I am a chartered counselling psychologist working at the intersection of race, queerness, and displacement. If you have sat across from a therapist who could hold one part of you but not the rest, you know exactly why that intersection matters.",
      "My work is trauma-focused and politically literate — I do not treat the world outside the room as irrelevant to what happens inside it. I work in English and French, online, with people across the UK and the EU.",
    ],
    approach: [
      "Trauma-focused",
      "Intersectional",
      "Liberation psychology",
      "EMDR",
    ],
    training: [
      "DPsych Counselling Psychology — City, University of London",
      "BPS Chartered Psychologist (CPsychol)",
      "Certificate in Racial Trauma — Black, African & Asian Therapy Network",
    ],
    firstSession:
      "A 50-minute online session where you set the agenda. I will share how I work with identity and trauma, and there is space to ask me anything before you decide.",
  },
  {
    id: "pedro-carvalho",
    name: "Pedro Carvalho",
    initials: "PC",
    pronouns: "he/him",
    creds: "Psychotherapist · APAF member",
    registration: "Assoc. Portuguesa de Análise Funcional · APAF 0742",
    langs: ["Portuguese", "English"],
    specs: ["Coming out", "Couples", "Trans-affirming"],
    format: "In-person · Príncipe Real",
    note: '"Queer myself. I have specific experience working with coming-out processes at all ages, trans identities, and queer couples and relationships."',
    photo:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop",
    avBg: "rgba(74,140,111,.16)",
    avCol: "var(--jade)",
    acceptingNew: true,
    years: 8,
    rate: "€60–80 / session",
    slidingScale: false,
    location: "Praça do Príncipe Real",
    availability: "Usually within 1–2 weeks",
    bio: [
      "I am a queer psychotherapist, and I work with coming-out processes at every age — the teenager, the forty-year-old, the person who waited until both parents had passed. There is no timeline that is too late or too early to be honest about who you are.",
      "I also see queer couples and trans clients, with specific experience around relationships, gender transition, and the quiet renegotiations that ripple out from both. My practice is in Príncipe Real, in Portuguese or English.",
    ],
    approach: [
      "Functional analytic",
      "Couples therapy",
      "Trans-affirming",
      "Gestalt",
    ],
    training: [
      "MSc Clinical Psychology — ISCTE Lisboa",
      "Advanced training in Couples & Relationship Therapy",
      "WPATH-informed gender-affirming care training",
    ],
    firstSession:
      "A 50-minute session, on your own or as a couple. We map out what you want to work on and how I can help — no pressure to keep going if it is not the right fit.",
  },
];

export const CRISIS: { name: string; num: string; note: string }[] = [
  {
    name: "SOS Voz Amiga",
    num: "213 544 545",
    note: "24h · Portuguese & English",
  },
  { name: "SNS 24", num: "808 24 24 24", note: "Health line · 24h" },
  { name: "ILGA Portugal", num: "213 887 239", note: "LGBTQ+ support line" },
  {
    name: "Samaritans (online)",
    num: "jo@samaritans.org",
    note: "Email · English · 24h response",
  },
];

export const EXPERIENCES: { title: string; text: string }[] = [
  {
    title: "Starting over in a new community",
    text: "Losing your queer social network when you move is a genuine grief. Building a new one takes time and feels unnatural at first. The people who've been here longest remember it — it does get easier, but the early months are hard and it's okay to say so.",
  },
  {
    title: "Navigating visibility in a new culture",
    text: "Lisbon is broadly safe but queer visibility works differently here. Some members feel more visible than at home; others feel less. Reading social situations in a second language or culture is exhausting and disorienting in ways that are hard to explain to people who haven't experienced it.",
  },
  {
    title: "The administrative grind",
    text: "Visas, NIF, AIMA, healthcare registration, bank accounts that won't open. The bureaucratic weight of building a life in a new country is a documented source of chronic stress. It's not weakness — it's a lot. Naming it as a mental health factor is valid.",
  },
  {
    title: "Trans and non-binary experiences in a new system",
    text: "Navigating healthcare, legal documents, and social situations as a trans or non-binary person in Portugal adds a specific layer of stress and labour. Portugal's legal framework is progressive but administrative reality varies. The Trans Hub has specific resources.",
  },
  {
    title: "Distance from family of origin",
    text: "Moving to another country often means physical distance from family — chosen or biological. For queer people whose family relationships are complicated or conditional, this distance can be both a relief and its own kind of grief. Both are real at the same time.",
  },
  {
    title: "Financial anxiety",
    text: "Lisbon's rising cost of living affects queer expats acutely. Housing insecurity, visa costs, and the pressure to perform a certain kind of queer expat life are all real stressors. The community talks about money honestly — the forum's economics thread is a good start.",
  },
];

export const SNS: { num: string; title: string; text: string }[] = [
  {
    num: "01",
    title: "Register with a GP first",
    text: "You need to be registered with a Centro de Saúde before accessing SNS mental health services. Register with your AR card or EU registration certificate and NISS number. Waiting lists for GP registration exist in some areas.",
  },
  {
    num: "02",
    title: "GP referral for psychology",
    text: "Your GP can refer you to a psychologist or psychiatrist through the SNS. Waiting times for the first appointment are typically 3–6 months. For urgent needs, explain severity clearly — this can speed up the referral.",
  },
  {
    num: "03",
    title: "Language matters",
    text: "SNS therapists and psychiatrists typically work in Portuguese. If your Portuguese is limited, private therapy in English is more practical for most expats. Online platforms (BetterHelp, Zenklub) offer English-speaking therapists at lower cost than Lisbon private rates.",
  },
  {
    num: "04",
    title: "Private rates in Lisbon",
    text: "Private therapy ranges from €50–120 per session. Some therapists offer sliding scale fees — it's always worth asking. Several therapists in our directory offer community member rates for QueerPulse members.",
  },
];

export const LANGS = ["all", "English", "Portuguese", "Spanish", "French"];
