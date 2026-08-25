import { Modal } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useFormat } from "../../../../shared/i18n/format";
import { formatRelative } from "../../../../shared/lib/date";
import { useArticleVersion } from "../../api/useArticleVersions";
import type { ArticleBlock } from "../../api/pieces.api";
import { computeVersionDiff } from "./versionDiffAlgorithm";
import { VersionDiffRow } from "./VersionDiffRow";
import diffStyles from "./VersionDiff.module.css";
import tabStyles from "../pieceTabs.module.css";

export interface VersionDiffProps {
  versionId: string;
  /** The article's CURRENT blocks (from `ArticleEditorPage`'s live editing
   *  state, not a fresh fetch) — comparing against what's actually on
   *  screen, not the last autosaved snapshot. */
  currentBlocks: ArticleBlock[];
  onClose: () => void;
}

/**
 * "Compare" flyout for one earlier version against the current draft — a
 * per-block added/removed/changed/unchanged breakdown (`computeVersionDiff`),
 * not a character-level diff. Fetches the version's full block snapshot via
 * `useArticleVersion` (the list query never carries `blocks`, only this
 * single-version detail endpoint does).
 */
export function VersionDiff({
  versionId,
  currentBlocks,
  onClose,
}: VersionDiffProps) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const { version, isLoading, isError } = useArticleVersion(versionId);

  const subLabel = version
    ? t("magazine:write.versions.diff.sub", {
        label: version.label,
        author: version.author,
        when:
          formatRelative(version.createdAt, formatters) || version.createdAt,
      })
    : undefined;

  return (
    <Modal
      title={t("magazine:write.versions.diff.title")}
      sub={subLabel}
      onClose={onClose}
      wide
    >
      {isLoading ? (
        <span className={tabStyles.tiny}>
          {t("magazine:write.versions.diff.loading")}
        </span>
      ) : isError || !version ? (
        <span className={tabStyles.tiny}>
          {t("magazine:write.versions.diff.error")}
        </span>
      ) : (
        <VersionDiffRows
          currentBlocks={currentBlocks}
          versionBlocks={version.blocks}
        />
      )}
    </Modal>
  );
}

function VersionDiffRows({
  currentBlocks,
  versionBlocks,
}: {
  currentBlocks: ArticleBlock[];
  versionBlocks: ArticleBlock[];
}) {
  const { t } = useTranslation();
  const rows = computeVersionDiff(currentBlocks, versionBlocks);

  if (rows.length === 0) {
    return (
      <span className={tabStyles.tiny}>
        {t("magazine:write.versions.diff.empty")}
      </span>
    );
  }

  return (
    <div className={diffStyles.rows}>
      {rows.map((row) => (
        <VersionDiffRow key={row.key} row={row} />
      ))}
    </div>
  );
}
