import type { TFunction } from "../../../../shared/i18n/types";
import type { ArticleBlock, ArticleImageBlock } from "../../api/pieces.api";
import { stripHtml } from "./articleWordCount";

export interface PublishChecklistItem {
  id: string;
  label: string;
  done: boolean;
  /** Only required items gate publishing — see `isPublishReady`. */
  required: boolean;
}

/**
 * The "before it ships" checklist — shared by `PublishRail` (which renders
 * it) and `ArticleEditorPage`'s header Publish button (which only needs the
 * pass/fail, via `isPublishReady`), so the two Publish affordances can never
 * disagree about whether the draft is ready.
 *
 * Only `standfirst` and every image's `alt` are required this phase —
 * sensitivity sign-off already lives on the piece record's own publish gate
 * (`PublishGateCard`, Phase 2), so it's shown here as a static line, not
 * re-derived; a stat row's source line is optional, never gating.
 */
export function buildPublishChecklist(
  standfirst: string,
  blocks: ArticleBlock[],
  t: TFunction,
): PublishChecklistItem[] {
  const imageBlocks = blocks.filter(
    (block): block is ArticleImageBlock => block.kind === "image",
  );
  const everyImageHasAlt = imageBlocks.every(
    (block) => block.alt.trim() !== "",
  );
  const hasStatsBlock = blocks.some((block) => block.kind === "stats");

  const items: PublishChecklistItem[] = [
    {
      id: "standfirst",
      label: t("magazine:write.publish.checklist.standfirst"),
      done: stripHtml(standfirst).trim() !== "",
      required: true,
    },
    {
      id: "alts",
      label: t(
        imageBlocks.length > 0
          ? "magazine:write.publish.checklist.alts"
          : "magazine:write.publish.checklist.altsPending",
      ),
      done: everyImageHasAlt,
      required: true,
    },
    {
      id: "sensitivity",
      label: t("magazine:write.publish.checklist.sensitivity"),
      done: true,
      required: false,
    },
  ];

  if (hasStatsBlock) {
    items.push({
      id: "source",
      label: t("magazine:write.publish.checklist.source"),
      done: true,
      required: false,
    });
  }

  return items;
}

export function isPublishReady(checklist: PublishChecklistItem[]): boolean {
  return checklist.every((item) => !item.required || item.done);
}
