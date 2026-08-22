import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./AdminMembersPage.module.css";

export type StatusFilter = "all" | "verified" | "new";

/**
 * The "All members" tab's own controls: name search plus the status filter
 * pills. Extracted from `AdminMembersPage` to keep that component under the
 * repo's 200-line limit; the page still owns the state so the roster query and
 * the client-side search read the same values.
 */
export function AdminMembersSearchControls({
  search,
  onSearchChange,
  filter,
  onFilterChange,
}: {
  search: string;
  onSearchChange: (search: string) => void;
  filter: StatusFilter;
  onFilterChange: (filter: StatusFilter) => void;
}) {
  const { t } = useTranslation();
  const FILTERS: { id: StatusFilter; label: string }[] = [
    { id: "all", label: t("admin:members.filters.all") },
    { id: "verified", label: t("admin:members.filters.verified") },
    { id: "new", label: t("admin:members.filters.new") },
  ];

  return (
    <div className={styles.allControls}>
      <div className={styles.search}>
        <SearchIcon />
        <input
          type="search"
          className={styles.searchInput}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("admin:members.searchPlaceholder")}
          aria-label={t("admin:members.searchAriaLabel")}
        />
      </div>
      <div
        className={styles.filters}
        role="group"
        aria-label={t("admin:members.filterAriaLabel")}
      >
        {FILTERS.map((statusFilter) => (
          <button
            key={statusFilter.id}
            type="button"
            className={`${styles.filterPill} ${filter === statusFilter.id ? styles.filterPillOn : ""}`}
            aria-pressed={filter === statusFilter.id}
            onClick={() => onFilterChange(statusFilter.id)}
          >
            {statusFilter.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.5" y2="16.5" />
    </svg>
  );
}
