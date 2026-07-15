import type { ReactNode } from "react";
import type { AvatarTint } from "../../../shared/components/ui/Avatar";
import type { Author, AuthorArticle } from "../authorContent.data";
import type { Article } from "../data/articles";
import type { Pitch } from "../pitchTracker.data";
import type {
  ArticleDTO,
  ArticleListItemDTO,
  AuthorDTO,
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
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  return initials || "QP";
}

/** ISO date/datetime -> "June 2026". */
export function formatMonthYear(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/** ISO date -> "6 Jun 2026". */
export function formatDayMonthYear(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Issues ───────────────────────────────────────────────────────────────

export interface IssueTile {
  num: string;
  numLabel: string;
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
): IssueTile {
  const d = new Date(dto.publishedOn);
  const season = Number.isNaN(d.getTime()) ? "" : SEASON_BY_MONTH[d.getMonth()];
  const year = Number.isNaN(d.getTime()) ? "" : String(d.getFullYear());
  const current = index === 0;
  const inaugural = index === total - 1;

  return {
    num: dto.number,
    numLabel: current
      ? `Issue ${dto.number} · Current`
      : inaugural
        ? `Issue ${dto.number} · Inaugural`
        : `Issue ${dto.number}`,
    current,
    title: issueTitleNode(dto.title),
    date: [season, year].filter(Boolean).join(" · "),
    tint: TILE_TINTS[index % TILE_TINTS.length]!,
    cover: `Issue ${dto.number} · ${dto.title.replace(/\.$/, "")}`,
    dek: dto.dek,
    meta: {
      season: [season, year].filter(Boolean).join(" ") || dto.publishedOn,
      detail: `Published ${formatDayMonthYear(dto.publishedOn)}`,
    },
  };
}

// ── Articles ─────────────────────────────────────────────────────────────

/** A live article/related-list row adapted into the mock `Article` shape. */
export function articleListItemToArticle(dto: ArticleListItemDTO): Article {
  return {
    id: dto.slug,
    kicker: dto.issueNumber ? `Issue ${dto.issueNumber}` : "From the magazine",
    section: dto.tags[0] ?? "Feature",
    title: dto.title,
    byline: dto.author.displayName,
    role: null,
    date: formatMonthYear(dto.publishedAt),
    readTime: `${dto.readMinutes} min`,
    initials: initialsFor(dto.author.displayName),
    tint: tintFor(dto.author.handle),
    imgDesc: dto.title,
    authorBio: "",
    tags: dto.tags,
    related: [],
    body: [],
  };
}

/** Full article detail (with body) adapted into the mock `Article` shape. */
export function articleResponseToArticle(
  dto: ArticleDTO,
  authorBio?: string | null,
): Article {
  return {
    ...articleListItemToArticle(dto),
    authorBio: authorBio ?? "",
    body: dto.body
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .filter(Boolean),
  };
}

// ── Authors ──────────────────────────────────────────────────────────────

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
): Author {
  const featured = liveArticles[0];
  return {
    ...base,
    bio: dto.bio ?? base.bio,
    portrait: dto.avatarUrl ?? base.portrait,
    featured: featured
      ? {
          kicker: featured.issueNumber
            ? `Feature · Issue ${featured.issueNumber}`
            : "Feature",
          title: featured.title,
          dek: featured.dek,
          meta: [
            featured.publishedAt
              ? `Published ${formatDayMonthYear(featured.publishedAt)}`
              : null,
            `${featured.readMinutes} min read`,
          ]
            .filter(Boolean)
            .join(" · "),
          articleId: featured.slug,
          image: base.featured.image,
        }
      : base.featured,
    articles: liveArticles.length
      ? liveArticles.map((a): AuthorArticle => ({
          id: a.slug,
          kicker: a.issueNumber ? `Issue ${a.issueNumber}` : "Web",
          title: a.title,
          dek: a.dek,
          meta: a.issueNumber
            ? `Issue ${a.issueNumber}`
            : formatMonthYear(a.publishedAt),
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

const PITCH_STATUS_LABEL: Record<SubmissionStatus, string> = {
  draft: "Draft",
  submitted: "Submitted · awaiting review",
  in_review: "In review",
  accepted: "Accepted",
  published: "Published",
  rejected: "Not accepted this issue",
};

const STAGE_LABELS = ["Pitched", "In review", "Accepted", "Published"];
const STAGE_STATUS_ORDER: SubmissionStatus[] = [
  "submitted",
  "in_review",
  "accepted",
  "published",
];

function stagesFor(status: SubmissionStatus): Pitch["stages"] {
  if (status === "rejected") {
    return [
      { label: "Pitched", state: "done" },
      { label: "Reviewed", state: "rejected" },
      { label: "Closed", state: "rejected" },
    ];
  }
  const at = STAGE_STATUS_ORDER.indexOf(
    status === "draft" ? "submitted" : status,
  );
  return STAGE_LABELS.map((label, i) => ({
    label,
    state: i < at ? "done" : i === at ? "active" : "upcoming",
  }));
}

/**
 * `StorySubmissionResponse` -> the tracker's `Pitch` card. The backend is
 * read + one write only (no moderation/editorial workflow — see
 * `story-submissions.service.ts`), so there's no live analogue for the
 * mock's editor notes/outline/messaging actions; those stay absent rather
 * than fabricated.
 */
export function submissionToPitch(dto: StorySubmissionDTO): Pitch {
  const pitchPreview =
    dto.pitch.length > 80 ? `${dto.pitch.slice(0, 77).trimEnd()}…` : dto.pitch;
  return {
    id: dto.id,
    title: dto.workingTitle,
    status: PITCH_STATUS[dto.status],
    statusLabel: PITCH_STATUS_LABEL[dto.status],
    type: dto.format,
    meta: [pitchPreview, `Submitted ${formatDayMonthYear(dto.createdAt)}`],
    stages: stagesFor(dto.status),
    actions:
      dto.status === "rejected"
        ? [{ label: "View pitch", primary: true }]
        : [
            { label: "View pitch", primary: true },
            { label: "Withdraw", withdraw: true },
          ],
    dimmed: dto.status === "rejected",
  };
}
