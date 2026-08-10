import type { ReactNode } from "react";
import type { DeckDraft } from "./deckDraft";

export interface DeckLoad {
  draft: DeckDraft;
  published: boolean;
}

/** A `Slide`'s text-ish fields (and the mock deck registry's `title`) are
 *  typed `ReactNode` because the reader renders `<em>` emphasis, but the
 *  editor only ever needs a plain string to seed a controlled input —
 *  mirrors `SlideEditorCard`'s `asText`. */
function asPlainText(value: ReactNode): string {
  return typeof value === "string" ? value : "";
}

/** Demo-only load: the mock deck registry, keyed by id (dynamically
 *  imported so it never ships in the live bundle). Every mock deck is
 *  treated as already published, mirroring `useEditorDecks`. */
export async function loadMockDraft(id: string): Promise<DeckLoad | null> {
  const { decks } = await import("./data/decks.mock");
  const deck = decks[id];
  if (!deck) return null;
  return {
    published: true,
    draft: {
      slug: deck.id,
      title: asPlainText(deck.title),
      kicker: deck.kicker,
      section: deck.section,
      byline: deck.byline,
      role: deck.role ?? "",
      authorBio: deck.authorBio,
      cover: deck.cover,
      coverDesc: deck.coverDesc,
      readTime: deck.readTime,
      tags: deck.tags,
      related: deck.related,
      slides: deck.slides,
    },
  };
}

/** Every field the mutation forms can produce is a fresh string/array/object
 *  on edit, so reference equality per field is enough to detect a real
 *  change — and unlike `JSON.stringify`, it can't choke on a demo deck's
 *  still-unedited `ReactNode` slide fields (which may carry dev-only
 *  circular internals React attaches to elements). */
export function draftsEqual(a: DeckDraft, b: DeckDraft): boolean {
  return (
    a.slug === b.slug &&
    a.title === b.title &&
    a.kicker === b.kicker &&
    a.section === b.section &&
    a.byline === b.byline &&
    a.role === b.role &&
    a.authorBio === b.authorBio &&
    a.cover === b.cover &&
    a.coverDesc === b.coverDesc &&
    a.readTime === b.readTime &&
    a.tags === b.tags &&
    a.related === b.related &&
    a.slides === b.slides
  );
}
