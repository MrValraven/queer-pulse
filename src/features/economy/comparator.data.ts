/**
 * Static option lists + copy for the freelance-vs-salaried comparator. Tax
 * figures live in `tax.constants.ts` (single source of truth); these are only
 * the human-readable labels and the "hidden costs" prose.
 */
import type { SIMPLIFIED_COEFFICIENTS } from './tax.constants'
import type { TaxYear } from './tax.calc'

export type ActivityKey = keyof typeof SIMPLIFIED_COEFFICIENTS
export type StartupYear = 0 | 1 | 2

export interface SelectOption<T> {
  value: T
  label: string
}

/** Regime-simplificado coefficient by activity type (Art. 31.º CIRS). */
export const ACTIVITY_OPTIONS: SelectOption<ActivityKey>[] = [
  { value: 'services', label: 'Liberal profession (0.75)' },
  { value: 'otherServices', label: 'Other services (0.35)' },
  { value: 'goods', label: 'Sale of goods / hospitality (0.15)' },
  { value: 'ipCapital', label: 'IP / capital (0.95)' },
]

export const YEAR_OPTIONS: SelectOption<TaxYear>[] = [
  { value: 2025, label: '2025' },
  { value: 2026, label: '2026' },
]

/** Start-of-activity reduction tier (Art. 31.º n.º 10). */
export const STARTUP_OPTIONS: SelectOption<StartupYear>[] = [
  { value: 0, label: 'Not in first 2 years' },
  { value: 1, label: 'First year (×0.5 coefficient)' },
  { value: 2, label: 'Second year (×0.75 coefficient)' },
]

/**
 * The things a salaried employee gets that a freelancer funds themselves. The
 * last item is the upside — flagged positive in the UI.
 */
export interface HiddenCost {
  text: string
  positive: boolean
}

export const HIDDEN_COSTS: HiddenCost[] = [
  { text: 'No paid holiday — you fund your own time off.', positive: false },
  {
    text: 'No subsídio de férias or de Natal (the two extra months salaried workers get).',
    positive: false,
  },
  { text: 'No paid sick leave or guaranteed unemployment cover.', positive: false },
  { text: 'You pay your own Segurança Social, quarterly.', positive: false },
  { text: 'Income is lumpy — feast or famine month to month.', positive: false },
  { text: 'But: deductible expenses, autonomy, and you can charge more.', positive: true },
]
