import { useId, type RefObject } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AdminStaffRosterRowDTO } from "./api/adminStaffRoster.api";
import type { StaffRoleMeta } from "./staffRoles.registry";
import type {
  StaffRosterFilters,
  StaffTierFilter,
} from "./adminStaffRoster.utils";
import { AdminStaffToolbar } from "./AdminStaffToolbar";
import { AdminStaffRows } from "./AdminStaffRows";
import styles from "./AdminStaffRows.module.css";

/**
 * The roster half of the page: its heading, the toolbar, then the grouped
 * rows, or a filtered-empty state with a way back to everyone.
 */
export function AdminStaffRosterSection({
  visibleRows,
  totalCount,
  unheldGrant,
  headingRef,
  filters,
  onSearchChange,
  onTierChange,
  onClearGrant,
  onClearFilters,
  onManage,
}: {
  visibleRows: AdminStaffRosterRowDTO[];
  totalCount: number;
  /** The grant filter's registry entry when nobody holds that grant. */
  unheldGrant: StaffRoleMeta | null;
  /** Turning a grant filter on scrolls this heading into view on a phone. */
  headingRef: RefObject<HTMLHeadingElement | null>;
  filters: StaffRosterFilters;
  onSearchChange: (search: string) => void;
  onTierChange: (tier: StaffTierFilter) => void;
  onClearGrant: () => void;
  onClearFilters: () => void;
  onManage: (memberId: string) => void;
}) {
  const { t } = useTranslation();
  const headingId = useId();

  return (
    <section className={styles.roster} aria-labelledby={headingId}>
      <h2 id={headingId} ref={headingRef} className={styles.rosterTitle}>
        {t("admin:staff.roster.heading")}
      </h2>
      <AdminStaffToolbar
        filters={filters}
        shownCount={visibleRows.length}
        totalCount={totalCount}
        onSearchChange={onSearchChange}
        onTierChange={onTierChange}
        onClearGrant={onClearGrant}
        onClearFilters={onClearFilters}
      />
      {visibleRows.length === 0 ? (
        <div className={styles.filteredEmpty}>
          <p className={styles.filteredEmptyTitle}>
            {unheldGrant
              ? t("admin:staff.filteredEmpty.unheldTitle", {
                  grant: t(unheldGrant.labelKey),
                })
              : t("admin:staff.filteredEmpty.title")}
          </p>
          <p className={styles.filteredEmptyBody}>
            {unheldGrant
              ? t("admin:staff.filteredEmpty.unheldBody")
              : t("admin:staff.filteredEmpty.body")}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className={styles.filteredEmptyClear}
            onClick={onClearFilters}
          >
            {t("admin:staff.toolbar.clear")}
          </Button>
        </div>
      ) : (
        <AdminStaffRows rows={visibleRows} onManage={onManage} />
      )}
    </section>
  );
}
