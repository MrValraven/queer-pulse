import type { ReactNode } from 'react'

export interface PayoutSummaryRow {
  k: string
  v: string
}

export interface PayoutRow {
  d: string
  m: string
  period: string
  title: ReactNode
  meta: ReactNode
  csvMeta: string
  amt: string
  status: string
}

export interface PayoutBreakdownRow {
  n: string
  nm: ReactNode
  plays: string
  total: string
}

export const SUMMARY: PayoutSummaryRow[] = [
  { k: 'From streaming', v: '1,712' },
  { k: 'From tips', v: '312' },
  { k: 'From album buys', v: '76' },
  { k: 'Direct €3/mo subs', v: '40' },
]

export const PAYOUTS: PayoutRow[] = [
  { d: '5', m: 'Jul', period: 'July 2026', title: <>July 2026 payout · <em>pending</em></>, meta: <>36,400 plays · 87 tips · 1 album buy · 12 direct subs · <em>splits to 3 collaborators</em></>, csvMeta: '36,400 plays · 87 tips · 1 album buy · 12 direct subs · splits to 3 collaborators', amt: '2,140', status: 'pending' },
  { d: '5', m: 'Jun', period: 'June 2026', title: <>June 2026 payout</>, meta: '24,260 plays · 64 tips · 4 album buys · 8 direct subs', csvMeta: '24,260 plays · 64 tips · 4 album buys · 8 direct subs', amt: '1,213', status: 'paid' },
  { d: '5', m: 'May', period: 'May 2026', title: <>May 2026 payout · <em>first month of CDS</em></>, meta: '18,420 plays · 42 tips · 12 album buys · 6 direct subs', csvMeta: '18,420 plays · 42 tips · 12 album buys · 6 direct subs', amt: '1,084', status: 'paid' },
  { d: '5', m: 'Apr', period: 'April 2026', title: <>April 2026 payout</>, meta: '8,140 plays · 18 tips · 3 album buys · 4 direct subs', csvMeta: '8,140 plays · 18 tips · 3 album buys · 4 direct subs', amt: '486', status: 'paid' },
  { d: '5', m: 'Mar', period: 'March 2026', title: <>March 2026 payout · <em>first on Studio</em></>, meta: '2,140 plays · 6 tips · 1 album buy · 2 direct subs', csvMeta: '2,140 plays · 6 tips · 1 album buy · 2 direct subs', amt: '142', status: 'paid' },
]

export const BREAKDOWN: PayoutBreakdownRow[] = [
  { n: '06', nm: <>Carta para a <em>santa</em></>, plays: '25,832 plays', total: '1,291.60' },
  { n: '04', nm: <>A <em>vizinha</em> que reza</>, plays: '4,144 plays', total: '207.20' },
  { n: '03', nm: <>Mãe, três <em>vezes</em></>, plays: '2,880 plays', total: '144.00' },
  { n: '01', nm: <>Mãe, <em>vento</em></>, plays: '1,684 plays', total: '84.20' },
  { n: '08', nm: <>O <em>nome</em></>, plays: '920 plays', total: '46.00' },
  { n: '—', nm: <>Seven other tracks <em>· combined</em></>, plays: '940 plays', total: '47.00' },
]
