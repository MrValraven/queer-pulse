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
  {
    id: "ines-pereira",
    name: "Dr. Inês Pereira",
    initials: "IP",
    pronouns: "she/her",
    creds: "Psychologist · OPP registered",
    registration: "Ordem dos Psicólogos Portugueses · OPP 14826",
    langs: ["Portuguese", "English", "Spanish"],
    specs: ["Trans-affirming", "Minority stress", "Relationships"],
    format: "In-person & online · Anjos",
    note: "\"I don't treat being queer as the problem. I treat what the world does to you for being queer — and what you'd like to do about it.\"",
    photo:
      "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?q=80&w=600&auto=format&fit=crop",
    avBg: "rgba(232,119,90,.16)",
    avCol: "var(--accent-ink)",
    acceptingNew: true,
    years: 12,
    rate: "€25–60 / session",
    slidingScale: true,
    location: "Largo do Intendente, Anjos",
    availability: "Free 20-min intro call, usually within a week",
    bio: [
      "I don't treat being queer as the problem. I treat what the world does to you for being queer — the hypervigilance, the family weather, the low-grade fear that never quite switches off — and what you'd like to do about it.",
      "I trained in psychodynamic work and CBT, I'm certified in EMDR for trauma, and I work with a politically literate lens: some of what you're feeling isn't a disorder, it's a reasonable response to conditions. Treating it that way is part of the work.",
    ],
    approach: ["Person-centred", "Psychodynamic", "CBT", "EMDR"],
    training: [
      "MSc Clinical Psychology — Universidade de Lisboa",
      "WPATH-certified gender-affirming care",
      "EMDR-trained for trauma work",
    ],
    firstSession:
      "A free 20-minute video call — no charge, no pressure. You decide if it feels like a fit, and I'll tell you honestly if I'm not the right person.",
  },
];

/**
 * i18n Pattern A. Real-world helpline names (SOS Voz Amiga, SNS 24, ILGA
 * Portugal, Samaritans) are proper nouns and stay untranslated; `noteKey`
 * (the descriptive hours/format text) is chrome and resolved via `t()`.
 */
export const CRISIS: { name: string; num: string; noteKey: string }[] = [
  {
    name: "SOS Voz Amiga",
    num: "213 544 545",
    noteKey: "resources:mentalHealth.crisisLine.sosVozAmiga.note",
  },
  {
    name: "SNS 24",
    num: "808 24 24 24",
    noteKey: "resources:mentalHealth.crisisLine.sns24.note",
  },
  {
    name: "ILGA Portugal",
    num: "213 887 239",
    noteKey: "resources:mentalHealth.crisisLine.ilga.note",
  },
  {
    name: "Samaritans (online)",
    num: "jo@samaritans.org",
    noteKey: "resources:mentalHealth.crisisLine.samaritans.note",
  },
];

/** i18n Pattern A — platform-authored guidance chrome, resolved via `t()`. */
export const EXPERIENCES: { titleKey: string; textKey: string }[] = [
  {
    titleKey: "resources:mentalHealth.experience.newCommunity.title",
    textKey: "resources:mentalHealth.experience.newCommunity.text",
  },
  {
    titleKey: "resources:mentalHealth.experience.visibility.title",
    textKey: "resources:mentalHealth.experience.visibility.text",
  },
  {
    titleKey: "resources:mentalHealth.experience.admin.title",
    textKey: "resources:mentalHealth.experience.admin.text",
  },
  {
    titleKey: "resources:mentalHealth.experience.transNonbinary.title",
    textKey: "resources:mentalHealth.experience.transNonbinary.text",
  },
  {
    titleKey: "resources:mentalHealth.experience.distance.title",
    textKey: "resources:mentalHealth.experience.distance.text",
  },
  {
    titleKey: "resources:mentalHealth.experience.financial.title",
    textKey: "resources:mentalHealth.experience.financial.text",
  },
];

export const SNS: { num: string; titleKey: string; textKey: string }[] = [
  {
    num: "01",
    titleKey: "resources:mentalHealth.sns.step1.title",
    textKey: "resources:mentalHealth.sns.step1.text",
  },
  {
    num: "02",
    titleKey: "resources:mentalHealth.sns.step2.title",
    textKey: "resources:mentalHealth.sns.step2.text",
  },
  {
    num: "03",
    titleKey: "resources:mentalHealth.sns.step3.title",
    textKey: "resources:mentalHealth.sns.step3.text",
  },
  {
    num: "04",
    titleKey: "resources:mentalHealth.sns.step4.title",
    textKey: "resources:mentalHealth.sns.step4.text",
  },
];

export const LANGS = ["all", "English", "Portuguese", "Spanish", "French"];
