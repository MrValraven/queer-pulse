import { routes } from '../../app/routeMap'

export type Mode = 'mentee' | 'mentor'

export const VOLUNTEER = routes.volunteer

export const STATS = [
  { n: '24', l: 'Active mentors in the network' },
  { n: '38', l: 'Matches made so far' },
  { n: '8', l: 'Areas of focus' },
]

export interface Mentor {
  initials: string
  bg: string
  color: string
  name: string
  role: string
  areas: string[]
  cap: string
  btn: string
}
export const MENTORS: Mentor[] = [
  { initials: 'IT', bg: 'rgba(232,119,90,.15)', color: 'var(--accent-ink)', name: 'Inês Tavares', role: 'Graphic Designer', areas: ['Design career', 'Freelancing', 'Studio building'], cap: '1 open spot this quarter', btn: 'Request a match' },
  { initials: 'RM', bg: 'rgba(45,27,61,.12)', color: 'var(--plum)', name: 'Rui Marçal', role: 'Software Engineer', areas: ['Engineering career', 'Junior to mid', 'Open source'], cap: '2 open spots this quarter', btn: 'Request a match' },
  { initials: 'ML', bg: 'rgba(74,140,111,.15)', color: 'var(--jade)', name: 'Mariana Loução', role: 'Clinical Psychologist', areas: ['Wellbeing at work', 'Coming out professionally', 'Identity'], cap: 'Waitlist only right now', btn: 'Join waitlist' },
  { initials: 'CN', bg: 'rgba(232,119,90,.12)', color: 'var(--accent-ink)', name: 'Carla Nogueira', role: 'Product Manager', areas: ['Product career', 'Fintech', 'Switching industries'], cap: '1 open spot this quarter', btn: 'Request a match' },
  { initials: 'SA', bg: 'rgba(74,140,111,.15)', color: 'var(--jade)', name: 'Sofia Andrade', role: 'Documentary Filmmaker', areas: ['Filmmaking', 'Creative practice', 'Arts funding'], cap: '2 open spots this quarter', btn: 'Request a match' },
  { initials: 'RB', bg: 'rgba(122,82,184,.12)', color: '#7A52B8', name: 'Raquel Baptista', role: 'Lawyer', areas: ['Legal career', 'Rights navigation', 'Advocacy'], cap: '1 open spot this quarter', btn: 'Request a match' },
]

export const MENTEE_AREAS = ['Career direction', 'Coming out professionally', 'Creative practice', 'Starting a business', 'Navigating a difficult workplace', 'New to Lisbon', 'Mental health at work', 'Legal or rights issues']
export const MENTOR_AREAS = ['Career direction', 'Coming out professionally', 'Creative practice', 'Starting a business', 'Navigating a difficult workplace', 'Settling in Lisbon', 'Mental health at work', 'Legal or rights navigation']
