import type { ReactNode } from "react";
import type { Formatters } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import type { TFunction } from "../../shared/i18n/types";
import { StudioNumber } from "./StudioNumber";
import { fixtureDate, WEEKDAY_DAY_MONTH } from "./studioFixtureDate";

export interface TriageKpi {
  v: ReactNode;
  labelKey: string;
  jade?: boolean;
}

// `id` is the stable filter value (used in switch/filter logic and stored in
// component state), so it is never translated; `labelKey`/`queueKey`
// resolve via t().
export interface TriageTab {
  id: string;
  labelKey: string;
  queueKey: string;
  ct: string;
  warn?: boolean;
}

/** A submission row. Built by `buildSubs(t, fmt)` (Pattern B): the who line,
 * badges, artist note and meta strip carry translated copy, titles, names,
 * places and file specs stay literal, and the submitted date is formatted in
 * the active locale. `day` is the number of
 * days the submission has waited; the list renders it through
 * `studioShowcase:triage.sub.day` and filters on it. */
export interface Sub {
  tint: "coral" | "jade" | "plum";
  titlePre: string;
  titleEm?: string;
  who: ReactNode;
  badges: { label: string; cls?: string }[];
  day: number;
  of?: boolean;
  note: string;
  meta: ReactNode[];
  image?: string;
}

/** Median days to a reply, shown in the KPI strip and the header line. */
export const MEDIAN_REPLY_DAYS = 9.4;

export const KPIS: TriageKpi[] = [
  {
    v: (
      <>
        <em>47</em>
      </>
    ),
    labelKey: "studio:triage.kpi.newThisWeek",
  },
  {
    v: (
      <>
        <em>9</em>
      </>
    ),
    labelKey: "studio:triage.kpi.youClaimed",
  },
  {
    v: (
      <>
        <em>
          <StudioNumber value={MEDIAN_REPLY_DAYS} />
        </em>
        d
      </>
    ),
    labelKey: "studio:triage.kpi.medianReply",
    jade: true,
  },
  {
    v: (
      <>
        <em>3</em>
      </>
    ),
    labelKey: "studio:triage.kpi.atDeadline",
  },
];

export const TABS: TriageTab[] = [
  {
    id: "new",
    labelKey: "studio:triage.tabs.new.label",
    queueKey: "studio:triage.tabs.new.queue",
    ct: "47",
  },
  {
    id: "yours",
    labelKey: "studio:triage.tabs.yours.label",
    queueKey: "studio:triage.tabs.yours.queue",
    ct: "9",
  },
  {
    id: "atDeadline",
    labelKey: "studio:triage.tabs.atDeadline.label",
    queueKey: "studio:triage.tabs.atDeadline.queue",
    ct: "3",
    warn: true,
  },
  {
    id: "shortlisted",
    labelKey: "studio:triage.tabs.shortlisted.label",
    queueKey: "studio:triage.tabs.shortlisted.queue",
    ct: "14",
  },
  {
    id: "answered",
    labelKey: "studio:triage.tabs.answered.label",
    queueKey: "studio:triage.tabs.answered.queue",
    ct: "128",
  },
];

export function buildSubs(t: TFunction, fmt: Formatters): Sub[] {
  /** "Submitted <date>" meta entry, the date in the active locale. */
  const submittedOn = (dateIso: string): ReactNode => (
    <Translation
      i18nKey="studioShowcase:triage.sub.meta.submittedOn"
      components={{ em: <em /> }}
      values={{ date: fmt.date(fixtureDate(dateIso), WEEKDAY_DAY_MONTH) }}
    />
  );
  const firstSubmission = t("studioShowcase:triage.sub.badge.firstSubmission");
  const loudnessReady = (loudness: string) =>
    t("studioShowcase:triage.sub.meta.loudnessReady", { loudness });
  const trackCount = (count: number) =>
    t("studioShowcase:triage.sub.badge.trackCount", { count });

  return [
    {
      tint: "coral",
      titlePre: "The piano ",
      titleEm: "I waited for",
      who: (
        <>
          Renato V. · Porto ·{" "}
          <em>{t("studioShowcase:triage.sub.piano.whoTag")}</em>
        </>
      ),
      badges: [
        { label: firstSubmission, cls: "first" },
        { label: trackCount(1) },
        { label: t("studioShowcase:triage.sub.badge.leadSheetAttached") },
        {
          label: t("studioShowcase:triage.sub.badge.lyricsInLanguage", {
            language: "PT",
          }),
        },
        {
          label: t("studioShowcase:triage.sub.badge.claimedByYou"),
          cls: "claimed",
        },
      ],
      day: 9,
      of: true,
      note: t("studioShowcase:triage.sub.piano.note"),
      meta: [
        submittedOn("2026-05-31"),
        "FLAC · 24/48 · 38.4 MB",
        loudnessReady("−14.1 LUFS"),
        t("studioShowcase:triage.sub.meta.lyricTranslationRequested", {
          language: "EN",
        }),
      ],
      image:
        "https://images.unsplash.com/photo-1642444525640-d3eb287ed389?q=80&w=400&auto=format&fit=crop",
    },
    {
      tint: "plum",
      titlePre: "Coro de ",
      titleEm: "Porto",
      who: t("studioShowcase:triage.sub.coro.who", { city: "Porto" }),
      badges: [
        { label: firstSubmission, cls: "first" },
        { label: `${trackCount(4)} · EP` },
        { label: t("studioShowcase:triage.sub.badge.satbScores") },
        { label: "Mirandês + PT" },
      ],
      day: 7,
      of: true,
      note: t("studioShowcase:triage.sub.coro.note"),
      meta: [
        submittedOn("2026-06-02"),
        "FLAC · 24/96 · 412 MB",
        loudnessReady("−15.2 LUFS"),
        t("studioShowcase:triage.sub.meta.translationsAttached", {
          languages: "PT, EN",
        }),
      ],
      image:
        "https://images.unsplash.com/photo-1732719674511-e94d37e7d1c5?q=80&w=800&auto=format&fit=crop",
    },
    {
      tint: "jade",
      titlePre: "Tomboy · ",
      titleEm: "Outubro",
      who: t("studioShowcase:triage.sub.tomboy.who", { city: "São Paulo" }),
      badges: [
        {
          label: t("studioShowcase:triage.sub.badge.mixLength", {
            minutes: 38,
          }),
        },
        { label: "Sapatão-sci-fi" },
        { label: t("studioShowcase:triage.sub.badge.cueSheetAttached") },
        { label: "BR house" },
      ],
      day: 4,
      of: true,
      note: t("studioShowcase:triage.sub.tomboy.note"),
      meta: [
        submittedOn("2026-06-05"),
        "FLAC · 24/44.1 · 1.8 GB",
        t("studioShowcase:triage.sub.meta.clearedSourceArtists", {
          count: 18,
        }),
        t("studioShowcase:triage.sub.meta.cueSheetTrackCount", { count: 18 }),
      ],
      image:
        "https://images.unsplash.com/photo-1736882178500-f99bbe22d77d?q=80&w=800&auto=format&fit=crop",
    },
    {
      tint: "coral",
      titlePre: "Ainda",
      who: (
        <>
          Helena P. · Aveiro ·{" "}
          <em>{t("studioShowcase:triage.sub.ainda.whoTag")}</em>
        </>
      ),
      badges: [
        { label: firstSubmission, cls: "first" },
        { label: trackCount(1) },
        { label: "PT" },
      ],
      day: 11,
      of: true,
      note: t("studioShowcase:triage.sub.ainda.note"),
      meta: [
        submittedOn("2026-05-30"),
        "WAV · 24/48 · 23.4 MB",
        loudnessReady("−13.8 LUFS"),
        t("studioShowcase:triage.sub.meta.noteFromVoucher", {
          name: "Mariana",
        }),
      ],
      image:
        "https://images.unsplash.com/photo-1740508905511-bccff9d04f7d?q=80&w=800&auto=format&fit=crop",
    },
  ];
}

// First element of each tuple is a catalog key for a stable, generic
// file-field label reused across any submission. Built by `buildFile(t)`
// (Pattern B) because the values mix literal specs with translated phrases.
export function buildFile(t: TFunction): [string, ReactNode][] {
  return [
    ["studio:triage.detail.file.format", <>FLAC · 24 bit / 48 kHz</>],
    [
      "studio:triage.detail.file.loudness",
      <>
        <em>−14.1 LUFS</em> ·{" "}
        {t("studioShowcase:triage.detail.file.withinBounds")}
      </>,
    ],
    ["studio:triage.detail.file.duration", <>4:40</>],
    [
      "studio:triage.detail.file.lyrics",
      <>
        {t("studioShowcase:triage.detail.file.translationRequested", {
          original: "PT",
          target: "EN",
        })}
      </>,
    ],
    [
      "studio:triage.detail.file.splits",
      <>
        {t("studioShowcase:triage.detail.file.soleSplit", {
          name: "Renato V.",
        })}
      </>,
    ],
  ];
}

export const WF = [
  40, 65, 55, 80, 60, 50, 72, 58, 46, 88, 62, 54, 80, 42, 68, 75, 48, 60, 84,
  50, 62, 38, 72, 55, 48, 62, 38, 55,
];
