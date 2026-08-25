import type { ReactNode } from "react";
import type { AvatarTint } from "../../../shared/components/ui/Avatar";
import { leadingInitials } from "../../../shared/lib/initials";
import type { Formatters } from "../../../shared/i18n/format";
import type { TFunction } from "../../../shared/i18n/types";
import type { Author, AuthorArticle } from "../authorContent.data";
import type { Article } from "../data/articles";
import type { SlideDeck } from "../data/decks";
import type { Pitch } from "../pitchTracker.data";
import type {
  ArticleDTO,
  ArticleListItemDTO,
  AuthorDTO,
  DeckDTO,
  DeckListItemDTO,
  IssueDTO,
  SubmissionStatus,
  StorySubmissionDTO,
} from "./magazine.api";

// Map each backend DTO onto the EXISTING mock view-model types the pages
// already render (`Issue`/`Article`/`Author`/`Pitch`). Fields the prototype
// invents that the backend doesn't model (page counts, illustration credits,
// pull-quote styling, editorial workflow stages/notes, ...) are derived
// deterministically or defaulted so nothing renders blank — never fabricated
// as if they were real figures.

const TINTS: AvatarTint[] = ["jade", "plum", "coral"];

/** Deterministic tint pick from a stable seed (author handle / slug). */
export function tintFor(seed: string): AvatarTint {
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return TINTS[hash % TINTS.length]!;
}

/** "Sofia Andrade" -> "SA"; falls back to "QP" for an empty name. */
export function initialsFor(name: string): string {
  return leadingInitials(name, { fallback: "QP" });
}

/**
 * ISO date/datetime -> "June 2026" (pt-PT: "junho de 2026"). Locale-bound via
 * the caller's `fmt` (see `shared/i18n/format.ts`) instead of a hardcoded
 * `toLocaleDateString("en-US", …)` — the two adapters this file used to hand-roll.
 */
export function formatMonthYear(
  iso: string | null | undefined,
  fmt: Formatters,
): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return fmt.date(d, { month: "long", year: "numeric" });
}

/** ISO date -> "6 Jun 2026" (pt-PT: "6 jun. 2026"), locale-bound via `fmt`. */
export function formatDayMonthYear(
  iso: string | null | undefined,
  fmt: Formatters,
): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return fmt.date(d, { day: "numeric", month: "short", year: "numeric" });
}

// ── Issues ───────────────────────────────────────────────────────────────

export interface IssueTile {
  number: string;
  numberLabel: string;
  current: boolean;
  title: ReactNode;
  date: string;
  tint: "a" | "b" | "c" | "d";
  cover: string;
  dek: string;
  meta: { season: string; detail: string };
}

const SEASON_BY_MONTH = [
  "Winter",
  "Winter",
  "Spring",
  "Spring",
  "Spring",
  "Summer",
  "Summer",
  "Summer",
  "Autumn",
  "Autumn",
  "Autumn",
  "Winter",
];
const TILE_TINTS: IssueTile["tint"][] = ["a", "b", "c", "d"];

/** Render a "On <em>health.</em>" style headline from a plain "On health." title. */
export function issueTitleNode(title: string): ReactNode {
  const match = /^(On )(.+)$/.exec(title);
  if (!match) return title;
  const [, prefix, rest] = match;
  return (
    <>
      {prefix}
      <em>{rest}</em>
    </>
  );
}

/**
 * GET /magazine/issues returns issues newest-first, same order as the mock
 * `ISSUES` array — so `index === 0` is "current" and the last row is the
 * inaugural issue, matching the mock's badges.
 */
export function issueToTile(
  dto: IssueDTO,
  index: number,
  total: number,
  fmt: Formatters,
  t: TFunction,
): IssueTile {
  // `publishedOn` is null while an issue is still unscheduled, so every label
  // built from it degrades to "" rather than to an "Invalid Date" string.
  const d = dto.publishedOn ? new Date(dto.publishedOn) : null;
  const hasDate = d !== null && !Number.isNaN(d.getTime());
  const season = hasDate ? SEASON_BY_MONTH[d.getMonth()] : "";
  const year = hasDate ? String(d.getFullYear()) : "";
  const current = index === 0;
  const inaugural = index === total - 1;

  return {
    number: dto.number,
    numberLabel: current
      ? t("magazine:live.issueBadgeCurrent", { number: dto.number })
      : inaugural
        ? t("magazine:live.issueBadgeInaugural", { number: dto.number })
        : t("magazine:live.issueBadge", { number: dto.number }),
    current,
    title: issueTitleNode(dto.title),
    date: [season, year].filter(Boolean).join(" · "),
    tint: TILE_TINTS[index % TILE_TINTS.length]!,
    cover: t("magazine:live.issueCover", {
      number: dto.number,
      title: dto.title.replace(/\.$/, ""),
    }),
    dek: dto.dek,
    meta: {
      season: [season, year].filter(Boolean).join(" ") || dto.publishedOn || "",
      detail: hasDate
        ? t("magazine:live.publishedOn", {
            date: formatDayMonthYear(dto.publishedOn, fmt),
          })
        : "",
    },
  };
}

// ── Articles ─────────────────────────────────────────────────────────────

/** A live article/related-list row adapted into the mock `Article` shape. */
export function articleListItemToArticle(
  dto: ArticleListItemDTO,
  fmt: Formatters,
  t: TFunction,
): Article {
  return {
    id: dto.slug,
    kicker: dto.issueNumber
      ? t("magazine:live.issueBadge", { number: dto.issueNumber })
      : t("magazine:live.fromTheMagazine"),
    section: dto.tags[0] ?? t("magazine:live.sectionFallback"),
    title: dto.title,
    byline: dto.author.displayName,
    role: null,
    date: formatMonthYear(dto.publishedAt, fmt),
    readTime: t("magazine:live.readMinutes", { minutes: dto.readMinutes }),
    initials: initialsFor(dto.author.displayName),
    tint: tintFor(dto.author.handle),
    imgDesc: dto.title,
    authorBio: "",
    tags: dto.tags,
    related: [],
    body: [],
    blocks: [],
  };
}

/** Full article detail (with body) adapted into the mock `Article` shape. */
export function articleResponseToArticle(
  dto: ArticleDTO,
  fmt: Formatters,
  t: TFunction,
  authorBio?: string | null,
): Article {
  return {
    ...articleListItemToArticle(dto, fmt, t),
    authorBio: authorBio ?? "",
    body: dto.body
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .filter(Boolean),
    // Non-empty on articles authored/edited via the block editor — the
    // reader (`ArticlePage.tsx`) prefers these over `body` when present.
    blocks: dto.blocks,
  };
}

// ── Decks ────────────────────────────────────────────────────────────────

/** A live deck/related-list row adapted into the frontend `SlideDeck` shape. */
export function deckListItemToDeck(
  dto: DeckListItemDTO,
  fmt: Formatters,
): SlideDeck {
  return {
    id: dto.slug,
    kicker: dto.kicker,
    section: dto.section,
    title: dto.title,
    byline: dto.byline,
    role: dto.role,
    date: dto.publishedAt ? formatMonthYear(dto.publishedAt, fmt) : "",
    readTime: dto.readTime,
    initials: initialsFor(dto.byline),
    tint: tintFor(dto.slug),
    cover: dto.cover,
    coverDesc: dto.coverDesc,
    authorBio: "",
    tags: dto.tags,
    related: [],
    slides: [],
  };
}

/** Full deck detail (with slides) adapted into the frontend `SlideDeck` shape. */
export function deckResponseToDeck(dto: DeckDTO, fmt: Formatters): SlideDeck {
  return {
    ...deckListItemToDeck(dto, fmt),
    authorBio: dto.authorBio ?? "",
    related: dto.related ?? [],
    slides: dto.slides ?? [],
  };
}

// ── Authors ──────────────────────────────────────────────────────────────

/**
 * A fresh `Author` record built entirely from live data, for a slug with no
 * curated mock profile (CNT-9 fix — `useAuthorPageData` used to 404 any live
 * author outside the 8 curated demo slugs even though `GET
 * /magazine/authors/:slug` is real for all of them). The backend only models
 * `name`/`bio`/`avatarUrl` plus this author's published articles, so the
 * richer editorial-page furniture the curated mocks invent (stats, reading
 * list, "elsewhere" links) is left honestly empty rather than fabricated —
 * `AuthorHeader`/`AuthorWork` already render blank for an empty array/string.
 * `beats` is the one exception: derived from the author's own live articles'
 * tags, which is real data.
 */
export function authorFromDto(
  dto: AuthorDTO,
  liveArticles: ArticleListItemDTO[],
  fmt: Formatters,
  t: TFunction,
): Author {
  const featured = liveArticles[0];
  return {
    slug: dto.slug,
    firstName: dto.name.split(" ")[0] ?? dto.name,
    name: dto.name,
    eyebrow: "",
    role: "",
    pronouns: "",
    bio: dto.bio ?? "",
    stats: [],
    beats: Array.from(
      new Set(liveArticles.flatMap((article) => article.tags)),
    ).slice(0, 6),
    featured: featured
      ? {
          kicker: featured.issueNumber
            ? t("magazine:live.featureIssue", { number: featured.issueNumber })
            : t("magazine:live.sectionFallback"),
          title: featured.title,
          dek: featured.dek,
          publishedDate: featured.publishedAt
            ? new Date(featured.publishedAt)
            : new Date(),
          minutes: featured.readMinutes,
          readsThisWeek: "",
          articleId: featured.slug,
          image: "",
        }
      : {
          kicker: "",
          title: "",
          dek: "",
          publishedDate: new Date(),
          minutes: 0,
          readsThisWeek: "",
          articleId: "",
          image: "",
        },
    articles: liveArticles.map((article): AuthorArticle => ({
      id: article.slug,
      kicker: article.issueNumber
        ? t("magazine:live.issueBadge", { number: article.issueNumber })
        : t("magazine:live.web"),
      title: article.title,
      dek: article.dek,
      meta: article.issueNumber
        ? t("magazine:live.issueBadge", { number: article.issueNumber })
        : formatMonthYear(article.publishedAt, fmt),
    })),
    readingTitle: "",
    readingBlurb: "",
    reading: [],
    elsewhere: [],
    portrait: dto.avatarUrl ?? "",
  };
}

/**
 * Overlay live author data onto the curated mock profile. The backend only
 * models `name`/`bio`/`avatarUrl` plus this author's published articles — the
 * richer editorial-page furniture (stats, beats, reading list, "elsewhere"
 * links) has no backend contract and stays the mock's, in both modes, same
 * as `useMyEventsData`'s documented notifications gap.
 */
export function mergeAuthor(
  base: Author,
  dto: AuthorDTO,
  liveArticles: ArticleListItemDTO[],
  fmt: Formatters,
  t: TFunction,
): Author {
  const featured = liveArticles[0];
  return {
    ...base,
    bio: dto.bio ?? base.bio,
    portrait: dto.avatarUrl ?? base.portrait,
    featured: featured
      ? {
          kicker: featured.issueNumber
            ? t("magazine:live.featureIssue", { number: featured.issueNumber })
            : t("magazine:live.sectionFallback"),
          title: featured.title,
          dek: featured.dek,
          publishedDate: featured.publishedAt
            ? new Date(featured.publishedAt)
            : base.featured.publishedDate,
          minutes: featured.readMinutes,
          // No backend contract for a weekly-reads tally (mock-only stat,
          // same "no live analogue" gap as the editorial furniture below).
          readsThisWeek: base.featured.readsThisWeek,
          articleId: featured.slug,
          image: base.featured.image,
        }
      : base.featured,
    articles: liveArticles.length
      ? liveArticles.map((article): AuthorArticle => ({
          id: article.slug,
          kicker: article.issueNumber
            ? t("magazine:live.issueBadge", { number: article.issueNumber })
            : t("magazine:live.web"),
          title: article.title,
          dek: article.dek,
          meta: article.issueNumber
            ? t("magazine:live.issueBadge", { number: article.issueNumber })
            : formatMonthYear(article.publishedAt, fmt),
        }))
      : base.articles,
  };
}

// ── Story submissions ("my submissions" / pitch tracker) ────────────────

const PITCH_STATUS: Record<SubmissionStatus, Pitch["status"]> = {
  draft: "review",
  submitted: "review",
  in_review: "review",
  accepted: "commissioned",
  published: "published",
  rejected: "rejected",
};

// Catalog keys — label-key indirection, resolved via `t()` in
// `PitchCard.tsx`/`PitchStages.tsx`. Shares the `pitchTracker.stage.*`
// vocabulary with the mock `PITCHES` registry (pitchTracker.data.tsx).
const PITCH_STATUS_LABEL_KEY: Record<SubmissionStatus, string> = {
  draft: "magazine:pitchTracker.statusLabel.draft",
  submitted: "magazine:pitchTracker.statusLabel.submitted",
  in_review: "magazine:pitchTracker.statusLabel.inReview",
  accepted: "magazine:pitchTracker.statusLabel.accepted",
  published: "magazine:pitchTracker.statusLabel.published",
  rejected: "magazine:pitchTracker.statusLabel.rejected",
};

const STAGE_LABEL_KEYS = [
  "magazine:pitchTracker.stage.pitched",
  "magazine:pitchTracker.stage.inReview",
  "magazine:pitchTracker.stage.accepted",
  "magazine:pitchTracker.stage.published",
];
const STAGE_STATUS_ORDER: SubmissionStatus[] = [
  "submitted",
  "in_review",
  "accepted",
  "published",
];

function stagesFor(status: SubmissionStatus): Pitch["stages"] {
  if (status === "rejected") {
    return [
      { labelKey: "magazine:pitchTracker.stage.pitched", state: "done" },
      { labelKey: "magazine:pitchTracker.stage.reviewed", state: "rejected" },
      { labelKey: "magazine:pitchTracker.stage.closed", state: "rejected" },
    ];
  }
  const at = STAGE_STATUS_ORDER.indexOf(
    status === "draft" ? "submitted" : status,
  );
  return STAGE_LABEL_KEYS.map((labelKey, stageIndex) => ({
    labelKey,
    state: stageIndex < at ? "done" : stageIndex === at ? "active" : "upcoming",
  }));
}

/**
 * `StorySubmissionResponse` -> the tracker's `Pitch` card. The backend is
 * read + one write only (no moderation/editorial workflow — see
 * `story-submissions.service.ts`), so there's no live analogue for the
 * mock's editor notes/outline/messaging actions; those stay absent rather
 * than fabricated.
 */
export function submissionToPitch(
  dto: StorySubmissionDTO,
  fmt: Formatters,
): Pitch {
  const pitchPreview =
    dto.pitch.length > 80 ? `${dto.pitch.slice(0, 77).trimEnd()}…` : dto.pitch;
  return {
    id: dto.id,
    title: dto.workingTitle,
    status: PITCH_STATUS[dto.status],
    statusLabelKey: PITCH_STATUS_LABEL_KEY[dto.status],
    type: dto.format,
    meta: [pitchPreview, `Submitted ${formatDayMonthYear(dto.createdAt, fmt)}`],
    stages: stagesFor(dto.status),
    // Read-only in live: the story-submissions backend is read + one write —
    // there's no submission-detail route to open ("View pitch" would route to a
    // coming-soon stub, P2-17) and no withdraw endpoint (a "Withdraw" would only
    // mutate local state and reappear on reload, P3-5). So the live card carries
    // no actions rather than dead affordances. Demo mode keeps its own
    // action-rich `PITCHES` registry (see `pitchTracker.data`).
    actions: [],
    dimmed: dto.status === "rejected",
  };
}
