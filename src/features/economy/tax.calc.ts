/**
 * Pure tax-calculation helpers for the Economy calculators. All figures come
 * from `tax.constants.ts`; these functions never hardcode a rate. Results are
 * ESTIMATES (regime simplificado, no personal deductions modelled) — always
 * shown alongside TAX_DISCLAIMER.
 */
import {
  CAT_A_SPECIFIC_DEDUCTION,
  IRS_BRACKETS_2025,
  IRS_BRACKETS_2026,
  SIMPLIFIED_STARTUP_FACTORS,
  SS_MIN_MONTHLY,
  SS_RATE_EMPLOYEE,
  SS_RATE_FREELANCER,
  SS_RELEVANT_INCOME_FACTOR,
  type IrsBracket,
} from './tax.constants'

export type TaxYear = 2025 | 2026

export function bracketsFor(year: TaxYear): IrsBracket[] {
  return year === 2026 ? IRS_BRACKETS_2026 : IRS_BRACKETS_2025
}

/** Progressive IRS on a taxable income, applying each bracket's marginal rate. */
export function irsTax(taxable: number, year: TaxYear): number {
  if (!(taxable > 0)) return 0
  const brackets = bracketsFor(year)
  let tax = 0
  let lower = 0
  for (const b of brackets) {
    const upper = b.upTo ?? Infinity
    if (taxable <= lower) break
    const slice = Math.min(taxable, upper) - lower
    tax += slice * b.rate
    lower = upper
  }
  return tax
}

/** Effective IRS rate (tax / taxable), 0 when taxable is 0. */
export function effectiveIrsRate(taxable: number, year: TaxYear): number {
  if (!(taxable > 0)) return 0
  return irsTax(taxable, year) / taxable
}

/**
 * Regime-simplificado taxable income = coefficient × gross, with the
 * start-of-activity reduction in year 1 (×0.5) / year 2 (×0.75).
 */
export function simplifiedTaxable(
  gross: number,
  coefficient: number,
  startupYear: 0 | 1 | 2 = 0,
): number {
  const factor =
    startupYear === 1
      ? SIMPLIFIED_STARTUP_FACTORS.year1
      : startupYear === 2
        ? SIMPLIFIED_STARTUP_FACTORS.year2
        : 1
  return Math.max(0, gross) * coefficient * factor
}

/**
 * Annual Segurança Social estimate for an independent worker.
 * Base ≈ SS_RELEVANT_INCOME_FACTOR (70%) of annual services income; the yearly
 * contribution is base × rate, floored at SS_MIN_MONTHLY × 12. `firstYear`
 * applies the 12-month exemption for first-time independents.
 */
export function ssAnnual(
  grossServices: number,
  rate: number = SS_RATE_FREELANCER,
  firstYear = false,
): number {
  if (firstYear) return 0
  const base = Math.max(0, grossServices) * SS_RELEVANT_INCOME_FACTOR
  return Math.max(SS_MIN_MONTHLY * 12, base * rate)
}

export interface TakeHome {
  gross: number
  ss: number
  taxable: number
  irs: number
  net: number
  effectiveRate: number
}

/**
 * Estimate annual take-home for a freelancer on the regime simplificado:
 * gross → minus SS → IRS on the coefficient-reduced taxable → net.
 */
export function estimateTakeHome(opts: {
  gross: number
  coefficient: number
  year: TaxYear
  ssRate?: number
  startupYear?: 0 | 1 | 2
  firstYear?: boolean
}): TakeHome {
  const { gross, coefficient, year, ssRate = SS_RATE_FREELANCER, startupYear = 0, firstYear = false } = opts
  const ss = ssAnnual(gross, ssRate, firstYear)
  const taxable = simplifiedTaxable(gross, coefficient, startupYear)
  const irs = irsTax(taxable, year)
  const net = Math.max(0, gross - ss - irs)
  return { gross, ss, taxable, irs, net, effectiveRate: gross > 0 ? (ss + irs) / gross : 0 }
}

/**
 * Estimate annual net for a salaried employee (Categoria A): gross → minus the
 * 11% employee SS → IRS on (gross − SS − specific deduction) → net. A like-for-
 * like comparison baseline against the freelance estimate; ignores subsídios de
 * férias/Natal and personal tax credits (an estimate, shown with the disclaimer).
 */
export function estimateSalariedNet(opts: { gross: number; year: TaxYear }): TakeHome {
  const { gross, year } = opts
  const g = Math.max(0, gross)
  const ss = g * SS_RATE_EMPLOYEE
  const taxable = Math.max(0, g - ss - CAT_A_SPECIFIC_DEDUCTION)
  const irs = irsTax(taxable, year)
  const net = Math.max(0, g - ss - irs)
  return { gross: g, ss, taxable, irs, net, effectiveRate: g > 0 ? (ss + irs) / g : 0 }
}
