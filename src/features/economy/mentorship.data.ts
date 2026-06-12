import { routes } from '../../app/routeMap'
import { memberName } from '../members/data/members'

export type Mode = 'mentee' | 'mentor'

export const VOLUNTEER = routes.volunteer

export const STATS = [
  { n: '24', l: 'Active mentors in the network' },
  { n: '38', l: 'Matches made so far' },
  { n: '8', l: 'Areas of focus' },
]

export interface Mentor {
  slug: string
  initials: string
  bg: string
  color: string
  name: string
  pronouns: string
  role: string
  areas: string[]
  cap: string
  btn: string
  /** One-line on how they mentor. */
  quote: string
  /** Why they're a good mentor. */
  why: string
  /** What they charge. */
  charge: string
  /** How to reach out / what to expect. */
  reach: string
  fitFor: string[]
  fitNot: string[]
}

export const MENTORS: Mentor[] = [
  {
    slug: 'ines-tavares',
    initials: 'IT',
    bg: 'rgba(232,119,90,.15)',
    color: 'var(--accent-ink)',
    name: memberName('ines'),
    pronouns: 'she/her',
    role: 'Graphic Designer',
    areas: ['Design career', 'Freelancing', 'Studio building'],
    cap: '1 open spot this quarter',
    btn: 'Request a match',
    quote: "I'll tell you what's working before I tell you what's not.",
    why: "Inês has built a studio from nothing and hired junior designers herself, so she knows both sides of the table. She mentors people who want to do good work slowly, and she's honest without being harsh.",
    charge: 'Free for QueerPulse members — she takes one mentee a quarter as a way of giving back. A coffee or a drink when you meet is welcome, never expected.',
    reach: "Request a match through the mentorship form and mention you'd like Inês specifically. She replies within a few days and always does a short intro call before committing.",
    fitFor: ['Designers 0–4 years in who care about craft', 'People freelancing or thinking about starting a studio', 'Anyone switching into design from a related field'],
    fitNot: ['You want help landing a corporate in-house role fast', 'You only want portfolio polish with no conversation', "You haven't made any work yet — start, then come back"],
  },
  {
    slug: 'rui-marcal',
    initials: 'RM',
    bg: 'rgba(45,27,61,.12)',
    color: 'var(--plum)',
    name: memberName('rui'),
    pronouns: 'he/him',
    role: 'Software Engineer',
    areas: ['Engineering career', 'Junior to mid', 'Open source'],
    cap: '2 open spots this quarter',
    btn: 'Request a match',
    quote: 'Most engineering careers stall for non-engineering reasons. Let’s fix those.',
    why: "Rui has gone from junior to senior and mentored open-source contributors along the way. He's good at the unglamorous parts — code-review habits, navigating teams, asking for the raise.",
    charge: 'Free. Rui mentors two people a quarter and asks only that you pay it forward later.',
    reach: "Request a match and note your current level and what you're stuck on. He'll suggest a first call within a week.",
    fitFor: ['Junior-to-mid engineers wanting to level up', 'Self-taught devs who want a sanity check', 'People contributing to (or starting) open source'],
    fitNot: ['You want help cramming for FAANG interviews', 'You’re at staff/principal level seeking peer review', "You haven't written much code yet"],
  },
  {
    slug: 'mariana-loucao',
    initials: 'ML',
    bg: 'rgba(74,140,111,.15)',
    color: 'var(--jade)',
    name: memberName('mariana'),
    pronouns: 'she/her',
    role: 'Clinical Psychologist',
    areas: ['Wellbeing at work', 'Coming out professionally', 'Identity'],
    cap: 'Waitlist only right now',
    btn: 'Join waitlist',
    quote: 'Work is where a lot of us hide. Mentorship can be where we stop.',
    why: 'Mariana is a clinical psychologist who runs a peer-support group for queer professionals. She mentors on the human side of careers — burnout, coming out at work, identity and ambition.',
    charge: 'Sliding-scale barter or free on the waitlist. Because this is close to her clinical work, she keeps numbers small and takes people as space opens.',
    reach: 'Join the waitlist through the form. Mariana reaches out personally when a spot opens, usually within a month or two.',
    fitFor: ['Anyone navigating coming out professionally', 'People facing burnout or a difficult workplace', 'Those whose identity and work feel in tension'],
    fitNot: ['You’re in acute crisis — this isn’t therapy; see Wellbeing', 'You want tactical career-ladder advice only', 'You need weekly clinical support'],
  },
  {
    slug: 'carla-nogueira',
    initials: 'CN',
    bg: 'rgba(232,119,90,.12)',
    color: 'var(--accent-ink)',
    name: memberName('carla'),
    pronouns: 'she/her',
    role: 'Product Manager',
    areas: ['Product career', 'Fintech', 'Switching industries'],
    cap: '1 open spot this quarter',
    btn: 'Request a match',
    quote: 'I switched industries twice. I know how scary and how doable it is.',
    why: "Carla is a product manager who moved into fintech from a different field, so she mentors people mid-switch. She's structured, direct, and good at turning a vague goal into a plan.",
    charge: "Free for one mentee a quarter. She occasionally asks for honest feedback on something she's building in return.",
    reach: "Request a match and tell her where you are and where you want to be. She'll set up a 30-minute call to see if it's a fit.",
    fitFor: ['People moving into product from another field', 'Early PMs wanting structure and direction', 'Anyone eyeing fintech or scale-ups'],
    fitNot: ['You want deep technical or design mentorship', 'You’re a senior PM seeking peer sparring', 'You’re not ready to do homework between calls'],
  },
  {
    slug: 'sofia-andrade',
    initials: 'SA',
    bg: 'rgba(74,140,111,.15)',
    color: 'var(--jade)',
    name: memberName('sofia'),
    pronouns: 'she/her',
    role: 'Documentary Filmmaker',
    areas: ['Filmmaking', 'Creative practice', 'Arts funding'],
    cap: '2 open spots this quarter',
    btn: 'Request a match',
    quote: 'Funding and finishing are the hard parts. Making is the easy bit.',
    why: 'Sofia makes documentaries and has navigated grants, co-productions, and the long middle of a creative project. She mentors people stuck in the part nobody warns you about.',
    charge: "Barter — she'll mentor in exchange for help on her own projects (research, transcription, a second pair of eyes). Money never changes hands.",
    reach: 'Request a match and tell her what you’re working on. She prefers to meet in person at least once early on.',
    fitFor: ['Filmmakers and creatives mid-project', 'People applying for arts funding', 'Anyone stuck in the unglamorous middle of a project'],
    fitNot: ['You want help getting started from zero', 'You need technical post-production tutoring', 'You’re looking for industry introductions only'],
  },
  {
    slug: 'raquel-baptista',
    initials: 'RB',
    bg: 'rgba(122,82,184,.12)',
    color: '#7A52B8',
    name: 'Raquel Baptista',
    pronouns: 'she/her',
    role: 'Lawyer',
    areas: ['Legal career', 'Rights navigation', 'Advocacy'],
    cap: '1 open spot this quarter',
    btn: 'Request a match',
    quote: 'Knowing your rights is half of using them.',
    why: 'Raquel is a lawyer who does rights-navigation and advocacy work. She mentors people thinking about legal careers and members trying to understand their own rights at work or in the system.',
    charge: 'Free. Raquel takes one mentee a quarter and treats it as part of her advocacy.',
    reach: "Request a match through the form. For urgent rights issues, she'll point you to Legal Resources rather than wait for a match.",
    fitFor: ['People considering or early in a legal career', 'Those navigating rights at work or with the state', 'Advocacy-minded members'],
    fitNot: ['You need urgent legal representation — see Legal Resources', 'You want help with a specific live case', 'You’re after billable legal advice'],
  },
]

export const MENTEE_AREAS = ['Career direction', 'Coming out professionally', 'Creative practice', 'Starting a business', 'Navigating a difficult workplace', 'New to Lisbon', 'Mental health at work', 'Legal or rights issues']
export const MENTOR_AREAS = ['Career direction', 'Coming out professionally', 'Creative practice', 'Starting a business', 'Navigating a difficult workplace', 'Settling in Lisbon', 'Mental health at work', 'Legal or rights navigation']
