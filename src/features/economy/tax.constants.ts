/**
 * Portuguese freelance/independent-worker tax constants — Continente (mainland).
 *
 * SINGLE SOURCE OF TRUTH. No component may hardcode a tax figure; import from
 * here. Values verified for 2025 (and 2026 where enacted) — update the dated
 * blocks below when the law changes. This is general information, NOT tax
 * advice; every tool must show TAX_DISCLAIMER.
 *
 * Last reviewed: 2026-06-28.
 */

/** Shown on every tool that touches tax/legal/financial figures. */
export const TAX_DISCLAIMER =
  "General information, not tax or legal advice. Rules change and individual " +
  "situations differ — confirm with a contabilista certificado before relying on this.";

/* ── IVA (VAT) — Continente. Source: Art. 18.º CIVA. ───────────────────── */
export const IVA_RATES: { value: number; label: string }[] = [
  { value: 0, label: "0% (isento / exempt)" },
  { value: 6, label: "6% (reduzida)" },
  { value: 13, label: "13% (intermédia)" },
  { value: 23, label: "23% (normal)" },
];

/**
 * Art. 53.º CIVA isenção (exemption) threshold — prior-year turnover below
 * which you do not charge IVA. €15,000 for 2025 AND 2026 (was €13,500 in 2023,
 * €14,500 in 2024). Exceeding it by >25% in-year (>€18,750) means leaving the
 * exemption immediately. Source: Art. 53.º CIVA; DL 35/2025 (in force 1 Jul 2025).
 */
export const IVA_EXEMPTION_THRESHOLD = 15000;
export const IVA_EXEMPTION_OVERRUN = 18750;

/** Note printed on invoices issued under the art. 53.º exemption. */
export const IVA_EXEMPT_NOTE = "IVA – regime de isenção (art. 53.º do CIVA)";

/* ── IRS retenção na fonte (withholding) on recibos verdes ──────────────── */
/**
 * Default dropped from 25% to 23% in 2025; professionals may OPT to keep 25%
 * to avoid a year-end bill. 16.5% for IP/know-how, 11.5% for non-table
 * activities. Source: Art. 101.º CIRS; OE 2025.
 */
export const RETENTION_RATES: { value: number; label: string }[] = [
  { value: 23, label: "23% (default since 2025)" },
  { value: 25, label: "25% (optional)" },
  { value: 16.5, label: "16.5% (intellectual/industrial property)" },
  { value: 11.5, label: "11.5% (activities not in the art. 151.º table)" },
  { value: 0, label: "No retention (dispensa / art. 101.º-B)" },
];

/**
 * No withholding when expected annual Cat. B income < €15,000 (ties to the IVA
 * threshold). Mark such receipts with this note. Source: Art. 101.º-B CIRS.
 */
export const RETENTION_DISPENSA_THRESHOLD = 15000;
export const RETENTION_DISPENSA_NOTE =
  "Dispensa de retenção – art. 101.º-B do CIRS";

/* ── IRS escalões (brackets) ────────────────────────────────────────────── */
/** A bracket: marginal `rate` (fraction) up to `upTo` €; `null` = top bracket. */
export interface IrsBracket {
  upTo: number | null;
  rate: number;
}

/**
 * 2025 — FINAL post-cut rates (Lei 55-A/2025, retroactive to 1 Jan 2025).
 * NOT the superseded original OE 2025 (13/16.5/22…), and NOT the monthly
 * retenção-na-fonte tables. Annual rendimento coletável.
 */
export const IRS_BRACKETS_2025: IrsBracket[] = [
  { upTo: 8059, rate: 0.125 },
  { upTo: 12160, rate: 0.16 },
  { upTo: 17233, rate: 0.215 },
  { upTo: 22306, rate: 0.244 },
  { upTo: 28400, rate: 0.314 },
  { upTo: 41629, rate: 0.349 },
  { upTo: 44987, rate: 0.431 },
  { upTo: 83696, rate: 0.446 },
  { upTo: null, rate: 0.48 },
];

/** 2026 — enacted (OE 2026, Lei 73-A/2025): thresholds +3.51%, small cuts. */
export const IRS_BRACKETS_2026: IrsBracket[] = [
  { upTo: 8342, rate: 0.125 },
  { upTo: 12587, rate: 0.157 },
  { upTo: 17838, rate: 0.212 },
  { upTo: 23089, rate: 0.241 },
  { upTo: 29397, rate: 0.311 },
  { upTo: 43090, rate: 0.349 },
  { upTo: 46566, rate: 0.431 },
  { upTo: 86634, rate: 0.446 },
  { upTo: null, rate: 0.48 },
];

/* ── Regime simplificado coefficients (Art. 31.º CIRS) ──────────────────── */
/** taxable income = coefficient × gross; remainder is presumed expenses. */
export const SIMPLIFIED_COEFFICIENTS = {
  services: 0.75, // liberal professions in the art. 151.º table
  otherServices: 0.35, // services not in the 0.75 set
  goods: 0.15, // sale of goods / hospitality
  ipCapital: 0.95, // IP, capital income, capital gains
} as const;

/** Start-of-activity reduction (Art. 31.º n.º 10): ×0.5 year 1, ×0.75 year 2. */
export const SIMPLIFIED_STARTUP_FACTORS = { year1: 0.5, year2: 0.75 } as const;

/**
 * The 15%-justification rule (n.º 13) for the 0.75/0.35 coefficients uses a
 * fixed specific deduction. UNCERTAIN: sources disagree whether this is the
 * frozen €4,104 or the IAS-indexed value (€4,462.15 for 2025 income). We store
 * the statutory €4,104 and document the conflict; revisit before shipping any
 * calculator that depends on it (sub-project 2).
 */
export const SIMPLIFIED_SPECIFIC_DEDUCTION = 4104;

/* ── Segurança Social (independent workers) ─────────────────────────────── */
/**
 * 21.4% for freelancers, 25.2% for ENI. Base = 70% of services income (÷3 for
 * the quarterly relevant income). Minimum €20/month.
 * UNCERTAIN: an unverified "1.5 × IAS minimum base" claim circulates — we use
 * the corroborated €20/month minimum instead. Source: PwC Guia Fiscal 2025.
 */
export const SS_RATE_FREELANCER = 0.214;
export const SS_RATE_ENI = 0.252;
export const SS_RELEVANT_INCOME_FACTOR = 0.7;
export const SS_MIN_MONTHLY = 20;

/** Employee (Categoria A) Segurança Social contribution — the 11% TSU worker share. */
export const SS_RATE_EMPLOYEE = 0.11;
/** Categoria A specific deduction (dedução específica) on employment income — €4,104. */
export const CAT_A_SPECIFIC_DEDUCTION = 4104;

/** Indexante dos Apoios Sociais. Max SS base = 12 × IAS. */
export const IAS_2025 = 522.5;
export const IAS_2026 = 537.13;

/* ── First-year / new-registrant benefits ───────────────────────────────── */
/**
 * First-time independents: 12-month Segurança Social exemption (first
 * contribution in month 13). Plus the coefficient reduction above.
 * UNCERTAIN: practitioner commentary claims the first-year coefficient cut is
 * disregarded in a year with concurrent Category A / pension income — this is
 * NOT in the statute text; verify before encoding.
 */
export const SS_FIRST_YEAR_EXEMPTION_MONTHS = 12;
