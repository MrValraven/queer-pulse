import type { AvatarTint } from "../../shared/components/ui/Avatar";
import type { CreateDeckDto, DeckDTO } from "./api/magazine.api";
import type { Slide, SlideDeck } from "./data/decks";

/**
 * The editable, in-progress shape of a deck in the authoring UI. Every field
 * is a plain string (form inputs are strings) — mappers convert to/from the
 * typed DTOs and the reader's `SlideDeck` at the edges.
 */
export interface DeckDraft {
  slug: string;
  title: string;
  kicker: string;
  section: string;
  byline: string;
  role: string;
  authorBio: string;
  cover: string;
  coverDesc: string;
  readTime: string;
  tags: string[];
  related: string[];
  slides: Slide[];
}

/** A blank draft for the "new deck" flow. */
export function emptyDraft(): DeckDraft {
  return {
    slug: "",
    title: "",
    kicker: "",
    section: "",
    byline: "",
    role: "",
    authorBio: "",
    cover: "",
    coverDesc: "",
    readTime: "",
    tags: [],
    related: [],
    slides: [],
  };
}

// ── newSlide ─────────────────────────────────────────────────────────────
// Overloaded so `kind` is required (and type-checked) only when
// `layout: "interactive"`, and every other layout rejects a `kind` argument.

export function newSlide(layout: "text"): Extract<Slide, { layout: "text" }>;
export function newSlide(layout: "image"): Extract<Slide, { layout: "image" }>;
export function newSlide(layout: "stat"): Extract<Slide, { layout: "stat" }>;
export function newSlide(
  layout: "interactive",
  kind: "before-after",
): Extract<Slide, { layout: "interactive"; kind: "before-after" }>;
export function newSlide(
  layout: "interactive",
  kind: "reveal",
): Extract<Slide, { layout: "interactive"; kind: "reveal" }>;
export function newSlide(
  layout: Slide["layout"],
  kind?: "before-after" | "reveal",
): Slide {
  switch (layout) {
    case "text":
      return { layout: "text", body: "" };
    case "image":
      return { layout: "image", src: "", alt: "", tint: "jade" };
    case "stat":
      return { layout: "stat", value: "", label: "", tint: "coral" };
    case "interactive":
      if (kind === "reveal") {
        return {
          layout: "interactive",
          kind: "reveal",
          prompt: "",
          hidden: "",
          tint: "plum",
        };
      }
      return {
        layout: "interactive",
        kind: "before-after",
        before: { src: "", alt: "", label: "" },
        after: { src: "", alt: "", label: "" },
      };
    default:
      return { layout: "text", body: "" };
  }
}

/** Seed a draft from an existing deck (editing flow). */
export function deckDtoToDraft(dto: DeckDTO): DeckDraft {
  return {
    slug: dto.slug,
    title: dto.title,
    kicker: dto.kicker,
    section: dto.section,
    byline: dto.byline,
    role: dto.role ?? "",
    authorBio: dto.authorBio,
    cover: dto.cover,
    coverDesc: dto.coverDesc,
    readTime: dto.readTime,
    tags: dto.tags ?? [],
    related: dto.related ?? [],
    slides: dto.slides,
  };
}

/** Build the create-request payload (also used, via `Partial`, for updates). */
export function draftToCreateDto(draft: DeckDraft): CreateDeckDto {
  return {
    slug: draft.slug,
    title: draft.title,
    kicker: draft.kicker,
    section: draft.section,
    byline: draft.byline,
    role: draft.role || undefined,
    authorBio: draft.authorBio,
    cover: draft.cover,
    coverDesc: draft.coverDesc,
    readTime: draft.readTime,
    tags: draft.tags,
    related: draft.related,
    slides: draft.slides,
  };
}

/** First letters of the first two words of a byline, e.g. "Jamie Rivera" → "JR". */
function initialsFromByline(byline: string): string {
  const words = byline.trim().split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

const PREVIEW_TINT: AvatarTint = "jade";

/** Assemble a complete `SlideDeck` from the current form state, for live preview. */
export function draftToDeck(draft: DeckDraft): SlideDeck {
  return {
    id: draft.slug || "preview",
    kicker: draft.kicker,
    section: draft.section,
    title: draft.title,
    byline: draft.byline,
    role: draft.role || null,
    date: "",
    readTime: draft.readTime,
    initials: initialsFromByline(draft.byline),
    tint: PREVIEW_TINT,
    cover: draft.cover,
    coverDesc: draft.coverDesc,
    authorBio: draft.authorBio,
    tags: draft.tags,
    related: draft.related,
    slides: draft.slides,
  };
}
