import { useCallback } from "react";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { ArticleBlock } from "../../api/pieces.api";
import type { ArticleBlockOps } from "./useArticleBlockOps";

/**
 * Block delete with an Undo (FE-CNT-11).
 *
 * The trash button sits in a three-button cluster beside the grip, and the
 * removal used to be final: no confirm, no undo, and the autosave commits it
 * ~1.2s later, while versions are manual only. So one mis-click could cost a
 * paragraph permanently. Rather than a confirm dialog on every delete (which
 * would slow down the common case of clearing an empty block), the removal
 * stays instant and an Undo toast restores the block at its original index.
 *
 * Returned as a hook so `ArticleEditorPage` stays under the 200-line cap.
 */
export function useBlockRemovalUndo(
  blocks: ArticleBlock[],
  blockOps: ArticleBlockOps,
  onSelectBlock: (id: string) => void,
) {
  const { t } = useTranslation();
  const { showToast } = useToast();

  return useCallback(
    (id: string) => {
      const index = blocks.findIndex((block) => block.id === id);
      const removed = index >= 0 ? blocks[index] : undefined;
      blockOps.removeBlock(id);
      if (!removed) return;
      showToast(t("magazine:write.block.removedToast"), "info", undefined, {
        label: t("magazine:write.block.undoRemove"),
        onClick: () => {
          blockOps.restoreBlock(index, removed);
          onSelectBlock(removed.id);
        },
      });
    },
    [blocks, blockOps, onSelectBlock, showToast, t],
  );
}
