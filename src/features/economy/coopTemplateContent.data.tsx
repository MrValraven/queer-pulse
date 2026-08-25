/** Structural manifest for the six housing co-op "formation templates" shown as
 *  cards on the housing co-op page (see `COOP_TEMPLATES` in `housingCoop.data.ts`).
 *  Each template card's `slug` looks up its document shape here. `CoopTemplateSlug`
 *  is the single source of truth for the slug union — `housingCoop.data.ts`
 *  imports it rather than redeclaring it.
 *
 *  The user-facing prose (tag, title, intro, section headings, paragraphs and
 *  list items) is NOT stored here — it lives in the `economy` i18n catalog under
 *  `coopTemplate.doc.<slug>.*` keys, so the template renders in EN or pt-PT like
 *  the rest of the platform. This file only encodes each document's SHAPE — how
 *  many sections, and the ordered blocks in each (paragraph vs. list, and each
 *  list's item count). `CoopTemplatePage` walks this shape to build the matching
 *  catalog keys:
 *    - `coopTemplate.doc.<slug>.tag | .title | .titleEm | .intro`
 *    - `coopTemplate.doc.<slug>.s<sectionIndex>.h`            (section heading)
 *    - `coopTemplate.doc.<slug>.s<sectionIndex>.b<blockIndex>`        (paragraph)
 *    - `coopTemplate.doc.<slug>.s<sectionIndex>.b<blockIndex>.<itemIndex>` (list item)
 *
 *  These are QueerPulse-authored starting drafts, not legal or financial advice.
 *  Every document says so explicitly, and any money or legal detail that reads as
 *  a specific figure or clause is a fill-in-the-bracket example, not a real number
 *  to sign against. */

export type CoopTemplateSlug =
  | "founding-values"
  | "financial-honesty"
  | "crl-statutes"
  | "share-agreement"
  | "finance-model"
  | "conflict-resolution";

/** One block in document order: a paragraph, or a bulleted list of `items`
 *  entries. The prose for each block is resolved from the `economy` catalog by
 *  `CoopTemplatePage` (see the module comment for the key scheme). */
export type CoopTemplateBlock = { kind: "p" } | { kind: "list"; items: number };

export interface CoopTemplateSection {
  blocks: CoopTemplateBlock[];
}

export interface CoopTemplateDoc {
  slug: CoopTemplateSlug;
  /** Sections in document order; each section's heading + block prose is keyed
   *  in the `economy` catalog under `coopTemplate.doc.<slug>.s<sectionIndex>.*`. */
  sections: CoopTemplateSection[];
}

const paragraph: CoopTemplateBlock = { kind: "p" };
const list = (items: number): CoopTemplateBlock => ({ kind: "list", items });

export const COOP_TEMPLATE_CONTENT: Record<CoopTemplateSlug, CoopTemplateDoc> =
  {
    "founding-values": {
      slug: "founding-values",
      sections: [
        { blocks: [paragraph, list(3)] },
        { blocks: [paragraph, list(4)] },
        { blocks: [paragraph, list(3)] },
        { blocks: [paragraph, list(3)] },
        { blocks: [paragraph, list(3)] },
        { blocks: [paragraph, list(2), paragraph] },
      ],
    },
    "financial-honesty": {
      slug: "financial-honesty",
      sections: [
        { blocks: [paragraph, list(3)] },
        { blocks: [paragraph, list(3)] },
        { blocks: [paragraph, list(3)] },
        { blocks: [paragraph, list(3)] },
        { blocks: [paragraph, list(3)] },
        { blocks: [paragraph, list(1), paragraph] },
      ],
    },
    "crl-statutes": {
      slug: "crl-statutes",
      sections: [
        { blocks: [paragraph, list(3)] },
        { blocks: [paragraph, list(3)] },
        { blocks: [paragraph, list(3)] },
        { blocks: [list(4)] },
        { blocks: [paragraph, list(3)] },
        { blocks: [paragraph, list(3)] },
        { blocks: [list(3), paragraph] },
      ],
    },
    "share-agreement": {
      slug: "share-agreement",
      sections: [
        { blocks: [paragraph, list(3)] },
        { blocks: [paragraph, list(2)] },
        { blocks: [paragraph, list(3)] },
        { blocks: [list(2)] },
        { blocks: [paragraph, list(2)] },
        { blocks: [paragraph, list(3), paragraph] },
      ],
    },
    "finance-model": {
      slug: "finance-model",
      sections: [
        { blocks: [paragraph, list(3)] },
        { blocks: [paragraph, list(3)] },
        { blocks: [paragraph, list(3)] },
        { blocks: [list(3)] },
        { blocks: [list(3)] },
        { blocks: [paragraph, list(5), paragraph] },
      ],
    },
    "conflict-resolution": {
      slug: "conflict-resolution",
      sections: [
        { blocks: [paragraph, list(3)] },
        { blocks: [paragraph, list(2)] },
        { blocks: [paragraph, list(4)] },
        { blocks: [paragraph, list(3)] },
        { blocks: [list(2)] },
        { blocks: [paragraph, list(3)] },
        { blocks: [paragraph, list(2), paragraph] },
      ],
    },
  };
