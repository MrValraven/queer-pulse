export interface JobDetail {
  /** Display category for breadcrumb + sidebar (e.g. "Design"). */
  category: string;
  posted: string;
  about: string[];
  dayToDay: string[];
  lookingFor: string[];
  offer: string[];
  aboutCompany: string;
  reviewerNote: string;
}

export interface Job {
  slug: string;
  cat: string;
  qr: boolean;
  qrLabel: string;
  org: string;
  logo: string;
  logoBg: string;
  logoText: string;
  title: string;
  type: string;
  location: string;
  salary: string;
  deadline: string;
  desc: string;
  tags: string[];
  detail: JobDetail;
}

export const JOBS: Job[] = [
  {
    slug: "junior-graphic-designer",
    cat: "design",
    qr: true,
    qrLabel: "Queer-run",
    org: "Atelier Pulso",
    logo: "AP",
    logoBg: "rgba(var(--accent-rgb),.14)",
    logoText: "var(--accent-ink)",
    title: "Junior Graphic Designer",
    type: "Full-time",
    location: "Príncipe Real · In-person",
    salary: "€1,200–1,500/mo",
    deadline: "30 Jun",
    desc: "Inês is building out her studio. Looking for a junior designer who cares about type, editorial systems, and making beautiful things. Training provided.",
    tags: ["Graphic design", "Type", "Branding"],
    detail: {
      category: "Design",
      posted: "Posted 1 June 2026",
      about: [
        "Inês Mateus is building out Atelier Pulso, her design studio in Príncipe Real. She's looking for a junior graphic designer who cares deeply about type, publication design, and the craft of making things beautiful. You'll be working closely with Inês from day one — this is a small studio, not a junior-on-production setup.",
        "The studio is queer-run and works deliberately slowly. Clients are mostly independent: small publishers, community organisations, independent galleries, and the occasional mid-size company that has earned the studio's trust. The work is varied, the standards are high, and you'll be trusted with real creative responsibility earlier than you might expect.",
      ],
      dayToDay: [
        "Typography and layout for editorial clients — books, zines, annual reports, print publications",
        "Brand identity work for independent and community projects, from concept through to final files",
        "Production of print-ready files and management of relationships with Lisbon printers",
        "Occasional web design and motion projects, in collaboration with studio partners",
        "Participation in client presentations and creative reviews with Inês",
      ],
      lookingFor: [
        "A portfolio that shows you care about craft — not just decoration, but structure, hierarchy, and intention",
        "1–2 years of professional or equivalent design experience; we'll look at strong student work too",
        "Fluent in Adobe InDesign, Illustrator, and Photoshop; Figma is a bonus",
        "Genuine curiosity about print production, paper, and the physicality of designed objects",
        "Comfortable with direct feedback and working in a small team where everyone's voice matters",
      ],
      offer: [
        "€1,200–1,500 per month depending on experience, with a structured salary review at 6 months",
        "Flexible hours around a broadly 10–18 studio day; we're not precious about start times",
        "A real mentorship — not task assignment. Inês will invest time in your development",
        "A working environment that doesn’t require you to hide or code-switch",
        "Participation in pro-bono community projects — work you can be proud of for the right reasons",
      ],
      aboutCompany:
        "Founded by Inês Mateus in 2022, Atelier Pulso is a small design studio in Príncipe Real specialising in editorial design, brand identity, and publication work for independent clients. We work slowly, intentionally, and with care for the objects we make. We are queer-run and believe that makes our work better, our relationships more honest, and our studio a more human place to spend your days.",
      reviewerNote:
        "Applications are reviewed by Inês personally. No recruiter, no automated screening. She reads everything.",
    },
  },
  {
    slug: "community-outreach-coordinator",
    cat: "community",
    qr: true,
    qrLabel: "Queer-led",
    org: "ILGA Portugal",
    logo: "IL",
    logoBg: "rgba(var(--violet-rgb),.12)",
    logoText: "var(--violet)",
    title: "Community Outreach Coordinator",
    type: "Full-time",
    location: "Intendente · In-person",
    salary: "€1,100–1,300/mo",
    deadline: "15 Jul",
    desc: "Coordinate ILGA Portugal's community outreach programmes across Lisbon. Manage volunteers, build partnerships. Portuguese required.",
    tags: ["Community", "Outreach", "Advocacy"],
    detail: {
      category: "Community",
      posted: "Posted 4 June 2026",
      about: [
        "ILGA Portugal is looking for a Community Outreach Coordinator to run our programmes across Lisbon — from neighbourhood drop-ins to partnerships with schools, clinics, and local associations. This is a public-facing role for someone who is as comfortable in a community centre as in a coordination meeting.",
        "You would join a small, tightly-knit team that has been doing this work for decades. The role is grounded in trust: with volunteers, with the people who walk through our door, and with the partner organisations we hold accountable.",
      ],
      dayToDay: [
        "Plan and run regular outreach events and drop-in sessions across Lisbon neighbourhoods",
        "Recruit, train, and support a rotating team of volunteers",
        "Build and maintain partnerships with clinics, schools, and community associations",
        "Track programme reach and write short reports for funders",
      ],
      lookingFor: [
        "Fluent Portuguese and working English",
        "Experience coordinating volunteers or community programmes",
        "Calm, organised, and genuinely good with people in difficult moments",
        "Lived understanding of the issues facing LGBTQ+ people in Portugal",
      ],
      offer: [
        "€1,100–1,300 per month, full-time, permanent after a 3-month period",
        "25 days holiday plus public holidays",
        "Structured supervision and a training budget",
        "Meaningful work inside an organisation with real institutional weight",
      ],
      aboutCompany:
        "ILGA Portugal is the country’s longest-running LGBTI+ rights organisation, founded in 1995. Based in Intendente, it runs advocacy, legal support, and community programmes nationwide.",
      reviewerNote:
        "Applications are read by the programmes team. We respond to everyone, whether or not we move forward.",
    },
  },
  {
    slug: "backend-engineer",
    cat: "tech",
    qr: false,
    qrLabel: "Queer-inclusive",
    org: "A Lisbon Fintech",
    logo: "FT",
    logoBg: "rgba(var(--plum-rgb),.08)",
    logoText: "var(--plum)",
    title: "Backend Engineer (Rust/Go)",
    type: "Full-time · Hybrid",
    location: "Marvila · Hybrid",
    salary: "€2,800–3,800/mo",
    deadline: "Open",
    desc: "Growing Lisbon fintech with a strong LGBTQ+ ERG and a genuine commitment to inclusion. Looking for a mid-level backend engineer.",
    tags: ["Backend", "Rust", "Go", "Fintech"],
    detail: {
      category: "Tech",
      posted: "Posted 28 May 2026",
      about: [
        "A growing Lisbon fintech is hiring a mid-level backend engineer to work on the core of its payments platform. The stack is Rust and Go, the team is small and senior, and the problems are the genuinely hard kind: correctness, latency, and money that has to add up.",
        "This listing is on QueerPulse because the company has a real LGBTQ+ employee resource group, inclusive benefits, and a track record we have checked rather than taken on faith.",
      ],
      dayToDay: [
        "Design and build services in Rust and Go for the payments core",
        "Own features end to end, from design doc to on-call",
        "Work closely with product on tradeoffs around correctness and speed",
        "Help keep the codebase boring, observable, and well-tested",
      ],
      lookingFor: [
        "3+ years building backend systems in production",
        "Strong with at least one of Rust or Go, and willing to learn the other",
        "Care about reliability, testing, and clear writing",
        "No fintech background required — payments knowledge is a bonus, not a gate",
      ],
      offer: [
        "€2,800–3,800 per month depending on experience, plus equity",
        "Hybrid: two anchor days in Marvila, the rest flexible",
        "Inclusive health cover and a real, funded LGBTQ+ ERG",
        "A senior team that reviews code kindly and ships carefully",
      ],
      aboutCompany:
        "A Series-A fintech headquartered in Marvila, building cross-border payments infrastructure for small businesses. Around 40 people, half of them engineers.",
      reviewerNote:
        "First review is by an engineer, not a recruiter. Expect a short take-home rather than a whiteboard.",
    },
  },
  {
    slug: "programme-coordinator",
    cat: "arts",
    qr: true,
    qrLabel: "Queer-run",
    org: "Rainbow Arts Collective",
    logo: "RA",
    logoBg: "rgba(var(--accent-rgb),.1)",
    logoText: "var(--accent-ink)",
    title: "Programme Coordinator (Part-time)",
    type: "Part-time",
    location: "Lisbon · Flexible",
    salary: "€700/mo",
    deadline: "20 Jun",
    desc: "Help coordinate Rainbow Arts Collective exhibitions, events, and residencies. 20 hours per week.",
    tags: ["Arts admin", "Programming", "Events"],
    detail: {
      category: "Arts & Culture",
      posted: "Posted 30 May 2026",
      about: [
        "Rainbow Arts Collective is looking for a part-time Programme Coordinator to keep our exhibitions, events, and residencies running smoothly. Twenty hours a week, flexibly arranged, with a couple of fixed days around install and opening nights.",
        "This is an organising role for someone who loves art but is energised by logistics — the spreadsheets, the artist emails, the install schedule — as much as the work on the walls.",
      ],
      dayToDay: [
        "Coordinate exhibition timelines, install, and de-install",
        "Be the main point of contact for participating artists",
        "Run the events calendar and openings logistics",
        "Keep budgets, contracts, and the residency schedule in order",
      ],
      lookingFor: [
        "Experience coordinating events or arts programmes",
        "Unflappable organiser who enjoys making other people’s work happen",
        "Comfortable with artists, volunteers, and the occasional crisis",
        "Based in Lisbon and able to be on-site for key dates",
      ],
      offer: [
        "€700 per month for 20 hours a week",
        "Genuinely flexible scheduling around fixed event dates",
        "Deep involvement in Lisbon’s queer arts scene",
        "A warm, collaborative collective that shares credit",
      ],
      aboutCompany:
        "Rainbow Arts Collective is a queer-run arts organisation programming exhibitions, residencies, and events across Lisbon, with a focus on emerging LGBTQ+ artists.",
      reviewerNote:
        "A short note about why this role, more than a formal cover letter, is what we’re reading for.",
    },
  },
  {
    slug: "peer-support-facilitator",
    cat: "care",
    qr: true,
    qrLabel: "Community org",
    org: "Opus Diversus",
    logo: "OD",
    logoBg: "rgba(var(--jade-rgb),.12)",
    logoText: "var(--jade)",
    title: "Peer Support Facilitator",
    type: "Part-time",
    location: "Lisbon · In-person",
    salary: "€900/mo",
    deadline: "Open",
    desc: "Facilitate peer support groups for LGBTQ+ people in Lisbon. Lived experience matters more than formal qualifications.",
    tags: ["Mental health", "Peer support", "Facilitation"],
    detail: {
      category: "Care",
      posted: "Posted 2 June 2026",
      about: [
        "Opus Diversus runs peer support groups for LGBTQ+ people across Lisbon, and we are looking for a part-time facilitator to hold a regular weekly group and a few one-off sessions. This is care work, and we treat it as such — with supervision, boundaries, and support for you.",
        "We hire for lived experience and the ability to hold a room, not for a clinical CV. Training is provided, and you will never run a group alone before you are ready.",
      ],
      dayToDay: [
        "Facilitate a weekly peer support group, in person",
        "Hold space safely and refer on when something is beyond peer support",
        "Attend regular supervision and team check-ins",
        "Help shape the format of new groups as needs emerge",
      ],
      lookingFor: [
        "Lived experience of the LGBTQ+ community and its mental-health realities",
        "Warmth, steadiness, and good boundaries",
        "Portuguese essential; other languages welcome",
        "No formal qualification required — we train you",
      ],
      offer: [
        "€900 per month, part-time",
        "Full training and ongoing clinical supervision",
        "A team that takes your wellbeing as seriously as the group’s",
        "Flexible scheduling around fixed group times",
      ],
      aboutCompany:
        "Opus Diversus is a Lisbon community organisation providing peer support, mental-health navigation, and advocacy for LGBTQ+ people.",
      reviewerNote:
        "We read every application ourselves and reply to all of them, usually within a week.",
    },
  },
  {
    slug: "bookseller",
    cat: "food",
    qr: true,
    qrLabel: "Queer-run",
    org: "Livraria Devagar",
    logo: "LB",
    logoBg: "rgba(var(--accent-rgb),.1)",
    logoText: "var(--accent-ink)",
    title: "Bookseller · Part-time",
    type: "Part-time",
    location: "Anjos · In-person",
    salary: "€800/mo",
    deadline: "15 Jul",
    desc: "Opening September 2026. We're looking for someone who loves queer literature and wants to help build something new in Anjos.",
    tags: ["Bookshop", "Retail", "Community"],
    detail: {
      category: "Food & Retail",
      posted: "Posted 5 June 2026",
      about: [
        "Livraria Devagar is a new queer bookshop opening in Anjos in September 2026, and we want a part-time bookseller to help us open the doors and shape what the shop becomes. You would be one of the first people in the room, which means real say in the sections, the events, and the feel of the place.",
        "This is retail, so there are tills and shelves and slow afternoons — but it is also community work, and the right person will love both halves equally.",
      ],
      dayToDay: [
        "Recommend books and look after customers on the floor",
        "Run the till, receive stock, and keep sections tidy and loved",
        "Help plan and host the occasional reading or launch",
        "Contribute to buying decisions, especially in queer literature",
      ],
      lookingFor: [
        "A real love of books, and queer literature in particular",
        "Warm, unhurried, and good with people",
        "Reliable for weekend and some evening shifts",
        "Retail experience is a bonus, not a requirement",
      ],
      offer: [
        "€800 per month, part-time",
        "A founding role in a brand-new shop",
        "Staff discount and first read of the new stock",
        "A workplace built by and for the community",
      ],
      aboutCompany:
        "Livraria Devagar is a queer-run independent bookshop opening in Anjos in 2026, focused on LGBTQ+ literature, translation, and small presses.",
      reviewerNote:
        "Tell us about a book that mattered to you — that is the part of the application we read first.",
    },
  },
];

export const JOB_FILTERS = [
  { value: "all", label: "All roles" },
  { value: "design", label: "Design" },
  { value: "tech", label: "Tech" },
  { value: "arts", label: "Arts & Culture" },
  { value: "care", label: "Care" },
  { value: "food", label: "Food" },
  { value: "community", label: "Community" },
];

export const EMPLOYERS = [
  {
    logo: "AP",
    bg: "rgba(var(--accent-rgb),.12)",
    text: "var(--accent-ink)",
    name: "Atelier Pulso",
    type: "Design studio · Príncipe Real",
    qr: true,
    badge: "Queer-run",
    badgeBg: "rgba(var(--accent-rgb),.1)",
    badgeText: "var(--accent-ink)",
  },
  {
    logo: "QP",
    bg: "rgba(var(--jade-rgb),.12)",
    text: "var(--jade)",
    name: "QueerPulse",
    type: "Community platform · Lisbon",
    qr: true,
    badge: "Queer-run",
    badgeBg: "rgba(var(--jade-rgb),.1)",
    badgeText: "var(--jade)",
  },
  {
    logo: "IL",
    bg: "rgba(var(--violet-rgb),.1)",
    text: "var(--violet)",
    name: "ILGA Portugal",
    type: "NGO · Intendente",
    qr: true,
    badge: "Queer-led",
    badgeBg: "rgba(var(--violet-rgb),.08)",
    badgeText: "var(--violet)",
  },
  {
    logo: "OD",
    bg: "rgba(var(--plum-rgb),.08)",
    text: "var(--plum)",
    name: "Opus Diversus",
    type: "Mental health · Lisbon",
    qr: false,
    badge: "Community org",
    badgeBg: "rgba(var(--plum-rgb),.06)",
    badgeText: "var(--plum)",
  },
  {
    logo: "LB",
    bg: "rgba(var(--accent-rgb),.1)",
    text: "var(--accent-ink)",
    name: "Livraria Devagar",
    type: "Bookshop · Anjos",
    qr: true,
    badge: "Queer-friendly",
    badgeBg: "rgba(var(--accent-rgb),.1)",
    badgeText: "var(--accent-ink)",
  },
];
