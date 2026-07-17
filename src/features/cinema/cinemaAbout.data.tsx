import type { ReactNode } from "react";
import { Translation } from "../../shared/i18n/Translation";
import type { Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";

/**
 * i18n Pattern B. The deed/principles/split/governance copy is
 * platform-authored co-op chrome — it ships in the bundle in both demo and
 * live mode, so every paragraph here is translated. Curator names, roles,
 * pronouns, bios and focus tags below are that person's own profile content
 * and stay in English (docs/i18n/extraction-brief.md §1).
 */
export function buildDeedParagraphs(t: TFunction): ReactNode[] {
  return [
    <p key="p1">{t("cinema:about.deed.p1")}</p>,
    <p key="p2">
      <Translation
        i18nKey="cinema:about.deed.p2"
        components={{ strong: <strong /> }}
      />
    </p>,
    <p key="p3">
      <Translation i18nKey="cinema:about.deed.p3" components={{ em: <em /> }} />
    </p>,
    <p key="p4">{t("cinema:about.deed.p4")}</p>,
    <p key="p5">
      <Translation i18nKey="cinema:about.deed.p5" components={{ em: <em /> }} />
    </p>,
  ];
}

export interface Principle {
  num: string;
  title: ReactNode;
  body: ReactNode;
}

const PRINCIPLE_KEYS = [
  {
    num: "01",
    titleKey: "cinema:about.principles.p1.title",
    bodyKey: "cinema:about.principles.p1.body",
  },
  {
    num: "02",
    titleKey: "cinema:about.principles.p2.title",
    bodyKey: "cinema:about.principles.p2.body",
  },
  {
    num: "03",
    titleKey: "cinema:about.principles.p3.title",
    bodyKey: "cinema:about.principles.p3.body",
  },
  {
    num: "04",
    titleKey: "cinema:about.principles.p4.title",
    bodyKey: "cinema:about.principles.p4.body",
  },
  {
    num: "05",
    titleKey: "cinema:about.principles.p5.title",
    bodyKey: "cinema:about.principles.p5.body",
  },
  {
    num: "06",
    titleKey: "cinema:about.principles.p6.title",
    bodyKey: "cinema:about.principles.p6.body",
  },
];

/**
 * Every title/body here renders via `<Translation>`, which resolves its own
 * string from the i18n context when mounted — there's no `t()` call to make
 * here, so (unlike the other builders in this file) this one takes no
 * translate function.
 */
export function buildPrinciples(): Principle[] {
  return PRINCIPLE_KEYS.map(({ num, titleKey, bodyKey }) => ({
    num,
    title: <Translation i18nKey={titleKey} components={{ em: <em /> }} />,
    body: <Translation i18nKey={bodyKey} components={{ em: <em /> }} />,
  }));
}

/** Revenue-split visual — how a rental divides. Percentages are fixed by the
 * co-op deed (see about.split.body1/2/3), not computed from these segments. */
export const splitSegments = [
  { pct: 80, tone: "fm" as const },
  { pct: 12, tone: "pay" as const },
  { pct: 8, tone: "host" as const },
];

export function buildSplitLegend(
  fmt: Formatters,
  t: TFunction,
): { value: ReactNode; label: string }[] {
  return [
    {
      value: <em>{fmt.currency(2.4)}</em>,
      label: t("cinema:about.split.legend.filmmaker"),
    },
    {
      value: <em>{fmt.currency(0.36)}</em>,
      label: t("cinema:about.split.legend.paymentFees"),
    },
    {
      value: <em>{fmt.currency(0.24)}</em>,
      label: t("cinema:about.split.legend.hosting"),
    },
  ];
}

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

/** Governance tables — public ledger + how decisions get made. Chrome labels
 * and figures; `buildLedgerRows`/`buildDecisionRows` take `t`/`fmt` so
 * amounts format per locale instead of baking a currency/number in. */
export function buildLedgerRows(
  t: TFunction,
  fmt: Formatters,
): { k: string; v: ReactNode }[] {
  return [
    {
      k: t("cinema:about.gov.ledger.sustainers"),
      v: <em>{fmt.number(1240)}</em>,
    },
    {
      k: t("cinema:about.gov.ledger.paidToFilmmakers"),
      v: <em>{fmt.currency(8420)}</em>,
    },
    {
      k: t("cinema:about.gov.ledger.filmsStreamed"),
      v: <em>{fmt.number(14207)}</em>,
    },
    {
      k: t("cinema:about.gov.ledger.averageShare"),
      v: (
        <>
          <em>{fmt.number(82)}</em>%
        </>
      ),
    },
    {
      k: t("cinema:about.gov.ledger.commissioningPool", { season: 3 }),
      v: <em>{fmt.currency(13200)}</em>,
    },
    {
      k: t("cinema:about.gov.ledger.filmsInCatalogue"),
      v: <em>{fmt.number(142)}</em>,
    },
  ];
}

export function buildDecisionRows(t: TFunction): { k: string; v: ReactNode }[] {
  return [
    {
      k: t("cinema:about.gov.decision.programme"),
      v: (
        <Translation
          i18nKey="cinema:about.gov.decision.programmeValue"
          components={{ em: <em /> }}
        />
      ),
    },
    {
      k: t("cinema:about.gov.decision.stipend"),
      v: (
        <Translation
          i18nKey="cinema:about.gov.decision.stipendValue"
          components={{ em: <em /> }}
        />
      ),
    },
    {
      k: t("cinema:about.gov.decision.revenueSplit"),
      v: (
        <Translation
          i18nKey="cinema:about.gov.decision.revenueSplitValue"
          components={{ em: <em /> }}
        />
      ),
    },
    {
      k: t("cinema:about.gov.decision.openCallBriefs"),
      v: (
        <Translation
          i18nKey="cinema:about.gov.decision.openCallBriefsValue"
          components={{ em: <em /> }}
        />
      ),
    },
    {
      k: t("cinema:about.gov.decision.annualAssembly"),
      v: (
        <Translation
          i18nKey="cinema:about.gov.decision.annualAssemblyValue"
          components={{ em: <em /> }}
        />
      ),
    },
    {
      k: t("cinema:about.gov.decision.audit"),
      v: (
        <Translation
          i18nKey="cinema:about.gov.decision.auditValue"
          components={{ em: <em /> }}
        />
      ),
    },
  ];
}
