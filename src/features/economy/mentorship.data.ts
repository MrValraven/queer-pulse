import { routes } from "../../app/routeMap";
import { memberName } from "../members/data/members";

export type Mode = "mentee" | "mentor";

export const VOLUNTEER = routes.volunteer;

export const STATS = [
  { n: "24", labelKey: "economy:mentorship.stat.activeMentors" },
  { n: "38", labelKey: "economy:mentorship.stat.matchesMade" },
  { n: "8", labelKey: "economy:mentorship.stat.areasOfFocus" },
];

export interface SideRow {
  label: string;
  value: string;
  jade?: boolean;
  accent?: boolean;
}

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

export interface Mentor {
  slug: string;
  initials: string;
  background: string;
  color: string;
  name: string;
  pronouns: string;
  role: string;
  areas: string[];
  cap: string;
  button: string;
  /** One-line on how they mentor. */
  quote: string;
  /** Why they're a good mentor. */
  why: string;
  /** What they charge. */
  charge: string;
  /** How to reach out / what to expect. */
  reach: string;
  fitFor: string[];
  fitNot: string[];
  /** Short line under the name: "Mentor · <focus>". */
  eyebrow: string;
  /** Languages pill, e.g. "PT · EN". */
  languages: string;
  /** Commitment pill, e.g. "Ongoing, informal". */
  commitment: string;
  /** Cadence pill, e.g. "Monthly + async". */
  cadence: string;
  /** First-person "how I mentor" paragraphs. */
  howParas: string[];
  /** Step-by-step process rows. */
  process: ProcessStep[];
  /** Sidebar headline price/terms. */
  price: { main: string; sub: string };
  /** Sidebar fact rows. */
  sideRows: SideRow[];
}

/** A mentor is full/waitlisted when their capacity blurb mentions a waitlist —
 *  the CTA label is derived from this boolean rather than string-comparing
 *  `btn`'s (English, content) value, so translating the button never breaks
 *  the open/waitlisted styling. */
export function isWaitlisted(mentor: Mentor): boolean {
  return mentor.cap.toLowerCase().includes("waitlist");
}

export const MENTORS: Mentor[] = [
  {
    slug: "ines-tavares",
    initials: "IT",
    background: "rgba(var(--accent-rgb),.15)",
    color: "var(--accent-ink)",
    name: memberName("ines"),
    pronouns: "she/her",
    role: "Graphic Designer",
    areas: ["Design career", "Freelancing", "Studio building"],
    cap: "1 open spot this quarter",
    button: "Request a match",
    quote: "I'll tell you what's working before I tell you what's not.",
    why: "Inês has built a studio from nothing and hired junior designers herself, so she knows both sides of the table. She mentors people who want to do good work slowly, and she's honest without being harsh.",
    charge:
      "Free for QueerPulse members — she takes one mentee a quarter as a way of giving back. A coffee or a drink when you meet is welcome, never expected.",
    reach:
      "Request a match through the mentorship form and mention you'd like Inês specifically. She replies within a few days and always does a short intro call before committing.",
    fitFor: [
      "Designers 0–4 years in who care about craft",
      "People freelancing or thinking about starting a studio",
      "Anyone switching into design from a related field",
    ],
    fitNot: [
      "You want help landing a corporate in-house role fast",
      "You only want portfolio polish with no conversation",
      "You haven't made any work yet — start, then come back",
    ],
    eyebrow: "Mentor · Design career & studio building",
    languages: "PT · EN",
    commitment: "Ongoing, informal",
    cadence: "Monthly + async",
    howParas: [
      "I take one mentee a quarter and I go slow on purpose. We meet monthly, usually in person over coffee, with a thread open between sessions for the small questions. I'll look at your actual work, not a tidied-up portfolio.",
      "I'll tell you what's working before I tell you what's not — but I will tell you both. I'm most useful to people who already make things and want to make them better, not to people still waiting to start.",
    ],
    process: [
      {
        number: "01",
        title: "Ask for me by name",
        description: "Request a match through the form and mention you'd like to work with me specifically. I read every one.",
      },
      {
        number: "02",
        title: "A short intro call",
        description: "Fifteen minutes, both ways. You see if I'm useful, I see what you're making. No pressure either side.",
      },
      {
        number: "03",
        title: "We pick one thing",
        description: "One project, one habit, one decision you're stuck on. We start there rather than trying to fix everything at once.",
      },
      {
        number: "04",
        title: "Monthly, over coffee",
        description: "We meet once a month, in person when we can, with a thread open in between for the small stuff.",
      },
    ],
    price: {
      main: "Free",
      sub: "one mentee a quarter · coffee on you welcome, never expected",
    },
    sideRows: [
      { label: "Capacity", value: "1 open spot this quarter" },
      { label: "Cost", value: "Free for members", jade: true },
      { label: "Format", value: "In person + async" },
      { label: "Cadence", value: "Monthly + a thread between" },
      { label: "Replies", value: "Within a few days" },
    ],
  },
  {
    slug: "rui-marcal",
    initials: "RM",
    background: "rgba(var(--plum-rgb),.12)",
    color: "var(--plum)",
    name: memberName("rui"),
    pronouns: "he/him",
    role: "Software Engineer",
    areas: ["Engineering career", "Junior to mid", "Open source"],
    cap: "2 open spots this quarter",
    button: "Request a match",
    quote:
      "Most engineering careers stall for non-engineering reasons. Let's fix those.",
    why: "Rui has gone from junior to senior and mentored open-source contributors along the way. He's good at the unglamorous parts — code-review habits, navigating teams, asking for the raise.",
    charge:
      "Free. Rui mentors two people a quarter and asks only that you pay it forward later.",
    reach:
      "Request a match and note your current level and what you're stuck on. He'll suggest a first call within a week.",
    fitFor: [
      "Junior-to-mid engineers wanting to level up",
      "Self-taught devs who want a sanity check",
      "People contributing to (or starting) open source",
    ],
    fitNot: [
      "You want help cramming for FAANG interviews",
      "You're at staff/principal level seeking peer review",
      "You haven't written much code yet",
    ],
    eyebrow: "Mentor · Engineering career",
    languages: "PT · EN",
    commitment: "Ongoing",
    cadence: "Async + calls",
    howParas: [
      "I mentor two people a quarter, mostly in writing with a call when it helps. Send me what you're stuck on — a PR, a decision, a conversation with your lead you're dreading — and we work it through async, then talk if we need to.",
      "Most engineering careers stall for non-engineering reasons: code-review habits, reading a team, asking for the raise. That unglamorous stuff is what I'm actually good at.",
    ],
    process: [
      {
        number: "01",
        title: "Tell me where you're stuck",
        description: "Request a match and note your level and the thing blocking you right now. Specific beats broad.",
      },
      {
        number: "02",
        title: "A first call within a week",
        description: "Thirty minutes to map what you want and whether I'm the right person. If I'm not, I'll say so.",
      },
      {
        number: "03",
        title: "Work it in writing",
        description: "Most of our back-and-forth is async — a PR, a plan, a hard message. You get a real answer, not a vibe.",
      },
      {
        number: "04",
        title: "Talk when it matters",
        description: "We jump on a call for the big decisions — a job move, a raise, a team you're struggling to read.",
      },
    ],
    price: {
      main: "Free",
      sub: "two mentees a quarter · pay it forward later",
    },
    sideRows: [
      { label: "Capacity", value: "2 open spots this quarter" },
      { label: "Cost", value: "Free", jade: true },
      { label: "Format", value: "Mostly async + calls" },
      { label: "Cadence", value: "As you need it" },
      { label: "Replies", value: "Within a week" },
    ],
  },
  {
    slug: "mariana-loucao",
    initials: "ML",
    background: "rgba(var(--jade-rgb),.15)",
    color: "var(--jade)",
    name: memberName("mariana"),
    pronouns: "she/her",
    role: "Clinical Psychologist",
    areas: ["Wellbeing at work", "Coming out professionally", "Identity"],
    cap: "Waitlist only right now",
    button: "Join waitlist",
    quote: "Work is where a lot of us hide. Mentorship can be where we stop.",
    why: "Mariana is a clinical psychologist who runs a peer-support group for queer professionals. She mentors on the human side of careers — burnout, coming out at work, identity and ambition.",
    charge:
      "Sliding-scale barter or free on the waitlist. Because this is close to her clinical work, she keeps numbers small and takes people as space opens.",
    reach:
      "Join the waitlist through the form. Mariana reaches out personally when a spot opens, usually within a month or two.",
    fitFor: [
      "Anyone navigating coming out professionally",
      "People facing burnout or a difficult workplace",
      "Those whose identity and work feel in tension",
    ],
    fitNot: [
      "You're in acute crisis — this isn't therapy; see Wellbeing",
      "You want tactical career-ladder advice only",
      "You need weekly clinical support",
    ],
    eyebrow: "Mentor · Wellbeing & identity at work",
    languages: "PT · EN",
    commitment: "Waitlist intake",
    cadence: "Regular check-ins",
    howParas: [
      "I keep this small and close to my clinical training, so I take people as space opens rather than all at once. When we work together, we go at the human side of your career — the parts that don't fit on a CV.",
      "This isn't therapy, and I'll be clear about that line. But if work is where you've been hiding — burnout, coming out, the gap between who you are and what you do — this is the room to stop.",
    ],
    process: [
      {
        number: "01",
        title: "Join the waitlist",
        description: "Add your name through the form. I reach out personally when a spot opens, usually within a month or two.",
      },
      {
        number: "02",
        title: "A gentle first conversation",
        description: "We start slow. You tell me what's heavy right now; I tell you honestly whether I'm the right support.",
      },
      {
        number: "03",
        title: "We name the real thing",
        description: "Often the career question sits on top of something else. We take the time to find what it actually is.",
      },
      {
        number: "04",
        title: "Regular, unhurried check-ins",
        description: "We meet on a rhythm that suits you, with clear edges around what this is and what it isn't.",
      },
    ],
    price: {
      main: "Free",
      sub: "waitlist · sliding-scale barter if you'd like to give back",
    },
    sideRows: [
      { label: "Capacity", value: "Waitlist only right now", accent: true },
      { label: "Cost", value: "Free / sliding scale", jade: true },
      { label: "Format", value: "Video or in person" },
      { label: "Cadence", value: "Unhurried" },
      { label: "Replies", value: "When a spot opens" },
    ],
  },
  {
    slug: "carla-nogueira",
    initials: "CN",
    background: "rgba(var(--accent-rgb),.12)",
    color: "var(--accent-ink)",
    name: memberName("carla"),
    pronouns: "she/her",
    role: "Product Manager",
    areas: ["Product career", "Fintech", "Switching industries"],
    cap: "1 open spot this quarter",
    button: "Request a match",
    quote:
      "I switched industries twice. I know how scary and how doable it is.",
    why: "Carla is a product manager who moved into fintech from a different field, so she mentors people mid-switch. She's structured, direct, and good at turning a vague goal into a plan.",
    charge:
      "Free for one mentee a quarter. She occasionally asks for honest feedback on something she's building in return.",
    reach:
      "Request a match and tell her where you are and where you want to be. She'll set up a 30-minute call to see if it's a fit.",
    fitFor: [
      "People moving into product from another field",
      "Early PMs wanting structure and direction",
      "Anyone eyeing fintech or scale-ups",
    ],
    fitNot: [
      "You want deep technical or design mentorship",
      "You're a senior PM seeking peer sparring",
      "You're not ready to do homework between calls",
    ],
    eyebrow: "Mentor · Product career & switching fields",
    languages: "PT · EN",
    commitment: "Quarterly intake",
    cadence: "Monthly + homework",
    howParas: [
      "I take one mentee a quarter and I like structure. We start by turning your vague goal into an actual plan, then meet to keep you honest about it. Expect a little homework between calls — that's where the work happens.",
      "I switched industries twice, so I know how scary and how doable a move is. I'm direct, I'm organised, and I'm best for people who want a map, not just encouragement.",
    ],
    process: [
      {
        number: "01",
        title: "Tell me where you are and where you want to be",
        description: "Request a match with the gap you're trying to cross. The clearer the gap, the faster we move.",
      },
      {
        number: "02",
        title: "A 30-minute fit call",
        description: "We check the chemistry and whether I can actually help. If product isn't really your path, I'll tell you kindly.",
      },
      {
        number: "03",
        title: "We build the plan",
        description: "We turn the goal into steps with dates. You leave the first session knowing exactly what's next.",
      },
      {
        number: "04",
        title: "Monthly, with homework",
        description: "We meet monthly to review what you did and adjust. Between calls, you do the reps.",
      },
    ],
    price: {
      main: "Free",
      sub: "one mentee a quarter · honest feedback in return welcome",
    },
    sideRows: [
      { label: "Capacity", value: "1 open spot this quarter" },
      { label: "Cost", value: "Free", jade: true },
      { label: "Format", value: "Video" },
      { label: "Cadence", value: "Monthly + homework" },
      { label: "Replies", value: "Sets up a fit call" },
    ],
  },
  {
    slug: "sofia-andrade",
    initials: "SA",
    background: "rgba(var(--jade-rgb),.15)",
    color: "var(--jade)",
    name: memberName("sofia"),
    pronouns: "she/her",
    role: "Documentary Filmmaker",
    areas: ["Filmmaking", "Creative practice", "Arts funding"],
    cap: "2 open spots this quarter",
    button: "Request a match",
    quote: "Funding and finishing are the hard parts. Making is the easy bit.",
    why: "Sofia makes documentaries and has navigated grants, co-productions, and the long middle of a creative project. She mentors people stuck in the part nobody warns you about.",
    charge:
      "Barter — she'll mentor in exchange for help on her own projects (research, transcription, a second pair of eyes). Money never changes hands.",
    reach:
      "Request a match and tell her what you're working on. She prefers to meet in person at least once early on.",
    fitFor: [
      "Filmmakers and creatives mid-project",
      "People applying for arts funding",
      "Anyone stuck in the unglamorous middle of a project",
    ],
    fitNot: [
      "You want help getting started from zero",
      "You need technical post-production tutoring",
      "You're looking for industry introductions only",
    ],
    eyebrow: "Mentor · Filmmaking & creative practice",
    languages: "PT · EN",
    commitment: "Project-length",
    cadence: "Through the project",
    howParas: [
      "I mentor two people at a time, and it works best as a trade — I help with your project, you lend a hand on mine. Research, transcription, a second pair of eyes. Money never changes hands between us.",
      "Making is the easy part. Funding and finishing are where people stall, and that's exactly the stretch I've learned to survive. I'll meet you in the unglamorous middle.",
    ],
    process: [
      {
        number: "01",
        title: "Tell me what you're making",
        description: "Request a match with the project and where it's stuck. I care more about what it is than how far along it is.",
      },
      {
        number: "02",
        title: "We meet in person, at least once",
        description: "I like to start face to face if we can — a coffee, a walk. Some things only come out that way.",
      },
      {
        number: "03",
        title: "We set the trade",
        description: "We agree what I'll help with and what you'll help me with. Fair, light, and written down so neither of us guesses.",
      },
      {
        number: "04",
        title: "Through the long middle",
        description: "We check in on a rhythm through the hard part — funding, structure, the will to finish.",
      },
    ],
    price: {
      main: "Barter",
      sub: "a fair trade of time · no money either way",
    },
    sideRows: [
      { label: "Capacity", value: "2 open spots this quarter" },
      { label: "Cost", value: "Barter", jade: true },
      { label: "Format", value: "In person + video" },
      { label: "Cadence", value: "Through the project" },
      { label: "Replies", value: "Prefers to meet early" },
    ],
  },
  {
    slug: "raquel-baptista",
    initials: "RB",
    background: "rgba(var(--violet-rgb),.12)",
    color: "var(--violet)",
    name: memberName("raquel-baptista"),
    pronouns: "she/her",
    role: "Lawyer",
    areas: ["Legal career", "Rights navigation", "Advocacy"],
    cap: "1 open spot this quarter",
    button: "Request a match",
    quote: "Knowing your rights is half of using them.",
    why: "Raquel is a lawyer who does rights-navigation and advocacy work. She mentors people thinking about legal careers and members trying to understand their own rights at work or in the system.",
    charge:
      "Free. Raquel takes one mentee a quarter and treats it as part of her advocacy.",
    reach:
      "Request a match through the form. For urgent rights issues, she'll point you to Legal Resources rather than wait for a match.",
    fitFor: [
      "People considering or early in a legal career",
      "Those navigating rights at work or with the state",
      "Advocacy-minded members",
    ],
    fitNot: [
      "You need urgent legal representation — see Legal Resources",
      "You want help with a specific live case",
      "You're after billable legal advice",
    ],
    eyebrow: "Mentor · Legal career & rights navigation",
    languages: "PT · EN",
    commitment: "Quarterly intake",
    cadence: "As questions come",
    howParas: [
      "I take one mentee a quarter and treat it as part of my advocacy. We work on the shape of a legal career, or on understanding rights you're trying to use — at work, with the state, in your own life.",
      "Knowing your rights is half of using them, so I'll help you see the map clearly. But if something's urgent or live, I'll point you straight to Legal Resources rather than make you wait for a match.",
    ],
    process: [
      {
        number: "01",
        title: "Request a match",
        description: "Tell me whether you're thinking about a legal career or trying to understand a right. Both are welcome.",
      },
      {
        number: "02",
        title: "A first call to place you",
        description: "We work out what you actually need — mentorship, or a resource that will help you faster.",
      },
      {
        number: "03",
        title: "Understanding, not dependence",
        description: "The goal is that you leave able to read the situation yourself, not needing me to read it for you.",
      },
      {
        number: "04",
        title: "Ongoing, as questions come",
        description: "We keep a light rhythm and you reach out as the real questions arrive.",
      },
    ],
    price: {
      main: "Free",
      sub: "one mentee a quarter · part of the advocacy work",
    },
    sideRows: [
      { label: "Capacity", value: "1 open spot this quarter" },
      { label: "Cost", value: "Free", jade: true },
      { label: "Format", value: "Video + email" },
      { label: "Cadence", value: "As questions come" },
      {
        label: "Urgent?",
        value: "Points you to Legal Resources",
        accent: true,
      },
    ],
  },
];

export interface MatchArea {
  id: string;
  labelKey: string;
}

export const MENTEE_AREAS: MatchArea[] = [
  {
    id: "career-direction",
    labelKey: "economy:mentorship.matchArea.careerDirection",
  },
  {
    id: "coming-out-professionally",
    labelKey: "economy:mentorship.matchArea.comingOutProfessionally",
  },
  {
    id: "creative-practice",
    labelKey: "economy:mentorship.matchArea.creativePractice",
  },
  {
    id: "starting-business",
    labelKey: "economy:mentorship.matchArea.startingBusiness",
  },
  {
    id: "difficult-workplace",
    labelKey: "economy:mentorship.matchArea.difficultWorkplace",
  },
  { id: "new-to-lisbon", labelKey: "economy:mentorship.matchArea.newToLisbon" },
  {
    id: "mental-health-at-work",
    labelKey: "economy:mentorship.matchArea.mentalHealthAtWork",
  },
  {
    id: "legal-rights-issues",
    labelKey: "economy:mentorship.matchArea.legalRightsIssues",
  },
];
/** A single control in a match-flow step: a text/email input, a select, or a
 *  textarea. The controls stay placeholder-labelled (as the prototype's form
 *  is), so `placeholderKey` supplies both the placeholder and the aria-label. */
export type MatchFieldKind = "text" | "email" | "select" | "textarea";

export interface MatchField {
  kind: MatchFieldKind;
  /** i18n key used for both the placeholder and the accessible name. */
  placeholderKey: string;
  /** Option label keys for a `select` (the placeholder is the empty option). */
  optionKeys?: string[];
  rows?: number;
}

export interface MatchStep {
  eyebrowKey: string;
  titleKey: string;
  /** Sub-copy shown before the step content. */
  leadKey?: string;
  /** Sub-copy shown after the step content. */
  trailingKey?: string;
  /** Multi-select area chips for this step. */
  areas?: MatchArea[];
  /** Text/select/textarea controls for this step. */
  fields?: MatchField[];
}

export interface MatchFlow {
  steps: MatchStep[];
  /** i18n key for the toast fired once the flow is submitted. */
  toastKey: string;
}

export const MENTOR_AREAS: MatchArea[] = [
  {
    id: "career-direction",
    labelKey: "economy:mentorship.matchArea.careerDirection",
  },
  {
    id: "coming-out-professionally",
    labelKey: "economy:mentorship.matchArea.comingOutProfessionally",
  },
  {
    id: "creative-practice",
    labelKey: "economy:mentorship.matchArea.creativePractice",
  },
  {
    id: "starting-business",
    labelKey: "economy:mentorship.matchArea.startingBusiness",
  },
  {
    id: "difficult-workplace",
    labelKey: "economy:mentorship.matchArea.difficultWorkplace",
  },
  {
    id: "settling-in-lisbon",
    labelKey: "economy:mentorship.matchArea.settlingInLisbon",
  },
  {
    id: "mental-health-at-work",
    labelKey: "economy:mentorship.matchArea.mentalHealthAtWork",
  },
  {
    id: "legal-rights-navigation",
    labelKey: "economy:mentorship.matchArea.legalRightsNavigation",
  },
];

/** The two match ladders (mentee: 3 steps, mentor: 2), described as data so a
 *  single renderer drives both instead of two hand-written ladders. */
export const MATCH_FLOWS: Record<Mode, MatchFlow> = {
  mentee: {
    toastKey: "economy:mentorship.mentee.toastSubmitted",
    steps: [
      {
        eyebrowKey: "economy:mentorship.mentee.step1.eyebrow",
        titleKey: "economy:mentorship.mentee.step1.title",
        leadKey: "economy:mentorship.mentee.step1.sub",
        areas: MENTEE_AREAS,
      },
      {
        eyebrowKey: "economy:mentorship.mentee.step2.eyebrow",
        titleKey: "economy:mentorship.mentee.step2.title",
        fields: [
          {
            kind: "text",
            placeholderKey: "economy:mentorship.mentee.step2.namePlaceholder",
          },
          {
            kind: "text",
            placeholderKey: "economy:mentorship.mentee.step2.rolePlaceholder",
          },
          {
            kind: "select",
            placeholderKey:
              "economy:mentorship.mentee.step2.frequencyPlaceholder",
            optionKeys: [
              "economy:mentorship.mentee.step2.frequency.monthly",
              "economy:mentorship.mentee.step2.frequency.twiceMonthly",
              "economy:mentorship.mentee.step2.frequency.asNeeded",
            ],
          },
          {
            kind: "textarea",
            placeholderKey: "economy:mentorship.mentee.step2.notePlaceholder",
            rows: 3,
          },
        ],
      },
      {
        eyebrowKey: "economy:mentorship.mentee.step3.eyebrow",
        titleKey: "economy:mentorship.mentee.step3.title",
        trailingKey: "economy:mentorship.mentee.step3.sub",
        fields: [
          {
            kind: "email",
            placeholderKey: "economy:mentorship.mentee.step3.emailPlaceholder",
          },
        ],
      },
    ],
  },
  mentor: {
    toastKey: "economy:mentorship.mentor.toastSubmitted",
    steps: [
      {
        eyebrowKey: "economy:mentorship.mentor.step1.eyebrow",
        titleKey: "economy:mentorship.mentor.step1.title",
        leadKey: "economy:mentorship.mentor.step1.sub",
        areas: MENTOR_AREAS,
      },
      {
        eyebrowKey: "economy:mentorship.mentor.step2.eyebrow",
        titleKey: "economy:mentorship.mentor.step2.title",
        fields: [
          {
            kind: "text",
            placeholderKey: "economy:mentorship.mentor.step2.namePlaceholder",
          },
          {
            kind: "select",
            placeholderKey:
              "economy:mentorship.mentor.step2.menteesPlaceholder",
            optionKeys: [
              "economy:mentorship.mentor.step2.mentees.one",
              "economy:mentorship.mentor.step2.mentees.two",
              "economy:mentorship.mentor.step2.mentees.three",
            ],
          },
          {
            kind: "select",
            placeholderKey: "economy:mentorship.mentor.step2.formatPlaceholder",
            optionKeys: [
              "economy:mentorship.mentor.step2.format.inPersonLisbon",
              "economy:mentorship.mentor.step2.format.video",
              "economy:mentorship.mentor.step2.format.either",
            ],
          },
          {
            kind: "email",
            placeholderKey: "economy:mentorship.mentor.step2.emailPlaceholder",
          },
        ],
      },
    ],
  },
};
