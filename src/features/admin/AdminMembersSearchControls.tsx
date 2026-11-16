import { FilterChips, SearchInput } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminToolbar, adminToolbarClasses } from "./ui";

export type StatusFilter = "all" | "verified" | "new";

/**
 * The "All members" tab's own controls: name search plus the status filter
 * chips, laid out by the shared admin toolbar. Extracted from
 * `AdminMembersPage` to keep that component under the repo's 200-line limit;
 * the page still owns the state and hands it to the roster query, which
 * searches on the server.
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
  const filterOptions: { value: StatusFilter; label: string }[] = [
    { value: "all", label: t("admin:members.filters.all") },
    { value: "verified", label: t("admin:members.filters.verified") },
    { value: "new", label: t("admin:members.filters.new") },
  ];

  return (
    <AdminToolbar label={t("admin:members.toolbarAriaLabel")}>
      <SearchInput
        className={adminToolbarClasses.search}
        value={search}
        onChange={onSearchChange}
        placeholder={t("admin:members.searchPlaceholder")}
        ariaLabel={t("admin:members.searchAriaLabel")}
      />
      <FilterChips
        className={adminToolbarClasses.chips}
        label={t("admin:members.filterAriaLabel")}
        options={filterOptions}
        value={filter}
        onChange={(value) => onFilterChange(value as StatusFilter)}
      />
    </AdminToolbar>
  );
}
