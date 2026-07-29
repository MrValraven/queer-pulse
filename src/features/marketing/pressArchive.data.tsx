import type { ReactNode } from "react";

export interface Piece {
  /** Stable id for list keying (curated pieces + generated archive rows). */
  id: string;
  day: string;
  month: string;
  kind: string;
  pin?: boolean;
  source: ReactNode;
  sourceMuted?: boolean;
  sourceKind: string;
  title: ReactNode;
  meta: ReactNode;
  out: string;
}
export interface YearGroup {
  year: string;
  count: string;
  pieces: Piece[];
}

export const PRESS_DATA: YearGroup[] = [
  {
    year: "2026",
    count: "14 pieces",
    pieces: [
      {
        id: "2026-03-publico",
        day: "04",
        month: "Mar",
        kind: "Long-form",
        pin: true,
        source: "Público",
        sourceKind: "feature",
        title: (
          <>
            "Em Lisboa, uma rede profissional <em>queer e independente</em>."
          </>
        ),
        meta: (
          <>
            By Ana Sá Lopes · 6,400 words · <b>PT</b>
          </>
        ),
        out: "publico.pt",
      },
      {
        id: "2026-02-vice",
        day: "18",
        month: "Feb",
        kind: "Interview",
        source: "Vice Portugal",
        sourceKind: "interview",
        title: (
          <>
            The platform that <em>refuses to scale.</em>
          </>
        ),
        meta: (
          <>
            Interview with Marta Reis · 22 min read · <b>PT/EN</b>
          </>
        ),
        out: "vice.com/pt",
      },
      {
        id: "2026-01-ft",
        day: "24",
        month: "Jan",
        kind: "Feature",
        pin: true,
        source: "FT Weekend",
        sourceKind: "feature",
        title: <>Inside Lisbon's quietest queer institution.</>,
        meta: (
          <>
            Long-form magazine piece · syndicated to FT.com · <b>EN</b>
          </>
        ),
        out: "ft.com",
      },
      {
        id: "2026-01-observador",
        day: "10",
        month: "Jan",
        kind: "News",
        source: "Observador",
        sourceKind: "news",
        title: <>QueerPulse anuncia abertura no Porto em Agosto.</>,
        meta: (
          <>
            By Maria Caetano · 800 words · <b>PT</b>
          </>
        ),
        out: "observador.pt",
      },
    ],
  },
  {
    year: "2025",
    count: "26 pieces",
    pieces: [
      {
        id: "2025-11-mensagem",
        day: "11",
        month: "Nov",
        kind: "Local",
        source: "Mensagem de Lisboa",
        sourceKind: "feature",
        title: (
          <>
            A Câmara dos <em>Anjos.</em>
          </>
        ),
        meta: (
          <>
            Local-press feature on the neighbourhood · <b>PT</b>
          </>
        ),
        out: "amensagem.pt",
      },
      {
        id: "2025-09-dn",
        day: "22",
        month: "Sep",
        kind: "Critique",
        sourceMuted: true,
        source: "Diário de Notícias",
        sourceKind: "op-ed",
        title: <>"A invite-only network · who's left out?"</>,
        meta: (
          <>
            Critical op-ed by António Marreiros · we replied publicly ·{" "}
            <b>PT</b>
          </>
        ),
        out: "dn.pt",
      },
      {
        id: "2025-07-antena1",
        day: "14",
        month: "Jul",
        kind: "Interview",
        source: "Antena 1 · podcast",
        sourceKind: "radio interview",
        title: <>"A nossa entrevista do dia · Catarina Vaz."</>,
        meta: (
          <>
            38 min radio interview · <b>PT</b> · transcript published
          </>
        ),
        out: "rtp.pt",
      },
      {
        id: "2025-04-gsn",
        day: "28",
        month: "Apr",
        kind: "News",
        source: "Gay Star News",
        sourceKind: "news",
        title: <>Lisbon's QueerPulse hits 1,500 members.</>,
        meta: (
          <>
            Short news piece · <b>EN</b>
          </>
        ),
        out: "gaystarnews.com",
      },
      {
        id: "2025-03-wired",
        day: "03",
        month: "Mar",
        kind: "Profile",
        source: "Wired UK",
        sourceKind: "profile",
        title: <>The slow social network.</>,
        meta: (
          <>
            By Caitlin Welsh · 4,200 words · <b>EN</b>
          </>
        ),
        out: "wired.co.uk",
      },
    ],
  },
  {
    year: "2024",
    count: "14 pieces · launch year",
    pieces: [
      {
        id: "2024-12-arena",
        day: "12",
        month: "Dec",
        kind: "Annual",
        source: "Are.na Annual",
        sourceKind: "editor's pick",
        title: <>The 12 platforms we wished existed in 2024.</>,
        meta: (
          <>
            Editor's pick · positioned #4 · <b>EN</b>
          </>
        ),
        out: "are.na",
      },
      {
        id: "2024-10-lemonde",
        day: "04",
        month: "Oct",
        kind: "Profile",
        source: "Le Monde · M Magazine",
        sourceKind: "profile",
        title: <>"Le réseau social qui ne veut pas grandir."</>,
        meta: (
          <>
            3,800 words · <b>FR</b>
          </>
        ),
        out: "lemonde.fr",
      },
      {
        id: "2024-07-publico",
        day: "21",
        month: "Jul",
        kind: "News",
        source: "Público",
        sourceKind: "launch coverage",
        title: (
          <>"QueerPulse · uma nova rede para profissionais LGBTI+ em Lisboa."</>
        ),
        meta: (
          <>
            By Ana Sá Lopes · 1,200 words · <b>PT</b>
          </>
        ),
        out: "publico.pt",
      },
    ],
  },
];

/** Category chips. `match` filters pieces by `sourceKind` keyword (null = all).
 *  Counts are all-time totals shown on the label, not the filtered result size. */
export const PRESS_CHIPS: Array<{
  labelKey: string;
  count: number;
  match: string | null;
}> = [
  { labelKey: "marketing:pressArchive.chip.all", count: 54, match: null },
  {
    labelKey: "marketing:pressArchive.chip.features",
    count: 22,
    match: "feature",
  },
  {
    labelKey: "marketing:pressArchive.chip.interviews",
    count: 12,
    match: "interview",
  },
  { labelKey: "marketing:pressArchive.chip.news", count: 14, match: "news" },
  {
    labelKey: "marketing:pressArchive.chip.critiques",
    count: 6,
    match: "op-ed",
  },
];

/** A deterministic "older archive" generated from the curated pieces, so
 *  "Load more" appends real rows instead of toasting into the void. Each row
 *  gets a unique id (rows repeat their source piece, so a content key can't
 *  be unique). */
export const PRESS_OLDER: YearGroup[] = [
  {
    year: "2023",
    count: "18 pieces",
    pieces: Array.from({ length: 5 }, (_unused, index) => {
      const base = PRESS_DATA[1]!.pieces[index % PRESS_DATA[1]!.pieces.length]!;
      return {
        ...base,
        id: `2023-archive-${index}`,
        pin: false,
        sourceKind: `${base.sourceKind} · archive`,
      };
    }),
  },
  {
    year: "2022",
    count: "18 pieces",
    pieces: Array.from({ length: 5 }, (_unused, index) => {
      const base = PRESS_DATA[2]!.pieces[index % PRESS_DATA[2]!.pieces.length]!;
      return {
        ...base,
        id: `2022-archive-${index}`,
        pin: false,
        sourceKind: `${base.sourceKind} · archive`,
      };
    }),
  },
];
