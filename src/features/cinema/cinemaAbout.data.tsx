import type { ReactNode } from "react";

/** The "deed" in plain language — serif paragraphs with coral emphasis. */
export const deedParagraphs: ReactNode[] = [
  <>
    QueerPulse Cinema exists because streaming platforms were not built for us.
    They take 70%. They show our films between things we'd never choose. They
    bury our communities in single-identity tags and algorithmic traps.
  </>,
  <>
    So we built something different. <strong>80% of every rent or buy</strong>{" "}
    goes to the filmmaker, paid the following Monday. 100% of every tip goes to
    them directly. The split is the same for every filmmaker, with no
    exceptions, ever.
  </>,
  <>
    The contract is non-exclusive. <em>You keep your film.</em> You can show it
    anywhere else. We hold no lock-in, no territory exclusivity, no right of
    first refusal. We're not owning it — we're showing it.
  </>,
  <>
    The curators' council — six people, rotating yearly — programmes the
    catalogue. They're paid a stipend voted on by patron-level sustainers. The
    ledger is public. The commissioning fund is public. The split calculation is
    public.
  </>,
  <>
    <em>That's the whole deal.</em>
  </>,
];

export interface Principle {
  num: string;
  title: ReactNode;
  body: ReactNode;
}

export const principles: Principle[] = [
  {
    num: "01",
    title: (
      <>
        The filmmaker <em>comes first</em>
      </>
    ),
    body: (
      <>
        80% of every transaction, paid weekly. 100% of tips. The split is the
        same for everyone. No exceptions. No renegotiation.{" "}
        <em>It's in the deed.</em>
      </>
    ),
  },
  {
    num: "02",
    title: (
      <>
        Programming is <em>authorship</em>
      </>
    ),
    body: "Curators aren't moderators. They're authors — they write introductions, build arguments, programme sequences. Their names are on everything they choose.",
  },
  {
    num: "03",
    title: (
      <>
        Access is <em>first-class</em>
      </>
    ),
    body: "Every film has captions. Audio description grows weekly. Content notes with timecodes on every title. Sign language tracks where we can. This is not a nice-to-have.",
  },
  {
    num: "04",
    title: (
      <>
        Non-exclusive, <em>always</em>
      </>
    ),
    body: "We never own the film. Filmmakers can show it anywhere, any time, in any format. No territory exclusivity. No lock-in. The contract terminates with 30 days' notice from either party.",
  },
  {
    num: "05",
    title: (
      <>
        The ledger is <em>public</em>
      </>
    ),
    body: "Every month we publish: total paid to filmmakers, total streams, average filmmaker share, commissioning pool balance. Audited quarterly. No asterisks.",
  },
  {
    num: "06",
    title: (
      <>
        The door <em>stays open</em>
      </>
    ),
    body: "Community films are always free. Open events are always free. A sustainer's fee is never a condition of watching something that was made here, for the community.",
  },
];

/** Revenue-split visual — how a €3.00 rental divides. */
export const splitSegments = [
  { pct: 80, tone: "fm" as const },
  { pct: 12, tone: "pay" as const },
  { pct: 8, tone: "host" as const },
];

export const splitLegend: { value: ReactNode; label: string }[] = [
  {
    value: (
      <>
        €<em>2.40</em>
      </>
    ),
    label: "Filmmaker (80%)",
  },
  {
    value: (
      <>
        €<em>0.36</em>
      </>
    ),
    label: "Payment fees (12%)",
  },
  {
    value: (
      <>
        €<em>0.24</em>
      </>
    ),
    label: "Hosting (8%)",
  },
];

export interface Curator {
  initials: string;
  slug: string;
  tone: "coral" | "jade" | "plum";
  name: ReactNode;
  role: string;
  pronouns: string;
  bio: string;
  focus: string[];
}

export const curators: Curator[] = [
  {
    initials: "JR",
    slug: "joao-ribeiro",
    tone: "coral",
    name: (
      <>
        João <em>Ribeiro</em>
      </>
    ),
    role: "Programming lead · Lisbon",
    pronouns: "he/him",
    bio: "Documentary and essay film. Specialises in Iberian cinema and the politics of the archive. Programmes the cover film each week.",
    focus: ["PT", "Documentary", "Archive"],
  },
  {
    initials: "DO",
    slug: "d-okoye",
    tone: "jade",
    name: (
      <>
        D. <em>Okoye</em>
      </>
    ),
    role: "Curator · Lagos / London",
    pronouns: "they/them",
    bio: "West African ballroom, diaspora cinema, and trans documentary. Focuses on films where the subject and filmmaker are in genuine collaboration.",
    focus: ["West Africa", "Ballroom", "Trans"],
  },
  {
    initials: "SM",
    slug: "sara-marques",
    tone: "coral",
    name: (
      <>
        Sara <em>Marques</em>
      </>
    ),
    role: "Curator · Lisbon",
    pronouns: "she/her",
    bio: "Narrative feature and generational storytelling. Programmes the Made Here track and manages filmmaker submissions. Writes the weekly curator's notebook.",
    focus: ["Narrative", "Made here", "PT/BR"],
  },
  {
    initials: "YR",
    slug: "yara-reis",
    tone: "plum",
    name: (
      <>
        Yara <em>Reis</em>
      </>
    ),
    role: "Curator · São Paulo",
    pronouns: "she/her",
    bio: "Lesbian sci-fi, speculative documentary, and non-Western queer futures. Manages the East Asian and Latin American collection tracks.",
    focus: ["Sci-fi", "BR", "East Asia"],
  },
  {
    initials: "SC",
    slug: "sofia-castro",
    tone: "jade",
    name: (
      <>
        Sofía <em>Castro</em>
      </>
    ),
    role: "Curator · Madrid",
    pronouns: "ella/ella",
    bio: "Spanish and Galician queer cinema. Co-curates the Iberian collection with João. Specialist in regional cinema and languages that don't appear in mainstream catalogues.",
    focus: ["ES", "Galician", "Regional"],
  },
  {
    initials: "LH",
    slug: "laila-hassan",
    tone: "coral",
    name: (
      <>
        Laila <em>Hassan</em>
      </>
    ),
    role: "Curator · Cairo / London",
    pronouns: "she/her",
    bio: "North African and Middle Eastern cinema and the politics of archiving under censorship. Manages the access and translation programme.",
    focus: ["MENA", "Archive", "Access"],
  },
];

/** Governance tables — public ledger + how decisions get made. */
export const ledgerRows: { k: string; v: ReactNode }[] = [
  {
    k: "Sustainers",
    v: (
      <>
        <em>1,240</em>
      </>
    ),
  },
  {
    k: "Paid to filmmakers this month",
    v: (
      <>
        €<em>8,420</em>
      </>
    ),
  },
  {
    k: "Films streamed this month",
    v: (
      <>
        14,<em>207</em>
      </>
    ),
  },
  {
    k: "Average filmmaker share",
    v: (
      <>
        <em>82</em>%
      </>
    ),
  },
  {
    k: "Commissioning pool (season 3)",
    v: (
      <>
        €<em>13.2k</em>
      </>
    ),
  },
  {
    k: "Films in catalogue",
    v: (
      <>
        <em>142</em>
      </>
    ),
  },
];

export const decisionRows: { k: string; v: ReactNode }[] = [
  {
    k: "Programme decisions",
    v: (
      <>
        Curators' <em>council</em>
      </>
    ),
  },
  {
    k: "Curator stipend",
    v: (
      <>
        Patron <em>vote</em>
      </>
    ),
  },
  {
    k: "Revenue split",
    v: (
      <>
        Non-<em>negotiable</em>
      </>
    ),
  },
  {
    k: "Open call briefs",
    v: (
      <>
        Council + <em>community</em>
      </>
    ),
  },
  {
    k: "Annual assembly",
    v: (
      <>
        All <em>patrons</em>
      </>
    ),
  },
  {
    k: "Audit",
    v: (
      <>
        <em>Quarterly</em>
      </>
    ),
  },
];
