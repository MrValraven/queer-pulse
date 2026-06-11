import { routes } from '../../app/routeMap'

export type Tab = 'incubator' | 'freelance' | 'salary'
export type Sector = 'tech' | 'design' | 'creative' | 'ngo' | 'law'

export const JOBS = routes.jobs
export const MENTORSHIP = routes.mentorship

export const STEPS = [
  { n: 1, title: 'Apply', desc: 'A short application — your idea, where you are, what you need. No pitch deck required. Decisions in 3 weeks.', meta: 'Applications open · Deadline 30 Jul' },
  { n: 2, title: 'Match with a mentor', desc: 'Matched to a community mentor based on your sector, stage, and what you told us you need. You meet fortnightly for six months.', meta: 'Sep–Feb · Fortnightly sessions' },
  { n: 3, title: 'Cohort sessions', desc: 'Monthly workshops with the full cohort — legal, finance, fundraising, design — plus time for peer support and honest conversation.', meta: 'First Saturday of every month' },
  { n: 4, title: 'Demo night', desc: "Share what you've built with the community, investors, and the press. Low-stakes, high-support. You decide how much to reveal.", meta: 'March · Invite-only' },
]

export const INC_MENTORS = [
  { av: 'RL', bg: 'rgba(232,119,90,.15)', color: 'var(--accent-ink)', name: 'Rita Lopes', role: 'Founder, Arquivo Studio · formerly Farfetch product lead', tags: ['Product', 'B2C', 'Fundraising'] },
  { av: 'JM', bg: 'rgba(74,140,111,.15)', color: 'var(--jade)', name: 'João Melo', role: 'Co-founder, Semente Legal · social enterprise lawyer', tags: ['Legal', 'Cooperatives', 'Grants'] },
  { av: 'AC', bg: 'rgba(45,27,61,.1)', color: 'var(--plum)', name: 'Ana Catarina', role: 'Angel investor · ex-Unbabel, Feedzai', tags: ['B2B SaaS', 'Pre-seed', 'Hiring'] },
]

export const TOOLS = [
  { icon: '📄', title: 'Service contract (PT/EN)', desc: 'A straightforward freelance services contract in Portuguese and English. Covers scope, payment terms, IP, and cancellation. Reviewed by a lawyer in the community.', cta: 'Download (.docx)' },
  { icon: '💸', title: 'Invoice template', desc: 'A clean Portuguese-law-compliant invoice template with NIF field, IVA options, and retention tax. In both recibo verde and standard formats.', cta: 'Download (.xlsx)' },
  { icon: '📋', title: 'Scope of work template', desc: "Define exactly what you're delivering, what you're not, how many revisions, and what happens if the scope changes. The document that prevents most disputes.", cta: 'Download (.docx)' },
  { icon: '📚', title: 'Recibo verde guide', desc: 'A plain-language guide to the Portuguese freelance tax system — what you need to register, when to pay, what you can deduct. Updated for 2025.', cta: 'Read the guide' },
]

export interface SalaryRow {
  sector: Sector
  role: string
  sectorLabel: string
  money: string
  exp: string
  type: 'Full' | 'Freelance' | 'Part'
  typeLabel: string
}
export const SALARIES: SalaryRow[] = [
  { sector: 'tech', role: 'Senior Software Engineer', sectorLabel: 'Tech · Lisbon', money: '€72,000', exp: '8 yrs', type: 'Full', typeLabel: 'Full-time' },
  { sector: 'design', role: 'UX Designer', sectorLabel: 'Design · Lisbon', money: '€38,000', exp: '4 yrs', type: 'Full', typeLabel: 'Full-time' },
  { sector: 'creative', role: 'Graphic Designer', sectorLabel: 'Creative · Freelance', money: '€45,000', exp: '6 yrs', type: 'Freelance', typeLabel: 'Freelance' },
  { sector: 'ngo', role: 'Programme Coordinator', sectorLabel: 'NGO · Lisbon', money: '€22,500', exp: '3 yrs', type: 'Full', typeLabel: 'Full-time' },
  { sector: 'tech', role: 'Product Manager', sectorLabel: 'Tech · Remote', money: '€58,000', exp: '6 yrs', type: 'Full', typeLabel: 'Full-time' },
  { sector: 'creative', role: 'Documentary Filmmaker', sectorLabel: 'Creative · Project-based', money: '€32,000', exp: '5 yrs', type: 'Freelance', typeLabel: 'Freelance' },
  { sector: 'law', role: 'Associate Lawyer', sectorLabel: 'Law · Lisbon', money: '€34,000', exp: '2 yrs', type: 'Full', typeLabel: 'Full-time' },
  { sector: 'design', role: 'Brand Consultant', sectorLabel: 'Design · Freelance', money: '€55,000', exp: '10 yrs', type: 'Freelance', typeLabel: 'Freelance' },
  { sector: 'tech', role: 'Data Analyst', sectorLabel: 'Tech · Lisbon', money: '€31,000', exp: '2 yrs', type: 'Full', typeLabel: 'Full-time' },
  { sector: 'ngo', role: 'Communications Manager', sectorLabel: 'NGO · Hybrid', money: '€28,000', exp: '5 yrs', type: 'Part', typeLabel: 'Part-time' },
]
export const BADGE_CLASS: Record<SalaryRow['type'], string> = { Full: 'badgeFull', Freelance: 'badgeFreelance', Part: 'badgePart' }
export const SAL_FILTERS: { id: Sector | 'all'; label: string }[] = [
  { id: 'all', label: 'All sectors' },
  { id: 'tech', label: 'Tech' },
  { id: 'design', label: 'Design' },
  { id: 'creative', label: 'Creative' },
  { id: 'ngo', label: 'NGO / non-profit' },
  { id: 'law', label: 'Law' },
]

export const euro = (n: number) => '€' + Math.round(n).toLocaleString('pt-PT')
