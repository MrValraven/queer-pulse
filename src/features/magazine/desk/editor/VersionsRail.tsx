import { useState } from "react";
import { Button } from "../../../../shared/components/ui";
import { cx } from "../../../../shared/lib/cx";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useFormat } from "../../../../shared/i18n/format";
import { formatRelative } from "../../../../shared/lib/date";
import { useArticleVersions } from "../../api/useArticleVersions";
import { useVersionMutations } from "../../api/useVersionMutations";
import type { ArticleBlock, ArticleDraftDto } from "../../api/pieces.api";
import { RestoreVersionModal } from "./RestoreVersionModal";
import { VersionDiff } from "./VersionDiff";
import styles from "../pieceTabs.module.css";

export interface VersionsRailProps {
  /** `useArticleVersions`/`useVersionMutations` key off this — same piece id
   *  `ArticleEditorPage` reads its draft with. */
  pieceId: string;
  /** The article's CURRENT blocks, for the "Compare" diff view — the same
   *  array `ArticleEditorRails` already threads to `PublishRail`, not a
   *  fresh fetch. */
  blocks: ArticleBlock[];
  /** Called with the restored draft so `ArticleEditorPage` can reset its own
   *  local editing state (title/standfirst/blocks/section/tags) right away —
   *  see `useVersionMutations`'s doc comment on why invalidating the draft
   *  query alone isn't enough for THIS open editor to show the change. */
  onRestored: (draft: ArticleDraftDto) => void;
}

interface PendingRestore {
  id: string;
  label: string;
}

/**
 * The draft's version history (Phase 7 Wave E, full rebuild of the old
 * demo-only rail): list every saved version, save one manually, restore any
 * earlier one (behind a confirm modal — restoring is lossless server-side,
 * see `RestoreVersionModal`), and compare any version against the current
 * draft (`VersionDiff`). Ported layout from the design prototype's History
 * rail; `VersionDiff`/`RestoreVersionModal` own their own presentation so
 * this stays thin.
 */
export function VersionsRail({
  pieceId,
  blocks,
  onRestored,
}: VersionsRailProps) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const { versions, isLoading } = useArticleVersions(pieceId);
  const { saveVersion, restoreVersion } = useVersionMutations(pieceId);
  const [pendingRestore, setPendingRestore] = useState<PendingRestore | null>(
    null,
  );
  const [diffVersionId, setDiffVersionId] = useState<string | null>(null);

  function handleConfirmRestore() {
    if (!pendingRestore) return;
    restoreVersion.mutate(
      { versionId: pendingRestore.id, label: pendingRestore.label },
      { onSuccess: onRestored },
    );
    setPendingRestore(null);
  }

  return (
    <div className={styles.card}>
      <div className={styles.row}>
        <h3>{t("magazine:write.versions.title")}</h3>
        <Button
          size="sm"
          variant="ghost"
          className={styles.spacer}
          onClick={() => saveVersion.mutate({})}
          disabled={saveVersion.isPending}
        >
          {t("magazine:write.versions.saveCta")}
        </Button>
      </div>

      {isLoading ? (
        <span className={styles.tiny}>
          {t("magazine:write.versions.loading")}
        </span>
      ) : versions.length === 0 ? (
        <span className={styles.tiny}>
          {t("magazine:write.versions.empty")}
        </span>
      ) : (
        <div className={styles.trail}>
          {versions.map((version) => (
            <div key={version.id} className={styles.trailrow}>
              <span className={styles.dot} />
              <div className={styles.row}>
                <div>
                  <b>{version.label}</b> · {version.author}
                  <div className={styles.tiny}>
                    {formatRelative(version.createdAt, formatters) ||
                      version.createdAt}
                  </div>
                </div>
                <div className={cx(styles.row, styles.spacer)}>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDiffVersionId(version.id)}
                  >
                    {t("magazine:write.versions.compare")}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setPendingRestore({
                        id: version.id,
                        label: version.label,
                      })
                    }
                  >
                    {t("magazine:write.versions.restore")}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
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
