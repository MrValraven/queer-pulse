// src/features/messages/StarredMessagesToolbar.tsx
import { SearchInput, Tabs, type Tab } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StarredMessageFilterType } from "./starredMessagesFilter";
import listStyles from "./NewMessageModal.module.css";
import styles from "./StarredMessagesToolbar.module.css";

interface StarredMessagesToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  type: StarredMessageFilterType;
  onTypeChange: (type: StarredMessageFilterType) => void;
  /** True once a search or a non-"all" type is narrowing the list AND the
   *  modal isn't already showing its own EmptyState `role="status"` for a
   *  no-matches result (the modal computes both, so only one live region
   *  ever announces at a time). Gates the result-count announcement so an
   *  untouched or already-announced list stays silent. */
  shouldAnnounceResultCount: boolean;
  resultCount: number;
  /** True when a further page could still add more matches under the
   *  current filters (M4): the announced count reads "N+", staying honest
   *  about being a floor on the eventual total. */
  resultCountIsPartial: boolean;
}

/**
 * Search + type toolbar for the starred-messages list (PRD-374). Purely
 * presentational: `StarredMessagesModal` owns the query/type state and the
 * actual filtering (`starredMessagesFilter.ts`). Announces the filtered
 * result count through a polite live region, matching
 * `MessagesSearchMessagesSection`'s pattern: the region stays mounted so it
 * is already present in the tree before its text ever changes.
 */
export function StarredMessagesToolbar({
  query,
  onQueryChange,
  type,
  onTypeChange,
  shouldAnnounceResultCount,
  resultCount,
  resultCountIsPartial,
}: StarredMessagesToolbarProps) {
  const { t } = useTranslation();

  const typeTabs: Tab[] = [
    { id: "all", label: t("messages:starred.filter.all") },
    { id: "photos", label: t("messages:starred.filter.photos") },
    { id: "documents", label: t("messages:starred.filter.documents") },
    { id: "links", label: t("messages:starred.filter.links") },
  ];

  return (
    <div className={styles.toolbar}>
      <SearchInput
        value={query}
        onChange={onQueryChange}
        placeholder={t("messages:starred.searchPlaceholder")}
        ariaLabel={t("messages:starred.searchAria")}
        className={listStyles.searchField}
      />
      <Tabs
        tabs={typeTabs}
        active={type}
        onChange={(id) => onTypeChange(id as StarredMessageFilterType)}
        density="compact"
        label={t("messages:starred.filter.groupLabel")}
      />
      {/* Announced to assistive tech; kept mounted (empty text when the list
       *  isn't filtered) so the live region exists before it first changes. */}
      <p className="visuallyHidden" role="status" aria-live="polite">
        {shouldAnnounceResultCount
          ? t(
              resultCountIsPartial
                ? "messages:starred.resultsCountAtLeast"
                : "messages:starred.resultsCount",
              { count: resultCount },
            )
          : ""}
      </p>
    </div>
  );
}
