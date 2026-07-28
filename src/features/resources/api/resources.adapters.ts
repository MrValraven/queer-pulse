import type { ReactNode } from "react";
import { routes } from "../../../app/routeMap";
import { CATEGORIES, GUIDES, type Guide } from "../library.data";
import type { LetterBlock, Term, TypeKind } from "../glossary.data";
import type {
  GlossaryTermResponseDTO,
  ResourceResponseDTO,
} from "./resources.api";

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, category.label]),
);

/** Curated title → route pairing lifted from the demo `GUIDES` mock — every
 *  seeded backend `Resource` shares its title with one of these (the backend
 *  seed is generated verbatim from `library.data.ts`'s `GUIDES`, see
 *  `queerpulse-backend/src/resources/resources.seed.ts`). A future resource
 *  with no curated pairing yet falls back to the library page itself rather
 *  than a broken link. */
const TITLE_TO_ROUTE: Record<string, string> = Object.fromEntries(
  GUIDES.map((guide) => [guide.title, guide.to]),
);

/** Maps a live `ResourceResponseDTO` onto the page's local `Guide` shape —
 *  the same type `LibraryPage` already renders in demo mode. */
export function resourceToGuide(dto: ResourceResponseDTO): Guide {
  return {
    title: dto.title,
    description: dto.description,
    category: dto.category,
    categoryLabel: CATEGORY_LABELS[dto.category] ?? dto.category,
    meta: dto.meta ?? "Guide",
    to: TITLE_TO_ROUTE[dto.title] ?? routes.library,
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
 *  Live mode has no Portuguese translation and no cross-reference `meta`
 *  links — both are presentation-only fields the backend intentionally
 *  doesn't persist (see the `GlossaryTerm` entity comment). The English
 *  `def`/`type` are reused for the `*Pt` fields as a documented gap, rather
 *  than a fake translation — the same treatment `useMyEventsData` gives
 *  notifications that have no backend contract yet. */
export function glossaryTermToTerm(dto: GlossaryTermResponseDTO): Term {
  const def: ReactNode = dto.definition;
  const type = dto.category ?? "";
  return {
    name: dto.term,
    type,
    typePt: type,
    typeKind: deriveTypeKind(dto.category),
    def,
    defPt: def,
    search: `${dto.term} ${dto.definition}`.toLowerCase(),
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
