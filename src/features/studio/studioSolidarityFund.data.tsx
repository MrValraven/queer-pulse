export interface FundFlowRow {
  labelKey: string;
  descKey: string;
  amount: number;
}

export interface DisbursementRow {
  /** Date only; rendered as day and short month in the reader's language. */
  dateIso: string;
  tagKey: string;
  tagClass: string;
  /** A person's name, as written. */
  person?: { first: string; last: string };
  /** A described recipient from the catalog (carries <em>). */
  nameKey?: string;
  noteKey: string;
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
    dateIso: "2026-06-08",
    tagKey: "studio:fund.log.tag.transcriber",
    tagClass: "trans",
    person: { first: "Teresa", last: "Rocha" },
    noteKey: "studio:demo.fund.note.teresa",
    amount: 210,
  },
  {
    dateIso: "2026-06-06",
    tagKey: "studio:fund.log.tag.emergency",
    tagClass: "emerg",
    nameKey: "studio:demo.fund.name.withheld",
    noteKey: "studio:demo.fund.note.rent",
    amount: 600,
  },
  {
    dateIso: "2026-06-05",
    tagKey: "studio:fund.log.tag.grant",
    tagClass: "grant",
    nameKey: "studio:demo.fund.name.helenaAndOthers",
    noteKey: "studio:demo.fund.note.springGrants",
    amount: 1400,
  },
  {
    dateIso: "2026-06-02",
    tagKey: "studio:fund.log.tag.access",
    tagClass: "access",
    nameKey: "studio:demo.fund.name.lgpInterpreter",
    noteKey: "studio:demo.fund.note.marshaSigning",
    amount: 240,
  },
  {
    dateIso: "2026-05-29",
    tagKey: "studio:fund.log.tag.translator",
    tagClass: "trans",
    nameKey: "studio:demo.fund.name.communityPool",
    noteKey: "studio:demo.fund.note.lyricTranslations",
    amount: 380,
  },
  {
    dateIso: "2026-05-24",
    tagKey: "studio:fund.log.tag.emergency",
    tagClass: "emerg",
    nameKey: "studio:demo.fund.name.instrument",
    noteKey: "studio:demo.fund.note.accordion",
    amount: 900,
  },
];

export const DISB_MORE: DisbursementRow[] = [
  {
    dateIso: "2026-05-20",
    tagKey: "studio:fund.log.tag.grant",
    tagClass: "grant",
    person: { first: "Mateus", last: "Faria" },
    noteKey: "studio:demo.fund.note.mateus",
    amount: 1200,
  },
  {
    dateIso: "2026-05-17",
    tagKey: "studio:fund.log.tag.access",
    tagClass: "access",
    nameKey: "studio:demo.fund.name.captioning",
    noteKey: "studio:demo.fund.note.captions",
    amount: 320,
  },
  {
    dateIso: "2026-05-11",
    tagKey: "studio:fund.log.tag.translator",
    tagClass: "trans",
    person: { first: "Pedro", last: "Lima" },
    noteKey: "studio:demo.fund.note.pedro",
    amount: 160,
  },
  {
    dateIso: "2026-05-04",
    tagKey: "studio:fund.log.tag.emergency",
    tagClass: "emerg",
    nameKey: "studio:demo.fund.name.withheld",
    noteKey: "studio:demo.fund.note.medical",
    amount: 750,
  },
  {
    dateIso: "2026-04-28",
    tagKey: "studio:fund.log.tag.transcriber",
    tagClass: "trans",
    person: { first: "Sofia", last: "Neves" },
    noteKey: "studio:demo.fund.note.sofia",
    amount: 135,
  },
  {
    dateIso: "2026-04-21",
    tagKey: "studio:fund.log.tag.grant",
    tagClass: "grant",
    nameKey: "studio:demo.fund.name.springStrand",
    noteKey: "studio:demo.fund.note.springArtists",
    amount: 4800,
  },
];
