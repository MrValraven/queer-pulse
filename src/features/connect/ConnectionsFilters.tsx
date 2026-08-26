import { SearchInput, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ConnectionSort } from "./api/connections.api";
import { CONNECTION_SORTS, connectionSortLabel } from "./connectionsFilter";
import styles from "./ConnectionsPage.module.css";

/**
 * Search + ordering for the connections list.
 *
 * Lives on the page rather than inside one tab because both feed the list
 * query itself: past about fifty people the server has to do the filtering,
 * so the term and the sort travel with every request instead of trimming a
 * page that has already arrived.
 */
export function ConnectionsFilters({
  searchTerm,
  onSearchTermChange,
  sort,
  onSortChange,
}: {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  sort: ConnectionSort;
  onSortChange: (value: ConnectionSort) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.filters}>
      <SearchInput
        className={styles.searchInput}
        value={searchTerm}
        onChange={onSearchTermChange}
        placeholder={t("connect:allTab.searchPlaceholder")}
        ariaLabel={t("connect:allTab.searchAria")}
      />
      <Select
        size="sm"
        label={t("connect:allTab.sortLabel")}
        value={sort}
        onChange={(value) =>
          onSortChange((value ?? "recent") as ConnectionSort)
        }
        options={CONNECTION_SORTS.map((option) => ({
          value: option,
          label: connectionSortLabel(option, t),
        }))}
      />
    </div>
  );
}
