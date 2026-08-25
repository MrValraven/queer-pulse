import { useState } from "react";
import { FiArchive } from "react-icons/fi";
import {
  Button,
  EmptyState,
  SearchInput,
  SkeletonLine,
} from "../../../../shared/components/ui";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useDebouncedValue } from "../../../../shared/hooks/useDebouncedValue";
import { useArchive } from "../../api/useArchive";
import styles from "./issueTabs.module.css";

/**
 * Issue production — Archive tab. A search over past issues (checked
 * automatically at commission time, surfaced here for a manual double-check)
 * — title, byline and tags all match. `query` is debounced 300ms before
 * hitting `useArchive`, which is dual-mode itself (demo filters a static
 * fixture; live calls `GET /magazine/admin/archive?q=`).
 */
export function ArchiveTab() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const { entries, isLoading } = useArchive(debouncedQuery);
  const hasQuery = query.trim().length > 0;

  function renderResults() {
    if (isLoading && entries.length === 0) {
      return (
        <div className={styles.stack} aria-hidden>
          <SkeletonLine width="80%" height={16} />
          <SkeletonLine width="60%" height={16} />
        </div>
      );
    }

    if (entries.length === 0) {
      if (hasQuery) {
        return (
          <p className={styles.hint}>
            {t("magazine:issue.archive.noMatches", { query: debouncedQuery })}
          </p>
        );
      }
      return (
        <EmptyState
          icon={<FiArchive />}
          title={t("magazine:issue.archive.emptyTitle")}
          description={t("magazine:issue.archive.emptyDescription")}
          compact
        />
      );
    }

    return entries.map((entry) => (
      <div key={entry.title} className={styles.simrow}>
        <div className={styles.simBody}>
          <b>{entry.title}</b>
          <span className={styles.hint}>
            {t("magazine:issue.archive.entryMeta", {
              issue: entry.issue ?? "—",
              by: entry.by,
              tags: entry.tags.join(", "),
            })}
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() =>
            showToast(
              t("magazine:issue.archive.readToast", { title: entry.title }),
            )
          }
        >
          {t("magazine:issue.archive.read")}
        </Button>
      </div>
    ));
  }

  return (
    <div className={styles.stack}>
      <div className={styles.card}>
        <h3>{t("magazine:issue.archive.heading")}</h3>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={t("magazine:issue.archive.searchPlaceholder")}
          ariaLabel={t("magazine:issue.archive.searchAria")}
        />
        {renderResults()}
        <p className={styles.hint}>
          {t("magazine:issue.archive.checkedAutomatically")}
        </p>
      </div>
    </div>
  );
}
