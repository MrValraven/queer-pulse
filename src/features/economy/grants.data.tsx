import { type ReactNode } from 'react'

export type Section = 'qp' | 'pt' | 'eu'
export type Status = 'open' | 'rolling' | 'closed'

export interface Grant {
  sec: Section
  name: string
  org: string
  amount: string
  status: Status
  cats: string[]
  desc: string
  tags: string[]
  to: string
}

export const GRANTS: Grant[] = [
  { sec: 'qp', name: 'QueerPulse Micro Grant', org: 'QueerPulse Community Fund', amount: '€200–€2,000', status: 'open', cats: ['individual', 'org', 'community'], desc: 'Community-funded micro grants for queer projects in Lisbon. Open to members and non-members. Decisions made by a rotating community panel, not a board.', tags: ['Lisbon', 'community', 'rolling'], to: '/work/grants' },
  { sec: 'pt', name: 'ILGA Portugal Project Fund', org: 'ILGA Portugal', amount: '€500–€5,000', status: 'open', cats: ['org', 'community'], desc: 'Annual grants for LGBTQ+ advocacy, community building, and awareness projects in Portugal. Priority to regional projects outside Lisbon.', tags: ['advocacy', 'community', 'Portugal'], to: '/work/grants' },
  { sec: 'pt', name: 'Gulbenkian — Social Programme', org: 'Fundação Gulbenkian', amount: '€5,000–€50,000', status: 'rolling', cats: ['org', 'community', 'arts'], desc: "Gulbenkian's social cohesion programme funds community organisations working with marginalised groups. An inclusion-framed application is needed.", tags: ['Gulbenkian', 'large grant', 'social'], to: '/work/grants' },
  { sec: 'pt', name: 'Active Citizens Fund Portugal', org: 'EEA Grants', amount: '€5,000–€200,000', status: 'rolling', cats: ['org', 'community'], desc: 'Civil society strengthening grants via the EEA mechanism. LGBTQ+ groups have been funded under previous rounds.', tags: ['EEA', 'civil society'], to: '/work/grants' },
  { sec: 'pt', name: 'DGES — Arts & Culture Residency', org: 'DGES', amount: '€2,000–€15,000', status: 'closed', cats: ['individual', 'arts'], desc: 'Annual residency and creation support for individual artists. Frame your work in terms of cultural value, not identity.', tags: ['arts', 'residency'], to: '/work/grants' },
  { sec: 'eu', name: 'Citizens, Equality, Rights and Values (CERV)', org: 'European Commission', amount: '€50,000–€1,000,000+', status: 'rolling', cats: ['org', 'eu'], desc: "The EU's main civil society and equality programme. The LGBTIQ Equality strand funds work across Europe. Requires EU-wide partnerships.", tags: ['EU', 'large grant', 'transnational'], to: '/work/grants' },
  { sec: 'eu', name: 'ILGA-Europe Emergency Fund', org: 'ILGA-Europe', amount: 'up to €5,000', status: 'rolling', cats: ['org', 'individual', 'eu'], desc: 'Rapid-response emergency grants for LGBTIQ organisations or individuals facing urgent threats — legal, financial, safety-related.', tags: ['emergency', 'EU', 'rapid response'], to: '/work/grants' },
  { sec: 'eu', name: 'Arcus Foundation — LGBTQ Programme', org: 'Arcus Foundation', amount: '$50,000–$300,000', status: 'rolling', cats: ['org', 'eu'], desc: 'US-based foundation with a major LGBTQ programme in Europe. Focuses on movement-building, legal advocacy, and trans rights.', tags: ['movement building', 'international'], to: '/work/grants' },
  { sec: 'eu', name: 'Rainbow Railroad Emergency Fund', org: 'Rainbow Railroad', amount: 'up to $2,000', status: 'rolling', cats: ['individual', 'eu'], desc: 'Direct financial assistance for LGBTQI+ people in dangerous situations, including help leaving unsafe situations. For individuals only.', tags: ['emergency', 'individual', 'safety'], to: '/work/grants' },
]

export const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'individual', label: 'For individuals' },
  { value: 'org', label: 'For organisations' },
  { value: 'arts', label: 'Arts & culture' },
  { value: 'community', label: 'Community projects' },
  { value: 'eu', label: 'EU / International' },
]

export const SECTIONS: { id: Section; label: ReactNode }[] = [
  { id: 'qp', label: <>From <em>QueerPulse</em></> },
  { id: 'pt', label: <><em>Portugal</em> — national programmes</> },
  { id: 'eu', label: <><em>EU &amp; International</em></> },
]

export const STATUS_LABEL: Record<Status, string> = { open: 'Open now', rolling: 'Rolling', closed: 'Closed' }

export const STEPS = [
  { n: '01', title: 'Read the criteria twice', body: "Most rejections are from applications that technically fit but don't mirror the funder's language. Map your project onto their specific wording." },
  { n: '02', title: 'Tell a specific story', body: 'Funders read hundreds of applications. A single specific, human story of impact will land better than broad claims.' },
  { n: '03', title: 'Show your community', body: 'Queer-focused funders want to see the community embedded — not as beneficiaries but as participants and decision-makers.' },
  { n: '04', title: 'Ask for a review', body: "Before submitting, ask someone not involved to read your application. Fresh eyes catch the assumptions you've stopped seeing." },
]
