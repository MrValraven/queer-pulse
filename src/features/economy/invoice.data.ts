/**
 * Static seed data + helpers for the freelance invoice generator. The page owns
 * all live state; this module only provides the LineItem shape, the per-line
 * total, sensible defaults, and a collision-free id helper.
 */

export interface LineItem {
  id: string
  desc: string
  qty: number
  unit: number
}

/** Per-line total (qty × unit). Guards NaN so a half-typed field reads as 0. */
export const lineTotal = (l: LineItem) =>
  (Number.isFinite(l.qty) ? l.qty : 0) * (Number.isFinite(l.unit) ? l.unit : 0)

let counter = 0
/** Stable unique id — crypto.randomUUID() when available, else a counter. */
export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  counter += 1
  return `line-${counter}`
}

/** A fresh, empty editable line. */
export const emptyLine = (): LineItem => ({ id: newId(), desc: '', qty: 1, unit: 0 })

/** The sample line items the form opens with. */
export const initialLineItems: LineItem[] = [
  { id: newId(), desc: 'Brand identity — logo + guidelines', qty: 1, unit: 1200 },
  { id: newId(), desc: 'Web design (per page)', qty: 5, unit: 180 },
]

/** Empty client block. */
export const emptyClient: InvoiceClient = { name: '', nif: '', address: '' }

export interface InvoiceClient {
  name: string
  nif: string
  address: string
}

/** Default invoice number (Fatura-Recibo series). */
export const defaultInvoiceNumber = 'FR 2026/001'

/** Today's date as an ISO yyyy-mm-dd string, for <input type="date"> defaults. */
export const isoToday = (): string => new Date().toISOString().slice(0, 10)

/** A date `days` ahead of today, ISO yyyy-mm-dd (default 30-day terms). */
export const isoInDays = (days: number): string => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
