import type { ReactNode } from "react";
import { routes } from "../../../app/routeMap";
import { CATEGORIES, GUIDES, type Guide } from "../library.data";
import type { LetterBlock, Term, TypeKind } from "../glossary.data";
import type {
  GlossaryTermResponseDTO,
  ResourceListingResponseDTO,
  ResourceResponseDTO,
} from "./resources.api";

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, category.label]),
);

/** Curated title → route pairing lifted from the demo `GUIDES` mock. Kept as
 *  the second choice behind the backend's own `routePath`, for rows written
 *  before `route_path` existed. */
const TITLE_TO_ROUTE: Record<string, string> = Object.fromEntries(
  GUIDES.map((guide) => [guide.title, guide.to]),
);

/**
 * Where a live guide card should link.
 *
 * The backend now stores each guide's `routePath`, so the link is a stored
 * fact rather than a guess. Before CON-10 this was a title-string lookup that
 * fell back to `routes.resources` on a miss, which silently bounced the
 * reader from a guide card back to the library they clicked it from: a click
 * that looked broken, with nothing explaining why, every time an editor
 * changed a title.
 *
 * A miss now lands on the guide's own slug-addressable page, which either
 * renders it or says plainly that it has no page yet. Either way the reader
 * ends up somewhere about the guide they asked for.
 */
export function guideRouteFor(
  dto: Pick<ResourceResponseDTO, "slug" | "title" | "routePath">,
): string {
  if (dto.routePath) return dto.routePath;
  const curated = TITLE_TO_ROUTE[dto.title];
  if (curated) return curated;
  return `${routes.resourceGuide}/${dto.slug}`;
}

/** Maps a live `ResourceResponseDTO` onto the page's local `Guide` shape —
 *  the same type `marketing/ResourceLibraryPage` already renders in demo mode. */
export function resourceToGuide(dto: ResourceResponseDTO): Guide {
  return {
    title: dto.title,
    description: dto.description,
    category: dto.category,
    categoryLabel: CATEGORY_LABELS[dto.category] ?? dto.category,
    meta: dto.meta ?? "Guide",
    to: guideRouteFor(dto),
    lastVerifiedAt: dto.lastVerifiedAt,
  };
}

// ── Glossary ─────────────────────────────────────────────────────────────────

/** Maps a backend `category` label to the chip-color key the term cell's
 *  type badge renders. Heuristic substring match rather than an exhaustive
 *  lookup, since the backend keeps `category` free-form (see the
 *  `GlossaryTerm` entity) — covers every category currently seeded
 *  ("Essential", "Healthcare", "Lisbon", "Portuguese · in-community",
 *  "QueerPulse · platform", …). */
function deriveTypeKind(category: string | null): TypeKind {
  if (!category) return "";
  const c = category.toLowerCase();
  if (c.includes("essential")) return "essential";
  if (c.includes("health")) return "med";
  if (
    c.includes("lisbon") ||
    c.includes("portuguese") ||
    c.includes("platform")
  ) {
    return "local";
  }
  return "";
}

/** Maps a live `GlossaryTermResponseDTO` onto the page's local `Term` shape.
 *
 *  The backend now persists a Portuguese definition (CON-08), so `defPt` is
 *  real whenever an editor has written one. Cross-reference `meta` links stay
 *  presentation-only and unpersisted, a documented gap rather than fabricated
 *  content.
 *
 *  `typePt` is deliberately left unset: the chip's Portuguese label comes from
 *  the catalog (`GLOSSARY_CATEGORY_KEYS`), because the backend stores one
 *  free-form English `category` and echoing it as the Portuguese label is what
 *  made PT mode render English chips (PRD-267). */
export function glossaryTermToTerm(dto: GlossaryTermResponseDTO): Term {
  const def: ReactNode = dto.definition;
  // CON-08 gave the glossary a real Portuguese column and an admin editor to
  // fill it. A term that has not been translated yet still falls back to the
  // English definition, which is a documented gap rather than a fake
  // translation.
  const defPt: ReactNode = dto.definitionPt ?? def;
  const type = dto.category ?? "";
  return {
    name: dto.term,
    type,
    typeKind: deriveTypeKind(dto.category),
    def,
    defPt,
    // The search index carries both languages, so a reader searching in
    // Portuguese matches a term whose Portuguese definition is written. Before
    // PRD-267 it held the English text alone and PT mode found nothing.
    search: [dto.term, dto.definition, dto.definitionPt ?? "", type]
      .join(" ")
      .toLowerCase(),
  };
}

/** Groups a flat term list into the alphabetical `LetterBlock[]` shape
 *  `GlossaryPage` renders, mirroring the demo `BLOCKS` mock's structure. */
export function groupTermsIntoBlocks(terms: Term[]): LetterBlock[] {
  const byLetter = new Map<string, Term[]>();
  for (const term of terms) {
    const letter = term.name.charAt(0).toUpperCase();
    const bucket = byLetter.get(letter);
    if (bucket) bucket.push(term);
    else byLetter.set(letter, [term]);
  }
  return [...byLetter.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([letter, letterTerms]) => ({
      letter,
      terms: letterTerms.sort((a, b) => a.name.localeCompare(b.name)),
    }));
}

// ── Resource listings (CNT-14) ──────────────────────────────────────────────

/** Where a "Contact" CTA on a real `ResourceListing` card should go: prefer a
 *  website (opens in a new tab), then a phone number (`tel:`), then an email
 *  (`mailto:`). Returns null when the listing genuinely has none — shouldn't
 *  happen given the backend's "at least one contact field" invariant, but the
 *  card still needs a safe no-op fallback. */
export function contactHrefForListing(
  listing: Pick<ResourceListingResponseDTO, "phone" | "email" | "website">,
): string | null {
  if (listing.website) {
    return /^https?:\/\//i.test(listing.website)
      ? listing.website
      : `https://${listing.website}`;
  }
  if (listing.phone) return `tel:${listing.phone}`;
  if (listing.email) return `mailto:${listing.email}`;
  return null;
}
