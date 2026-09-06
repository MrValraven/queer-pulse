import {
  apiDelete,
  apiGet,
  apiGetNullable,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";
import type { CropRect } from "../../../shared/components/ui/cropGeometry";
import type { Slide } from "../data/decks";
import type { ArticleBlock } from "./pieces.api";

// ── Backend DTOs ───────────────────────────────────────────────────────────
// Shapes the NestJS magazine domain returns (mirrors
// `queerpulse-backend/src/magazine/magazine-response.ts` / contracts.ts's
// "--- Magazine ---" section verbatim).

export interface AuthorSummaryDTO {
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  /** CON-11 — member profile slug when this byline is a real account. */
  memberSlug: string | null;
}

export interface IssueDTO {
  number: string;
  title: string;
  dek: string;
  /** YYYY-MM-DD, or null while the issue is still unscheduled. */
  publishedOn: string | null;
  /** The desk's uploaded cover art, already resolved to a fetchable URL by the
   *  backend. `null` when no cover was uploaded, in which case every reader
   *  surface keeps its tinted `ImageSlot` placeholder. */
  coverUrl: string | null;
  /** The reframe rect a staff editor saved for `coverUrl`. Rendered as
   *  `ImageSlot`'s `focus` (a focal point), never as `crop` (an exact frame):
   *  a cover slot is a fixed 3/4 box whose aspect never matches an arbitrary
   *  rect, and the exact-frame prop would distort the art. */
  crop?: CropRect;
}

/** A row as returned by GET /magazine/articles (list) — no `body`. */
export interface ArticleListItemDTO {
  slug: string;
  title: string;
  dek: string;
  author: AuthorSummaryDTO;
  issueNumber: string | null;
  tags: string[];
  readMinutes: number;
  /** ISO 8601, or null for an unpublished/web-only piece. */
  publishedAt: string | null;
  /** CON-04 — the piece's lead art, already resolved to a fetchable URL by the
   *  backend. `null` when the desk commissioned none, in which case the card
   *  keeps its tinted `ImageSlot` placeholder. */
  heroImageUrl: string | null;
  /** CON-16 — where this piece stands today. A card can mark an archived or
   *  superseded piece rather than presenting a 2024 guide as current. */
  lifecycle: ArticleLifecycle;
  /** CON-16 — the language this row is written in. An issue is often only
   *  partly translated, so each card states its own language. */
  locale: ContentLocale;
  /**
   * PRD-102 — the desk's own kicker and section for this piece. Required on
   * the detail read (`ArticleDTO` below narrows both to `string`); optional
   * here because `GET /magazine/articles` does not project the two columns
   * yet. Every adapter therefore falls back to the derived label when they are
   * absent, so a card is never blank while the list read catches up.
   */
  kicker?: string;
  section?: string;
}

/**
 * CON-16 — where a published piece stands, independent of whether it is
 * published at all.
 *
 *  - `live` — current; the desk stands by it as written.
 *  - `under_review` — being re-checked against the law or service as they
 *    stand now; parts may already be out of date.
 *  - `archived` — of its time, kept as a record, no longer maintained.
 *  - `superseded` — a newer piece replaces it (see `supersededBy`).
 */
export type ArticleLifecycle =
  "live" | "under_review" | "archived" | "superseded";

/** CON-16 — the languages the magazine publishes journalism in. Mirrors
 *  `Language` in `shared/i18n/types.ts`, so the reader's chrome language is
 *  directly usable as a content language. */
export type ContentLocale = "en" | "pt";

/**
 * CON-16 — everything the dated lifecycle banner says beyond the state itself
 * (which is the article's `lifecycle`).
 */
export interface ArticleLifecycleNoticeDTO {
  /** The editor's own sentence, or `""` when the banner falls back to the
   *  generic wording for the state. */
  note: string;
  /** ISO 8601 instant the piece entered this state, or null. This is the DATE
   *  in "dated banner". */
  changedAt: string | null;
  /** YYYY-MM-DD, or null when no re-review is scheduled. */
  reviewDueOn: string | null;
  supersededBy: { slug: string; title: string } | null;
}

/** CON-16 — one language this piece is readable in, for the switcher. Always
 *  includes the piece the reader is currently on. */
export interface ArticleTranslationDTO {
  locale: ContentLocale;
  slug: string;
  title: string;
  /** False for a translation that is drafted but not shipped: the switcher
   *  shows it as in progress rather than linking the reader to a 404. */
  isPublished: boolean;
}

/**
 * A published correction against this piece (CON-02). The desk promises the
 * reader "A correction is published as a dated note at the foot of the piece.
 * We never edit silently", so the note travels with the article.
 */
export interface ArticleCorrectionDTO {
  id: string;
  text: string;
  /** YYYY-MM-DD — the day the correction went up. */
  publishedOn: string;
}

/** Full article detail from GET /magazine/articles/:slug. */
export interface ArticleDTO extends ArticleListItemDTO {
  /** Plain text, paragraphs separated by blank lines. */
  body: string;
  /**
   * Block-based body (Phase 3 §7.3), sourced from the block editor's jsonb
   * `blocks` column. Empty on articles that predate the block editor — the
   * reader falls back to `body` in that case (see `ArticlePage.tsx`).
   */
  blocks: ArticleBlock[];
  standfirst: string;
  kicker: string;
  section: string;
  /**
   * CON-06 — the care-tab content notes. The publish gate refuses a piece
   * without at least one, and the reader is who they are for.
   */
  contentNotes: string[];
  /** CON-02 — newest first; empty for a piece that has never been corrected. */
  corrections: ArticleCorrectionDTO[];
  /** CON-17 — the SEO rail's three fields. Each is empty/null when the editor
   *  left it blank, and the reader falls back to the derived behaviour. */
  metaDescription: string;
  socialImage: string | null;
  canonicalUrl: string;
  /** CON-04 — the reframe crop saved for `heroImageUrl`, when a staff editor
   *  reframed the art. Rendered as `ImageSlot`'s `focus` (a focal point), never
   *  as `crop` (an exact frame): the hero is a full-bleed banner whose box
   *  aspect never matches an arbitrary crop, and `crop` would distort it. */
  heroCrop?: CropRect;
  /** CON-16 — the rest of the dated lifecycle banner. Always present; a `live`
   *  piece draws no banner. */
  lifecycleNotice: ArticleLifecycleNoticeDTO;
  /** CON-16 — every language this piece is readable in, the current one
   *  included. A single entry means there is no translation. */
  translations: ArticleTranslationDTO[];
  /** CON-16 — the original this piece translates, or null when it IS the
   *  original. */
  translationOf: { locale: ContentLocale; slug: string } | null;
  /** CON-16 — the translator's byline. `author` above stays the writer's,
   *  always: both people wrote this. */
  translator: AuthorSummaryDTO | null;
}

export interface ArticlesPage {
  items: ArticleListItemDTO[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuthorDTO {
  slug: string;
  name: string;
  bio: string | null;
  /** The byline's own portrait, or the linked member's avatar as a fallback. */
  avatarUrl: string | null;
  /** CON-11 — member profile slug when this byline is a real account. */
  memberSlug: string | null;
  /** Published pieces carrying this byline. */
  pieceCount: number;
}

/**
 * `PATCH /magazine/authors/me` (the linked member) and
 * `PATCH /magazine/admin/authors/:slug` (a `magazine_editor`).
 *
 * Send ONLY what changed. An unchanged `avatarUrl` re-sent by a staff editor
 * would name an upload somebody else made, which the backend's foreign-upload
 * check refuses. `name` and `memberSlug` are staff-only; the member's own
 * PATCH ignores them.
 */
export interface UpdateAuthorDto {
  name?: string;
  bio?: string;
  avatarUrl?: string | null;
  /** Profile slug to link, or `null` to unlink. Staff only. */
  memberSlug?: string | null;
}

/** A row as returned by GET /magazine/sections (CNT-20) — the seeded
 *  section/topic taxonomy (mirrors `magazine-response.ts` `SectionResponse`). */
export interface SectionDTO {
  id: string;
  name: string;
  target: number;
  note: string;
  orderIndex: number;
}

export type SubmissionStatus =
  "draft" | "submitted" | "in_review" | "accepted" | "rejected" | "published";

/** The staff verdict on a submission. Kept out of `SubmissionStatus` on
 *  purpose: `accepted` and `commissioned` both land `status` on `accepted`,
 *  and widening `SubmissionStatus` would break every exhaustive map keyed on
 *  it (see `magazine.adapters.tsx`). */
export type SubmissionDecision = "accepted" | "declined" | "commissioned";

export interface StorySubmissionDTO {
  id: string;
  format: string;
  workingTitle: string;
  pitch: string;
  deck: string | null;
  coverUrl: string | null;
  status: SubmissionStatus;
  decision: SubmissionDecision | null;
  /** The reply the decider wrote back, shown on the member's tracker card. */
  decisionNote: string | null;
  decidedAt: string | null;
  createdAt: string;
}

export interface CreateStorySubmissionDto {
  format: string;
  workingTitle: string;
  /** The short summary line (the deck, or an excerpt of the body). */
  pitch: string;
  /** The standfirst and the piece itself, as their own fields — they used to
   *  be concatenated into `pitch`, so the editor never saw the piece. */
  deck?: string;
  body?: string;
  /** Storage key of the cover the member already uploaded. It used to be
   *  uploaded and then discarded. */
  coverImageKey?: string | null;
}

/** A row as returned by GET /magazine/decks (list) — no `authorBio`/`related`/`slides`. */
export interface DeckListItemDTO {
  id: string;
  slug: string;
  title: string;
  kicker: string;
  section: string;
  byline: string;
  role: string | null;
  readTime: string;
  cover: string;
  coverDesc: string;
  tags: string[];
  /** ISO 8601, or null for an unpublished/draft deck. */
  publishedAt: string | null;
}

/** Full deck detail from GET /magazine/decks/:slug. */
export interface DeckDTO extends DeckListItemDTO {
  authorBio: string;
  related: string[];
  slides: Slide[];
}

export interface DecksPage {
  items: DeckListItemDTO[];
  total: number;
  page: number;
  pageSize: number;
}

// ── Admin request DTOs ──────────────────────────────────────────────────────
// Bodies for the moderator/admin-only authoring endpoints (mirrors
// `queerpulse-backend/src/magazine/dto/{create,update}-deck.dto.ts`).

export interface CreateDeckDto {
  slug: string;
  title: string;
  kicker?: string;
  section?: string;
  byline?: string;
  role?: string;
  authorBio?: string;
  cover?: string;
  coverDesc?: string;
  readTime?: string;
  tags?: string[];
  related?: string[];
  slides: Slide[];
}

/** `PATCH /magazine/admin/decks/:id` — every creation field patchable, plus `published`. */
export type UpdateDeckDto = Partial<CreateDeckDto> & { published?: boolean };

// ── Raw calls (one per endpoint) ────────────────────────────────────────────

/** GET /magazine/issues — PUBLISHED issues only, newest number first
 *  (CON-18). An issue with no publish date or a future one stays embargoed;
 *  the desk's own switcher reads `GET /magazine/admin/issues` instead
 *  (`issueProduction.api.ts`). */
export const getIssues = () => apiGet<IssueDTO[]>("/magazine/issues");

export const getIssue = (number: string) =>
  apiGet<IssueDTO>(`/magazine/issues/${number}`);

export function getArticles(
  params: {
    issue?: string;
    tag?: string;
    author?: string;
    /** `magazine_section.name` — CNT-20 section/topic browse drill-down. */
    section?: string;
    /**
     * CON-12 — free text, matched against the `search_vector` generated
     * column (title, dek, standfirst, tags, and both body representations).
     * Results come back ranked by relevance, so unlike every other filter a
     * `q` page is NOT in publish order.
     */
    q?: string;
    /**
     * CON-16 — the reader's language. Rows with a published translation in it
     * come back translated; rows without stay in the language they were
     * written in, and each row states its own `locale`.
     */
    lang?: string;
    page?: number;
  } = {},
) {
  const searchParams = new URLSearchParams();
  if (params.issue) searchParams.set("issue", params.issue);
  if (params.tag) searchParams.set("tag", params.tag);
  if (params.author) searchParams.set("author", params.author);
  if (params.section) searchParams.set("section", params.section);
  if (params.q) searchParams.set("q", params.q);
  if (params.lang) searchParams.set("lang", params.lang);
  if (params.page) searchParams.set("page", String(params.page));
  const qs = searchParams.toString();
  return apiGet<ArticlesPage>(`/magazine/articles${qs ? `?${qs}` : ""}`);
}

/**
 * CON-16 — `lang` is the reader's chosen language. When the piece has a
 * PUBLISHED translation in it, the backend serves that translation instead,
 * and the response states its own `slug` so the caller can correct the URL.
 * Asking for a language the piece is not in returns it as written.
 */
export const getArticle = (slug: string, lang?: string) =>
  apiGet<ArticleDTO>(
    `/magazine/articles/${slug}${lang ? `?lang=${encodeURIComponent(lang)}` : ""}`,
  );

export const getAuthor = (slug: string) =>
  apiGet<AuthorDTO>(`/magazine/authors/${slug}`);

/** GET /magazine/authors — every author who has ever published, list order
 *  is by name (see `MagazineService.listAuthors`). */
export const getAuthors = () => apiGet<AuthorDTO[]>("/magazine/authors");

/** GET /magazine/authors/me (CON-11) — the caller's own byline, or `null`
 *  when they have never been credited. Nullable, so `apiGetNullable`. */
export const getMyAuthor = () =>
  apiGetNullable<AuthorDTO>("/magazine/authors/me");

/** PATCH /magazine/authors/me — the linked member editing their own bio and
 *  portrait. The byline NAME stays editorial (staff-only). */
export const updateMyAuthor = (dto: UpdateAuthorDto) =>
  apiPatch<AuthorDTO>("/magazine/authors/me", dto);

/** GET /magazine/authors/by-member/:slug (CON-11) — the byline belonging to a
 *  member, for the "Writing" surface on their profile. `null` for the many
 *  members who have never written, so `apiGetNullable`. */
export const getAuthorForMember = (memberSlug: string) =>
  apiGetNullable<AuthorDTO>(
    `/magazine/authors/by-member/${encodeURIComponent(memberSlug)}`,
  );

/** PATCH /magazine/admin/authors/:slug — staff edit of any byline, including
 *  linking or unlinking the member account behind it. */
export const updateAdminAuthor = (slug: string, dto: UpdateAuthorDto) =>
  apiPatch<AuthorDTO>(
    `/magazine/admin/authors/${encodeURIComponent(slug)}`,
    dto,
  );

/** GET /magazine/sections (CNT-20) — the seeded section/topic taxonomy,
 *  ordered for display (see `MagazineService.listSections`). */
export const getSections = () => apiGet<SectionDTO[]>("/magazine/sections");

export const createStorySubmission = (dto: CreateStorySubmissionDto) =>
  apiPost<StorySubmissionDTO>("/magazine/submissions", dto);

/** GET /magazine/submissions/mine — the caller's own pitches. */
export const getMySubmissions = () =>
  apiGet<StorySubmissionDTO[]>("/magazine/submissions/mine");

export function getDecks(params: { tag?: string; page?: number } = {}) {
  const q = new URLSearchParams();
  if (params.tag) q.set("tag", params.tag);
  if (params.page) q.set("page", String(params.page));
  const qs = q.toString();
  return apiGet<DecksPage>(`/magazine/decks${qs ? `?${qs}` : ""}`);
}

export const getDeck = (slug: string) =>
  apiGet<DeckDTO>(`/magazine/decks/${slug}`);

// ── Admin (moderator/admin-only) calls ──────────────────────────────────────
// `AdminMagazineDecksController` — distinct route prefix from the public
// `magazine/decks` reads above; drafts included, id-addressed not slug-addressed.

/** GET /magazine/admin/decks — every deck, drafts included; a bare array (not paginated). */
export const getAdminDecks = () =>
  apiGet<DeckListItemDTO[]>("/magazine/admin/decks");

export const getAdminDeck = (id: string) =>
  apiGet<DeckDTO>(`/magazine/admin/decks/${id}`);

export const createDeck = (dto: CreateDeckDto) =>
  apiPost<DeckDTO>("/magazine/admin/decks", dto);

export const updateDeck = (id: string, dto: UpdateDeckDto) =>
  apiPatch<DeckDTO>(`/magazine/admin/decks/${id}`, dto);

export const deleteDeck = (id: string) =>
  apiDelete<void>(`/magazine/admin/decks/${id}`);

/** CNT-6 "Convert" — one-way, one-time deck→article transform. Returns the
 *  piece and newly created article ids (for navigating to the article
 *  editor), plus which slides (if any) had no article-block equivalent and
 *  were dropped, so the caller can surface an honest partial-success toast. */
export interface ConvertDeckToArticleDto {
  pieceId: string;
  articleId: string;
  droppedSlideKinds: string[];
}

export const convertDeckToArticle = (id: string) =>
  apiPost<ConvertDeckToArticleDto>(
    `/magazine/admin/decks/${id}/convert-to-article`,
  );
