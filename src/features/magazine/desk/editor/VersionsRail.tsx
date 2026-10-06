import { useId, useState } from "react";
import { LoadErrorState, SkeletonLine } from "../../../../shared/components/ui";
import { cx } from "../../../../shared/lib/cx";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useArticleVersions } from "../../api/useArticleVersions";
import { useVersionMutations } from "../../api/useVersionMutations";
import type {
  ArticleBlock,
  ArticleDraftDto,
  ArticleVersionSummaryDto,
} from "../../api/pieces.api";
import { RestoreVersionModal } from "./RestoreVersionModal";
import { VersionDiff } from "./VersionDiff";
import { VersionsRailHeader } from "./VersionsRailHeader";
import { VersionsRailItem } from "./VersionsRailItem";
import tabStyles from "../pieceTabs.module.css";
import styles from "./VersionsRail.module.css";

export interface VersionsRailProps {
  /** `useArticleVersions`/`useVersionMutations` key off this: the same piece
   *  id `ArticleEditorPage` reads its draft with. */
  pieceId: string;
  /** The article's CURRENT blocks, for the "Compare" diff view: the same
   *  array `ArticleEditorRails` already threads to `PublishRail`, reused
   *  without a fresh fetch. */
  blocks: ArticleBlock[];
  /** Called with the restored draft so `ArticleEditorPage` can reset its own
   *  local editing state (title/standfirst/blocks/section/tags) right away.
   *  See `useVersionMutations`'s doc comment on why invalidating the draft
   *  query alone isn't enough for THIS open editor to show the change. */
  onRestored: (draft: ArticleDraftDto) => void;
}

interface PendingRestore {
  id: string;
  label: string;
}

/** Versions shown before the "Show all" toggle; the newest come first. */
const COLLAPSED_VERSION_LIMIT = 5;
const SKELETON_ROW_KEYS = ["first", "second", "third"];

/**
 * The draft's version history (Phase 7 Wave E, full rebuild of the old
 * demo-only rail): list every saved version, save one manually, restore any
 * earlier one (behind a confirm modal; restoring is lossless server-side,
 * see `RestoreVersionModal`), and compare any version against the current
 * draft (`VersionDiff`). The timeline is a compact `<ol>`, one row per
 * version (`VersionsRailItem`), capped at five until expanded;
 * `VersionDiff`/`RestoreVersionModal` own their own presentation so this
 * stays thin.
 */
export function VersionsRail({
  pieceId,
  blocks,
  onRestored,
}: VersionsRailProps) {
  const { t } = useTranslation();
  const listId = useId();
  const { versions, isLoading, isError, refetch } = useArticleVersions(pieceId);
  const { saveVersion, restoreVersion } = useVersionMutations(pieceId);
  const [pendingRestore, setPendingRestore] = useState<PendingRestore | null>(
    null,
  );
  const [diffVersionId, setDiffVersionId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const hasOverflow = versions.length > COLLAPSED_VERSION_LIMIT;
  const visibleVersions =
    isExpanded || !hasOverflow
      ? versions
      : versions.slice(0, COLLAPSED_VERSION_LIMIT);
  const isCountKnown = !isError && !isLoading;

  function handleConfirmRestore() {
    if (!pendingRestore) return;
    restoreVersion.mutate(
      { versionId: pendingRestore.id, label: pendingRestore.label },
      { onSuccess: onRestored },
    );
    setPendingRestore(null);
  }

  function handleRestoreRequest(version: ArticleVersionSummaryDto) {
    setPendingRestore({ id: version.id, label: version.label });
  }

  return (
    <div className={cx(tabStyles.card, styles.rail)}>
      <VersionsRailHeader
        versionCount={isCountKnown ? versions.length : null}
        isSaving={saveVersion.isPending}
        onSave={() => saveVersion.mutate({})}
      />

      {isError ? (
        <LoadErrorState onRetry={refetch} compact />
      ) : isLoading ? (
        <div aria-busy="true">
          <span className="visuallyHidden">
            {t("magazine:write.versions.loading")}
          </span>
          {SKELETON_ROW_KEYS.map((rowKey) => (
            <div key={rowKey} className={styles.skeletonRow} aria-hidden="true">
              <span className={styles.skeletonDot} />
              <div className={styles.skeletonBody}>
                <SkeletonLine height={12} width="70%" />
                <SkeletonLine height={10} width="45%" />
              </div>
            </div>
          ))}
        </div>
      ) : versions.length === 0 ? (
        <span className={tabStyles.tiny}>
          {t("magazine:write.versions.empty")}
        </span>
      ) : (
        <>
          <ol id={listId} className={styles.list}>
            {visibleVersions.map((version, index) => (
              <VersionsRailItem
                key={version.id}
                version={version}
                isLatest={index === 0}
                onCompare={setDiffVersionId}
                onRestore={handleRestoreRequest}
              />
            ))}
          </ol>
          {hasOverflow && (
            <button
              type="button"
              className={styles.toggle}
              aria-expanded={isExpanded}
              aria-controls={listId}
              onClick={() => setIsExpanded((wasExpanded) => !wasExpanded)}
            >
              {isExpanded
                ? t("magazine:write.versions.showFewer")
                : t("magazine:write.versions.showAll", {
                    count: versions.length,
                  })}
            </button>
          )}
        </>
      )}

      {pendingRestore && (
        <RestoreVersionModal
          versionLabel={pendingRestore.label}
          isPending={restoreVersion.isPending}
          onClose={() => setPendingRestore(null)}
          onConfirm={handleConfirmRestore}
        />
      )}

      {diffVersionId && (
        <VersionDiff
          versionId={diffVersionId}
          currentBlocks={blocks}
          onClose={() => setDiffVersionId(null)}
        />
      )}
    </div>
  );
}
