import { isValidElement, type ReactNode } from "react";
import type { AvatarTint } from "../../../shared/components/ui/Avatar";
import type { CropRect } from "../../../shared/components/ui/cropGeometry";
import type { ImageSlotTint } from "../../../shared/components/ui/ImageSlot";
import type { TFunction } from "../../../shared/i18n/types";
// The block-editor's typed block union (Phase 3 §7.3) — distinct from the
// legacy `ArticleBlock` below (a `ReactNode`/`{ pull }`/`TypedArticleBlock`),
// which predates the block editor and stays supported for back-compat.
// Aliased to avoid colliding with this file's own `ArticleBlock` export.
import type { ArticleBlock as TypedReadBlock } from "../api/pieces.api";
// CON-16 — the lifecycle/translation shapes the reader surfaces render. Types
// only; nothing at runtime is imported from the api layer here.
import type {
  ArticleLifecycle,
  ArticleLifecycleNoticeDTO,
  ArticleTranslationDTO,
  ContentLocale,
} from "../api/magazine.api";

/**
 * A rich body block. The model is a discriminated union (each variant carries a
 * `kind`) so the generic `ArticlePage` renderer can render structured editorial
 * pieces — headings, attributed quotes, captioned images, interview Q&A, stat
 * rows — as their own block-level elements without invalid nesting.
 *
 * Two legacy shapes stay supported for backward compatibility: a bare
 * `ReactNode` renders as a paragraph, and `{ pull }` renders as a pull quote.
 */
export type TypedArticleBlock =
  /** A body paragraph. `lead` marks the larger intro paragraph. */
  | { kind: "paragraph"; text: ReactNode; lead?: boolean }
  /** A section subheading (`<h2>`). Use an `<em>` for coral emphasis. */
  | { kind: "heading"; text: ReactNode }
  /** A large editorial pull quote (no attribution). */
  | { kind: "pullQuote"; text: string }
  /** An attributed block quote; `cite` is the speaker's name. */
  | { kind: "quote"; text: ReactNode; cite?: string }
  /** An inline image with an optional caption. Omit `src` for a placeholder. */
  | {
      kind: "image";
      src?: string;
      alt: string;
      caption?: ReactNode;
      tint?: ImageSlotTint;
    }
  /** An interview exchange; `answererInitials` labels the answer's avatar. */
  | {
      kind: "qa";
      question: ReactNode;
      answer: ReactNode;
      answererInitials?: string;
    }
  /** A row of headline statistics. */
  | { kind: "stats"; items: { value: ReactNode; label: ReactNode }[] };

/** A paragraph (plain text or rich JSX), a legacy pull quote, or a typed block. */
export type ArticleBlock = ReactNode | { pull: string } | TypedArticleBlock;

/** True when a body block is a legacy pull quote rather than a renderable node. */
export function isPullQuote(block: ArticleBlock): block is { pull: string } {
  return (
    typeof block === "object" &&
    block !== null &&
    !isValidElement(block) &&
    "pull" in block
  );
}

/**
 * Narrow a body block to a typed (kinded) block, or `null` when it is a legacy
 * `ReactNode` / `{ pull }` block. A typed block is a plain object (never a React
 * element) carrying a string `kind`.
 */
export function asTypedBlock(block: ArticleBlock): TypedArticleBlock | null {
  if (typeof block !== "object" || block === null || isValidElement(block)) {
    return null;
  }
  if (
    "kind" in block &&
    typeof (block as { kind?: unknown }).kind === "string"
  ) {
    return block;
  }
  return null;
}

/**
 * First plain-text paragraph of a body, used as the saved-card blurb and social
 * description. Handles both the legacy bare-string block and `{ kind:
 * "paragraph" }` blocks whose text is a plain string.
 */
export function firstPlainText(body: ArticleBlock[]): string | undefined {
  for (const block of body) {
    if (typeof block === "string") return block;
    const typed = asTypedBlock(block);
    if (typed?.kind === "paragraph" && typeof typed.text === "string") {
      return typed.text;
    }
  }
  return undefined;
}

/**
 * A published correction against this piece (CON-02). Rendered as a dated note
 * at the foot of the article, keeping the desk's "we never edit silently"
 * promise true for the reader.
 */
export interface ArticleCorrection {
  id: string;
  text: string;
  /** YYYY-MM-DD, formatted for display at the render site. */
  publishedOn: string;
}

export interface Article {
  id: string;
  kicker: string;
  section: string;
  title: ReactNode;
  byline: string;
  role: string | null;
  date: string;
  readTime: string;
  initials: string;
  tint: AvatarTint;
  imgDesc: string;
  /** Optional hero image URL; falls back to the tinted placeholder when absent. */
  image?: string;
  /**
   * CON-04 — the reframe crop a staff editor saved for `image`, passed to
   * `ImageSlot` as `focus` (a focal point), never as `crop` (an exact frame):
   * the hero is a full-bleed 480px band whose aspect never matches an
   * arbitrary crop, and the exact-frame prop would stretch the art. Absent on
   * a demo mock and whenever the art was never reframed.
   */
  imageFocus?: CropRect;
  authorBio: string;
  /** Topical tags used both for display and to explain why pieces relate. */
  tags: string[];
  related: string[];
  body: ArticleBlock[];
  /**
   * Block-based body (Phase 3 / spec §7.3), sourced from the block editor's
   * jsonb `blocks` column. Empty on articles that predate the block editor
   * (or on the list-item adapter, which never fetches the full body) — the
   * reader (`ArticlePage.tsx`) falls back to `body` in that case.
   */
  blocks?: TypedReadBlock[];
  /**
   * CON-06 — the care-tab content notes, shown as a dismissible block above the
   * body. Absent on a demo mock and on the list-item adapter.
   */
  contentNotes?: string[];
  /** CON-02 — published corrections, newest first. */
  corrections?: ArticleCorrection[];
  /**
   * CON-17 — the SEO rail's three fields, fed straight into `PageMeta`. Each
   * falls back to the derived behaviour (first paragraph, hero image, the
   * article route) when the editor left it blank.
   */
  metaDescription?: string;
  socialImage?: string | null;
  canonicalUrl?: string;
  /**
   * CON-16 — where this piece stands today, and everything the dated banner
   * says about it. Absent on a demo mock and on the list-item adapter, where
   * the reader simply sees no banner.
   */
  lifecycle?: ArticleLifecycle;
  lifecycleNotice?: ArticleLifecycleNoticeDTO;
  /**
   * CON-16 — the language this piece is written in, every language it is
   * readable in, the original it translates, and who translated it. The
   * switcher renders from `translations`; a single entry means this piece has
   * no translation, which it says plainly.
   */
  locale?: ContentLocale;
  translations?: ArticleTranslationDTO[];
  translationOf?: { locale: ContentLocale; slug: string } | null;
  translatorName?: string | null;
  /**
   * Optional closing plum CTA band (the shared `Outro`). Fields are i18n keys so
   * the band's copy stays translated — the title is rendered through
   * `<Translation>` with an `<em>` slot. Absent on most articles.
   */
  outro?: {
    titleKey: string;
    subKey: string;
    ctaLabelKey: string;
    ctaTo: string;
  };
}

/**
 * Why a related article is being recommended, derived from shared fields.
 * Used to render a small relationship badge on each related card. This badge
 * is platform chrome (an algorithm's own explanation), so it is translated —
 * the tag/section names it interpolates are the article's own content
 * fields and stay in English either way.
 */
export function relationReason(
  current: Article,
  candidate: Article,
  t: TFunction,
): string {
  if (candidate.byline === current.byline)
    return t("magazine:relation.sameAuthor");
  const sharedTag = candidate.tags.find((tag) => current.tags.includes(tag));
  if (sharedTag) return t("magazine:relation.sameTag", { tag: sharedTag });
  if (candidate.section === current.section)
    return t("magazine:relation.sameSection", { section: candidate.section });
  return t("magazine:relation.editorsPick");
}

export const defaultArticleId = "city-changed";
