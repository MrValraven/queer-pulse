import type { ReactNode } from "react";

export interface FundFlowRow {
  labelKey: string;
  descKey: string;
  amount: number;
}

export interface DisbursementRow {
  d: string;
  m: string;
  tagKey: string;
  tagClass: string;
  name: ReactNode;
  csvName: string;
  note: string;
  amount: number;
}

export const IN: FundFlowRow[] = [
  {
    labelKey: "studio:fund.flows.in.surplus.label",
    descKey: "studio:fund.flows.in.surplus.desc",
    amount: 4100,
  },
  {
    labelKey: "studio:fund.flows.in.roundups.label",
    descKey: "studio:fund.flows.in.roundups.desc",
    amount: 1860,
  },
  {
    labelKey: "studio:fund.flows.in.holds.label",
    descKey: "studio:fund.flows.in.holds.desc",
    amount: 720,
  },
  {
    labelKey: "studio:fund.flows.in.gifts.label",
    descKey: "studio:fund.flows.in.gifts.desc",
    amount: 2400,
  },
];

export const OUT: FundFlowRow[] = [
  {
    labelKey: "studio:fund.flows.out.transcribers.label",
    descKey: "studio:fund.flows.out.transcribers.desc",
    amount: 2180,
  },
  {
    labelKey: "studio:fund.flows.out.grants.label",
    descKey: "studio:fund.flows.out.grants.desc",
    amount: 2400,
  },
  {
    labelKey: "studio:fund.flows.out.emergency.label",
    descKey: "studio:fund.flows.out.emergency.desc",
    amount: 1200,
  },
  {
    labelKey: "studio:fund.flows.out.access.label",
    descKey: "studio:fund.flows.out.access.desc",
    amount: 460,
  },
];

export const DISB: DisbursementRow[] = [
  {
    d: "8",
    m: "Jun",
    tagKey: "studio:fund.log.tag.transcriber",
    tagClass: "trans",
    name: (
      <>
        Teresa <em>Rocha</em>
      </>
    ),
    csvName: "Teresa Rocha",
    note: "14 lead sheets accepted into the archive this fortnight",
    amount: 210,
  },
  {
    d: "6",
    m: "Jun",
    tagKey: "studio:fund.log.tag.emergency",
    tagClass: "emerg",
    name: (
      <>
        Withheld by <em>request</em>
      </>
    ),
    csvName: "Withheld by request",
    note: "One month's rent for a member between tours — confidential",
    amount: 600,
  },
  {
    d: "5",
    m: "Jun",
    tagKey: "studio:fund.log.tag.grant",
    tagClass: "grant",
    name: (
      <>
        Helena <em>Pinto</em> &amp; 6 others
      </>
    ),
    csvName: "Helena Pinto & 6 others",
    note: "Spring first-release strand · €1,200 unrestricted each",
    amount: 1400,
  },
  {
    d: "2",
    m: "Jun",
    tagKey: "studio:fund.log.tag.access",
    tagClass: "access",
    name: (
      <>
        LGP <em>interpreter</em>
      </>
    ),
    csvName: "LGP interpreter",
    note: "Signed the Marsha P. Johnson broadcast · 90 minutes",
    amount: 240,
  },
  {
    d: "29",
    m: "May",
    tagKey: "studio:fund.log.tag.translator",
    tagClass: "trans",
    name: (
      <>
        Community <em>pool</em> · 9 people
      </>
    ),
    csvName: "Community pool · 9 people",
    note: "Lyric translations: PT→EN, PT→ES, FR→PT across 22 tracks",
    amount: 380,
  },
  {
    d: "24",
    m: "May",
    tagKey: "studio:fund.log.tag.emergency",
    tagClass: "emerg",
    name: (
      <>
        Instrument <em>replacement</em>
      </>
    ),
    csvName: "Instrument replacement",
    note: "A stolen accordion, replaced within a week — no application form",
    amount: 900,
  },
];

export const DISB_MORE: DisbursementRow[] = [
  {
    d: "20",
    m: "May",
    tagKey: "studio:fund.log.tag.grant",
    tagClass: "grant",
    name: (
      <>
        Mateus <em>Faria</em>
      </>
    ),
    csvName: "Mateus Faria",
    note: "First-release grant · debut EP mastering and artwork",
    amount: 1200,
  },
  {
    d: "17",
    m: "May",
    tagKey: "studio:fund.log.tag.access",
    tagClass: "access",
    name: (
      <>
        Captioning <em>pass</em> · 6 broadcasts
      </>
    ),
    csvName: "Captioning pass · 6 broadcasts",
    note: "Live captions across the May live-room season",
    amount: 320,
  },
  {
    d: "11",
    m: "May",
    tagKey: "studio:fund.log.tag.translator",
    tagClass: "trans",
    name: (
      <>
        Pedro <em>Lima</em>
      </>
    ),
    csvName: "Pedro Lima",
    note: "PT→EN lyric translation across 8 tracks",
    amount: 160,
  },
  {
    d: "4",
    m: "May",
    tagKey: "studio:fund.log.tag.emergency",
    tagClass: "emerg",
    name: (
      <>
        Withheld by <em>request</em>
      </>
    ),
    csvName: "Withheld by request",
    note: "Medical costs for a member — confidential",
    amount: 750,
  },
  {
    d: "28",
    m: "Apr",
    tagKey: "studio:fund.log.tag.transcriber",
    tagClass: "trans",
    name: (
      <>
        Sofia <em>Neves</em>
      </>
    ),
    csvName: "Sofia Neves",
    note: "9 lead sheets accepted into the archive",
    amount: 135,
  },
  {
    d: "21",
    m: "Apr",
    tagKey: "studio:fund.log.tag.grant",
    tagClass: "grant",
    name: (
      <>
        Spring strand · <em>4 artists</em>
      </>
    ),
    csvName: "Spring strand · 4 artists",
    note: "First-release grants · €1,200 unrestricted each",
    amount: 4800,
  },
];
