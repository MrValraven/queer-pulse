import type { TFunction } from "../../../../shared/i18n/types";
import type { DeckDraft } from "../../deckDraft";
import type { Slide } from "../../data/decks";

export interface DeckPublishChecklistItem {
  id: string;
  label: string;
  done: boolean;
  /** Only required items gate publishing — see `isDeckPublishReady`. */
  required: boolean;
}

/**
 * The deck editor's "before it ships" checklist — rendered by
 * `DeckPublishRail` and scored, via `isDeckPublishReady`, by
 * `deckPublishGate.ts`, which both Publish buttons read, so the two
 * affordances can never disagree about whether the draft is ready. The
 * REQUIRED rows here are also re-implemented server-side (backend
 * `deck-slides.validation.ts#isDeckPublishReady`), so a direct request cannot
 * skip what this gates. Mirrors
 * `articlePublishChecklist.ts`'s shape and reuses its generic `write.publish.*`
 * copy (title/segmented-control/alt-text wording) where the text is
 * identical — only the deck-specific items get their own keys.
 *
 * Alt text on every image slide and a cover slide both gate publishing;
 * a source line on stat slides is shown but never blocks, same as the
 * article checklist's own (optional) stat-source line.
 */
export function buildDeckPublishChecklist(
  draft: DeckDraft,
  t: TFunction,
): DeckPublishChecklistItem[] {
  const imageSlides = draft.slides.filter(
    (slide): slide is Extract<Slide, { layout: "image" }> =>
      slide.layout === "image",
  );
  const statSlides = draft.slides.filter(
    (slide): slide is Extract<Slide, { layout: "stat" }> =>
      slide.layout === "stat",
  );
  const everyImageHasAlt = imageSlides.every(
    (slide) => slide.alt.trim() !== "",
  );
  const everyStatHasSource = statSlides.every(
    (slide) => (slide.source ?? "").trim() !== "",
  );

  return [
    {
      id: "alts",
      label: t(
        imageSlides.length > 0
          ? "magazine:write.publish.checklist.alts"
          : "magazine:write.publish.checklist.altsPending",
      ),
      done: everyImageHasAlt,
      required: true,
    },
    {
      id: "source",
      label: t(
        statSlides.length > 0
          ? "magazine:deck.editor.publish.checklist.source"
          : "magazine:deck.editor.publish.checklist.sourcePending",
      ),
      done: everyStatHasSource,
      required: false,
    },
    {
      id: "cover",
      label: t("magazine:deck.editor.publish.checklist.cover"),
      done: draft.slides.length > 0,
      required: true,
    },
  ];
}

export function isDeckPublishReady(
  checklist: DeckPublishChecklistItem[],
): boolean {
  return checklist.every((item) => !item.required || item.done);
}
