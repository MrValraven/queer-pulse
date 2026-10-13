/** A line of call copy: a catalog key with its values (a date given as
 *  `dateIso` is formatted where it renders), or literal content. */
export interface CallText {
  key?: string;
  values?: Record<string, string | number>;
  dateIso?: string;
  text?: string;
}

export interface CallTag {
  labelKey: string;
  labelValues?: Record<string, string | number>;
  cls: string;
}

export interface TrackOption {
  pre: string;
  em?: string;
  /** Shown under the title, joined with " · ". */
  facts: CallText[];
  tint: "coral" | "jade" | "plum";
  image?: string;
}

export interface Call {
  id: string;
  av: string;
  tone?: "jade";
  name: string;
  seatNumber: number;
  tags: CallTag[];
  titleKey: string;
  briefKey: string;
  amount: number;
  amountLabelKey: string;
  meta: CallText[];
  tracks?: TrackOption[];
  placeholderKey?: string;
}

/** Stable filter ids; the label comes from labelKey (§5.1 trap). */
export interface CallFilter {
  id: string;
  labelKey: string;
}

export const FILTERS: CallFilter[] = [
  { id: "all", labelKey: "studio:calls.filter.all" },
  { id: "commissions", labelKey: "studio:calls.filter.commissions" },
  { id: "grants", labelKey: "studio:calls.filter.grants" },
  { id: "residencies", labelKey: "studio:calls.filter.residencies" },
  { id: "closingSoon", labelKey: "studio:calls.filter.closingSoon" },
];

export const CALLS: Call[] = [
  {
    id: "c1",
    av: "SM",
    name: "Sara Marques",
    seatNumber: 1,
    tags: [
      { labelKey: "studio:demo.calls.tag.commission", cls: "tagCommission" },
      {
        labelKey: "studio:demo.calls.tag.closesInDays",
        labelValues: { count: 4 },
        cls: "tagUrgent",
      },
    ],
    titleKey: "studio:demo.calls.marsha.title",
    briefKey: "studio:demo.calls.marsha.brief",
    amount: 800,
    amountLabelKey: "studio:demo.calls.marsha.amountLabel",
    meta: [
      { key: "studio:demo.calls.meta.deadline", dateIso: "2026-06-14" },
      { key: "studio:demo.calls.meta.oneTrack" },
      {
        key: "studio:demo.calls.meta.slotsFilled",
        values: { filled: 4, total: 12 },
      },
    ],
    tracks: [
      {
        pre: "Carta para a ",
        em: "santa",
        facts: [{ text: "2026" }, { text: "4:18" }],
        tint: "coral",
        image:
          "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=600&auto=format&fit=crop",
      },
      {
        pre: "A ",
        em: "Beja",
        facts: [{ text: "2025" }, { text: "3:51" }],
        tint: "plum",
        image:
          "https://images.unsplash.com/photo-1461784180009-21121b2f204c?q=80&w=800&auto=format&fit=crop",
      },
      {
        pre: "Devoção",
        facts: [
          { key: "studio:demo.calls.track.unreleased" },
          { text: "5:02" },
        ],
        tint: "jade",
        image:
          "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop",
      },
    ],
    placeholderKey: "studio:demo.calls.marsha.placeholder",
  },
  {
    id: "c2",
    av: "DO",
    tone: "jade",
    name: "D. Okoye",
    seatNumber: 4,
    tags: [{ labelKey: "studio:demo.calls.tag.grant", cls: "tagGrantCall" }],
    titleKey: "studio:demo.calls.spring.title",
    briefKey: "studio:demo.calls.spring.brief",
    amount: 1200,
    amountLabelKey: "studio:demo.calls.spring.amountLabel",
    meta: [
      { key: "studio:demo.calls.meta.deadline", dateIso: "2026-06-30" },
      { key: "studio:demo.calls.meta.releaseAsEvidence" },
      { key: "studio:demo.calls.meta.grantCount", values: { count: 12 } },
    ],
    tracks: [
      {
        pre: "Cidade dos ",
        em: "santos",
        facts: [
          { key: "studio:releaseType.album" },
          { key: "studio:facts.trackCount", values: { count: 11 } },
        ],
        tint: "coral",
        image:
          "https://images.unsplash.com/photo-1485030056468-3820ff9e6e90?q=80&w=800&auto=format&fit=crop",
      },
      {
        pre: "Devoção",
        facts: [
          { key: "studio:releaseType.ep" },
          { key: "studio:facts.trackCount", values: { count: 9 } },
        ],
        tint: "plum",
        image:
          "https://images.unsplash.com/photo-1506485777791-e120681573dd?q=80&w=800&auto=format&fit=crop",
      },
    ],
    placeholderKey: "studio:demo.calls.spring.placeholder",
  },
  {
    id: "c3",
    av: "YR",
    name: "Yara Reis",
    seatNumber: 3,
    tags: [
      { labelKey: "studio:demo.calls.tag.residency", cls: "tagResidency" },
    ],
    titleKey: "studio:demo.calls.residency.title",
    briefKey: "studio:demo.calls.residency.brief",
    amount: 600,
    amountLabelKey: "studio:demo.calls.residency.amountLabel",
    meta: [
      { key: "studio:demo.calls.meta.deadline", dateIso: "2026-07-20" },
      { key: "studio:demo.calls.meta.trackAndNote" },
      { key: "studio:demo.calls.meta.oneResidency" },
    ],
    tracks: [
      {
        pre: "Carta para a ",
        em: "santa",
        facts: [{ text: "2026" }, { text: "4:18" }],
        tint: "coral",
        image:
          "https://images.unsplash.com/photo-1541126274323-dbac58d14741?q=80&w=800&auto=format&fit=crop",
      },
      {
        pre: "A ",
        em: "Beja",
        facts: [{ text: "2025" }, { text: "3:51" }],
        tint: "plum",
        image:
          "https://images.unsplash.com/photo-1541296481353-b1eb3a4e0309?q=80&w=800&auto=format&fit=crop",
      },
    ],
    placeholderKey: "studio:demo.calls.residency.placeholder",
  },
];
