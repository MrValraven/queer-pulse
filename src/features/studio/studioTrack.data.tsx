import { type ReactNode } from 'react'

export interface SplitRow {
  c: string
  k: string
  sub: string
  v: ReactNode
}

export interface CreditRow {
  who: string
  role: string
}

export interface MoreTrack {
  pre: string
  em: string
  post?: string
  meta: string
  tint: 'coral' | 'jade' | 'plum'
}

export const SPLIT: SplitRow[] = [
  { c: 'var(--accent)', k: 'Mariana Sol', sub: 'Direct, monthly', v: <>€<em>0.80</em></> },
  { c: 'var(--jade)', k: 'Solidarity fund', sub: 'Grants & mastering vouchers', v: '€0.08' },
  { c: '#2D1B3D', k: 'Platform & staff', sub: 'Hosting, captions, council', v: '€0.08' },
  { c: 'rgba(247,243,238,.2)', k: 'Payment fees', sub: 'Stripe / SEPA only', v: '€0.04' },
]

export const CREDITS: CreditRow[] = [
  { who: 'Mariana Sol · voice, piano, words', role: '85% · songwriter' },
  { who: 'João Anjos · cello', role: '10%' },
  { who: 'Inês T. · mix & master', role: '5%' },
  { who: 'Helena P. · translator', role: '€40 from solidarity fund' },
]

export const MORE: MoreTrack[] = [
  { pre: 'Mãe, três ', em: 'vezes', meta: 'Track 3 · CDS', tint: 'plum' },
  { pre: 'A ', em: 'vizinha', post: ' que reza', meta: 'Track 4 · CDS', tint: 'jade' },
  { pre: 'O ', em: 'nome', meta: 'Track 8 · CDS', tint: 'coral' },
  { pre: 'Mãe, ', em: 'vento', meta: 'Single · 2025', tint: 'plum' },
]
