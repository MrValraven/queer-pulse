import type { ReactNode } from "react";
import type { ImageSlotTint } from "../../shared/components/ui/ImageSlot";
import { routes } from "../../app/routeMap";

/** Season stats shown in the hero sidebar. Labels are catalog keys (Pattern A);
 * values are this season's own figures and are not translatable text. */
export const heroStats: { labelKey: string; v: ReactNode }[] = [
  {
    labelKey: "cinema:openCalls.hero.stat.totalAvailable",
    v: (
      <>
        €<em>13.2k</em>
      </>
    ),
  },
  { labelKey: "cinema:openCalls.hero.stat.activeCalls", v: <em>4</em> },
  {
    labelKey: "cinema:openCalls.hero.stat.applicationsSoFar",
    v: <em>28</em>,
  },
  { labelKey: "cinema:openCalls.hero.stat.filmsFunded", v: <em>12</em> },
];

export type CallStatus = "closing" | "open";

export interface Commission {
  id: string;
  type: string;
  status: CallStatus;
  statusLabel: string;
  titlePre: string;
  titleEm: string;
  titlePost?: string;
  body: ReactNode;
  details: { k: string; v: ReactNode }[];
  amount: ReactNode;
  amountLabel: string;
  deadline: string;
  remaining: string;
  applied: string;
}

export const commissions: Commission[] = [
  {
    id: "lisbon-after-flood",
    type: "Commission · short film",
    status: "closing",
    statusLabel: "Closing soon",
    titlePre: "Lisbon, after ",
    titleEm: "the flood",
    body: (
      <>
        <p>
          A commissioned short (10–25 min) responding to the January 2026
          flooding of the Tagus plain — from a queer perspective, however you
          interpret that. The film does not have to be about the flood itself:
          it can be about what survives, what's lost, what's still being built
          in the months after.
        </p>
        <p>
          <em>No prior exhibition credits required.</em> First-time filmmakers
          are strongly encouraged. Mentorship included from a working
          documentary filmmaker.
        </p>
      </>
    ),
    details: [
      {
        k: "Format",
        v: (
          <>
            Short · <em>10–25 min</em>
          </>
        ),
      },
      {
        k: "Applications",
        v: (
          <>
            <em>13</em> so far
          </>
        ),
      },
      { k: "Mentorship", v: <em>Included</em> },
      { k: "Territory", v: "Portugal" },
    ],
    amount: (
      <>
        €<em>2,500</em>
      </>
    ),
    amountLabel: "Commission fee",
    deadline: "Sunday 21 June 2026",
    remaining: "12 days remaining",
    applied: "13 applications received",
  },
  {
    id: "trans-elders-oral-history",
    type: "Commission · documentary",
    status: "open",
    statusLabel: "Open",
    titlePre: "A trans elders ",
    titleEm: "oral history",
    body: (
      <>
        <p>
          A feature documentary commission (50–90 min) to document the living
          memory of trans elders in Portugal, Spain, or Brazil. Priority given
          to filmmakers who are themselves trans. The film will be the anchor of
          a new collection curated by D. Okoye.
        </p>
        <p>
          Full production support: archive access, DCP mastering, captioning,
          and a dedicated community screening at QueerPulse's Lisbon gathering
          in November 2026.
        </p>
      </>
    ),
    details: [
      {
        k: "Format",
        v: (
          <>
            Doc · <em>50–90 min</em>
          </>
        ),
      },
      {
        k: "Applications",
        v: (
          <>
            <em>7</em> so far
          </>
        ),
      },
      { k: "Support", v: <em>Full</em> },
      {
        k: "Premiere",
        v: (
          <>
            Nov <em>2026</em>
          </>
        ),
      },
    ],
    amount: (
      <>
        €<em>8,000</em>
      </>
    ),
    amountLabel: "Commission fee",
    deadline: "Tuesday 30 June 2026",
    remaining: "21 days remaining",
    applied: "7 applications received",
  },
];

export interface SmallCall {
  id: string;
  kicker: string;
  titlePre: string;
  titleEm: string;
  titlePost?: string;
  body: string;
  meta: { v: ReactNode; k: string }[];
  secondaryLabel: string;
  /** Real destination for the secondary CTA (a `routes.*` slug) so it isn't a
   * dead "coming soon" toast (P3-16). */
  secondaryTo: string;
}

export const smallCalls: SmallCall[] = [
  {
    id: "casa-do-comum-residency",
    kicker: "Residency · 2 weeks",
    titlePre: "Two weeks at ",
    titleEm: "Casa do Comum",
    body: "Paid two-week residency at Casa do Comum in Lisbon — working space, accommodation, and daily access to the queer archive. Open to filmmakers at any stage. No deliverable required: come to make, think, or rest.",
    meta: [
      {
        v: (
          <>
            €<em>1,200</em>
          </>
        ),
        k: "Stipend",
      },
      { v: <em>5 Jul</em>, k: "Deadline" },
      {
        v: (
          <>
            <em>4</em> spots
          </>
        ),
        k: "Available",
      },
    ],
    secondaryLabel: "Learn more",
    secondaryTo: routes.cinemaAbout,
  },
  {
    id: "first-feature-mentorship",
    kicker: "Mentorship · ongoing",
    titlePre: "First feature, ",
    titleEm: "any stage",
    body: "Paired one-to-one mentorship with a working queer filmmaker — development, pre-production, rough cut feedback. 4 months, 8 sessions. Mentors include Maria Vasconcelos, Akin Diallo, and Laila Hassan.",
    meta: [
      { v: "Free", k: "Cost" },
      { v: <em>15 Jul</em>, k: "Deadline" },
      {
        v: (
          <>
            <em>4</em> spots
          </>
        ),
        k: "Available",
      },
    ],
    secondaryLabel: "Meet the mentors",
    secondaryTo: routes.cinemaFilmmaker,
  },
];

export interface PastFilm {
  id: string;
  grant: string;
  titlePre: string;
  titleEm?: string;
  titlePost?: string;
  meta: string;
  tint: ImageSlotTint;
  image: string;
}

const POSTER = "?auto=format&fit=crop&w=600&h=800&q=80";

export const pastFunded: PastFilm[] = [
  {
    id: "pharmacy-3am",
    grant: "€2k grant",
    titlePre: "The pharmacy at 3am",
    meta: "Rui Almeida · PT · 2026 · spring grant",
    tint: "coral",
    image: `https://images.unsplash.com/photo-1671408913477-7fad16acaac2${POSTER}`,
  },
  {
    id: "grandmother-did-say",
    grant: "€1.5k grant",
    titlePre: "What my grandmother ",
    titleEm: "did",
    titlePost: " say",
    meta: "Helena P. · PT · 2026 · spring grant",
    tint: "plum",
    image: `https://images.unsplash.com/photo-1663429122432-c2769373768f${POSTER}`,
  },
  {
    id: "first-sunday",
    grant: "Community funded",
    titlePre: "The first ",
    titleEm: "Sunday",
    meta: "Inês T. · PT · 2026 · sustainer pool",
    tint: "jade",
    image: `https://images.unsplash.com/photo-1552600552-4d7c157e7db8${POSTER}`,
  },
  {
    id: "bicha-with-love",
    grant: "€3k grant",
    titlePre: "Bicha, with love",
    meta: "Mateus F. · BR · 2025 · autumn grant",
    tint: "coral",
    image: `https://images.unsplash.com/photo-1527154341204-319eeba2d06e${POSTER}`,
  },
];

export interface FundStep {
  num: string;
  /** Catalog key with an embedded <em>-emphasis run, via <Translation>. */
  titleKey: string;
  /** Catalog key; step 1's body also needs `price`/`poolShare` interpolation. */
  bodyKey: string;
}

/** i18n Pattern A — this evergreen "how it works" copy is platform chrome,
 * translated via titleKey/bodyKey; the consumer resolves via t()/<Translation>. */
export const fundSteps: FundStep[] = [
  {
    num: "01",
    titleKey: "cinema:openCalls.how.step1.title",
    bodyKey: "cinema:openCalls.how.step1.body",
  },
  {
    num: "02",
    titleKey: "cinema:openCalls.how.step2.title",
    bodyKey: "cinema:openCalls.how.step2.body",
  },
  {
    num: "03",
    titleKey: "cinema:openCalls.how.step3.title",
    bodyKey: "cinema:openCalls.how.step3.body",
  },
  {
    num: "04",
    titleKey: "cinema:openCalls.how.step4.title",
    bodyKey: "cinema:openCalls.how.step4.body",
  },
];
