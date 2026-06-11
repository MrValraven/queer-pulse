import type { Category } from './safeSpaces'

export const TYPE_CLASS: Record<Category, string> = {
  Bar: 'typeBar',
  Club: 'typeClub',
  Cafe: 'typeCafe',
  Health: 'typeHealth',
  Services: 'typeServices',
  Arts: 'typeArts',
}

export const CRITERIA: { icon: string; lead: string; rest: string }[] = [
  { icon: '✓', lead: 'Gender-neutral bathrooms', rest: ' available or clearly accessible' },
  { icon: '✓', lead: 'Staff intervene', rest: ' if a customer is being harassed or discriminated against' },
  { icon: '✓', lead: 'No discriminatory incidents', rest: ' reported in the past 12 months' },
  { icon: '✓', lead: 'Trans and non-binary people', rest: ' feel genuinely welcome, not just tolerated' },
  { icon: '✓', lead: 'Accessible', rest: ' — or access limitations clearly communicated' },
  { icon: '✓', lead: 'Minimum 3 independent reviews', rest: ' from verified QueerPulse members' },
  { icon: '↺', lead: 'Annual re-review', rest: " — status doesn't last forever" },
]

export const HOW: { num: string; title: string; desc: string }[] = [
  { num: '01', title: 'Any member nominates', desc: 'Submit a space with a brief note on why you think it should be verified. We acknowledge within 48 hours.' },
  { num: '02', title: 'Three independent visits', desc: "Three verified members visit the space independently and submit structured reviews against the criteria. They don't know each other's assessments." },
  { num: '03', title: 'Review panel decides', desc: "A small volunteer panel reads the reviews and decides whether the criteria are met. The space isn't told the result until after the decision." },
  { num: '04', title: 'Badge awarded', desc: "If approved, the venue receives a physical badge and a digital listing. They can display the badge in their window — it's earned, not purchased." },
  { num: '05', title: 'Annual re-review', desc: 'Every listing is re-reviewed each year. No status is permanent. New ownership, staff changes, or reported incidents trigger an early review.' },
  { num: '06', title: 'Any member can flag', desc: 'If something changes — an incident, a shift in atmosphere — any member can flag the listing. Three flags trigger an immediate review and temporary suspension of the badge.' },
]

export const FILTERS: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'All spaces' },
  { id: 'Bar', label: 'Bars' },
  { id: 'Club', label: 'Clubs' },
  { id: 'Cafe', label: 'Cafés' },
  { id: 'Health', label: 'Healthcare' },
  { id: 'Services', label: 'Services' },
  { id: 'Arts', label: 'Arts' },
]
