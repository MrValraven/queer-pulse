import type { ReactNode } from 'react'

export interface FundFlowRow {
  k: ReactNode
  d: string
  v: string
}

export interface DisbursementRow {
  d: string
  m: string
  tag: string
  tagClass: string
  name: ReactNode
  csvName: string
  note: string
  amt: string
}

export const IN: FundFlowRow[] = [
  { k: <>Subscription <em>surplus</em></>, d: 'When sustainer revenue beats the payout ledger, the difference pools here.', v: '4,100' },
  { k: <>Tip <em>round-ups</em></>, d: 'The optional 5% some listeners add on top of a tip.', v: '1,860' },
  { k: <>Cleared <em>holds</em></>, d: 'Unmatched DJ-set payouts that stay unclaimed after a year.', v: '720' },
  { k: <>Direct <em>gifts</em></>, d: 'One-off donations from members and a Lisbon foundation.', v: '2,400' },
]

export const OUT: FundFlowRow[] = [
  { k: <>Transcribers &amp; <em>translators</em></>, d: 'Sheet music, lyric translations — paid per accepted piece.', v: '2,180' },
  { k: <>First-release <em>grants</em></>, d: '€1,200 unrestricted to first-time members on the spring strand.', v: '2,400' },
  { k: <>Emergency <em>artist support</em></>, d: 'No-questions help for a member in a hard month.', v: '1,200' },
  { k: <>Access <em>work</em></>, d: 'LGP interpreters, captioning passes, the screen-reader audit.', v: '460' },
]

export const DISB: DisbursementRow[] = [
  { d: '8', m: 'Jun', tag: 'Transcriber', tagClass: 'trans', name: <>Teresa <em>Rocha</em></>, csvName: 'Teresa Rocha', note: '14 lead sheets accepted into the archive this fortnight', amt: '210' },
  { d: '6', m: 'Jun', tag: 'Emergency', tagClass: 'emerg', name: <>Withheld by <em>request</em></>, csvName: 'Withheld by request', note: "One month's rent for a member between tours — confidential", amt: '600' },
  { d: '5', m: 'Jun', tag: 'Grant', tagClass: 'grant', name: <>Helena <em>Pinto</em> &amp; 6 others</>, csvName: 'Helena Pinto & 6 others', note: 'Spring first-release strand · €1,200 unrestricted each', amt: '1,400' },
  { d: '2', m: 'Jun', tag: 'Access', tagClass: 'access', name: <>LGP <em>interpreter</em></>, csvName: 'LGP interpreter', note: 'Signed the Marsha P. Johnson broadcast · 90 minutes', amt: '240' },
  { d: '29', m: 'May', tag: 'Translator', tagClass: 'trans', name: <>Community <em>pool</em> · 9 people</>, csvName: 'Community pool · 9 people', note: 'Lyric translations: PT→EN, PT→ES, FR→PT across 22 tracks', amt: '380' },
  { d: '24', m: 'May', tag: 'Emergency', tagClass: 'emerg', name: <>Instrument <em>replacement</em></>, csvName: 'Instrument replacement', note: 'A stolen accordion, replaced within a week — no application form', amt: '900' },
]

export const DISB_MORE: DisbursementRow[] = [
  { d: '20', m: 'May', tag: 'Grant', tagClass: 'grant', name: <>Mateus <em>Faria</em></>, csvName: 'Mateus Faria', note: 'First-release grant · debut EP mastering and artwork', amt: '1,200' },
  { d: '17', m: 'May', tag: 'Access', tagClass: 'access', name: <>Captioning <em>pass</em> · 6 broadcasts</>, csvName: 'Captioning pass · 6 broadcasts', note: 'Live captions across the May live-room season', amt: '320' },
  { d: '11', m: 'May', tag: 'Translator', tagClass: 'trans', name: <>Pedro <em>Lima</em></>, csvName: 'Pedro Lima', note: 'PT→EN lyric translation across 8 tracks', amt: '160' },
  { d: '4', m: 'May', tag: 'Emergency', tagClass: 'emerg', name: <>Withheld by <em>request</em></>, csvName: 'Withheld by request', note: 'Medical costs for a member — confidential', amt: '750' },
  { d: '28', m: 'Apr', tag: 'Transcriber', tagClass: 'trans', name: <>Sofia <em>Neves</em></>, csvName: 'Sofia Neves', note: '9 lead sheets accepted into the archive', amt: '135' },
  { d: '21', m: 'Apr', tag: 'Grant', tagClass: 'grant', name: <>Spring strand · <em>4 artists</em></>, csvName: 'Spring strand · 4 artists', note: 'First-release grants · €1,200 unrestricted each', amt: '4,800' },
]
