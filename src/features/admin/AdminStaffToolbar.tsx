import { AnimatePresence, m } from "motion/react";
import { FiX } from "react-icons/fi";
import { Button, FilterChips, SearchInput } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { AdminToolbar, adminToolbarClasses } from "./ui";
import {
  hasActiveStaffFilters,
  staffRoleMeta,
  type StaffRosterFilters,
  type StaffTierFilter,
} from "./adminStaffRoster.utils";
import styles from "./AdminStaffToolbar.module.css";

const TIER_FILTERS: StaffTierFilter[] = ["all", "admin", "moderator", "member"];

/**
 * Search, the tier chips, the active grant filter as a removable chip, and a
 * live "Showing N of M" so a screen reader hears each narrowing.
 */
export function AdminStaffToolbar({
  filters,
  shownCount,
  totalCount,
  onSearchChange,
  onTierChange,
  onClearGrant,
  onClearFilters,
}: {
  filters: StaffRosterFilters;
  shownCount: number;
  totalCount: number;
  onSearchChange: (search: string) => void;
  onTierChange: (tier: StaffTierFilter) => void;
  onClearGrant: () => void;
  onClearFilters: () => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const chipMotion = {
    initial: { opacity: 0, scale: 0.92 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.92 },
    transition: { duration: reducedMotion ? 0 : 0.18 },
  };
  const grantMeta = filters.grant ? staffRoleMeta(filters.grant) : undefined;
  const grantLabel = grantMeta ? t(grantMeta.labelKey) : filters.grant;

  return (
    <AdminToolbar
      label={t("admin:staff.toolbar.ariaLabel")}
      count={t("admin:staff.toolbar.showing", {
        shown: shownCount,
        total: totalCount,
      })}
    >
      <SearchInput
        className={adminToolbarClasses.search}
        value={filters.search}
        onChange={onSearchChange}
        placeholder={t("admin:staff.toolbar.searchPlaceholder")}
        ariaLabel={t("admin:staff.toolbar.searchLabel")}
      />
      <FilterChips
        className={adminToolbarClasses.chips}
        label={t("admin:staff.toolbar.tierLabel")}
        options={TIER_FILTERS.map((tier) => ({
          value: tier,
          label: t(`admin:staff.toolbar.tier.${tier}`),
        }))}
        value={filters.tier}
        onChange={(tier) => onTierChange(tier as StaffTierFilter)}
      />
      <AnimatePresence initial={false}>
        {grantLabel && (
          <m.span key="grant" className={styles.slot} {...chipMotion}>
            <button
              type="button"
              className={styles.grantChip}
              onClick={onClearGrant}
              aria-label={t("admin:staff.toolbar.grantChipRemove", {
                grant: grantLabel,
              })}
            >
              {grantLabel}
              <FiX aria-hidden className={styles.grantChipIcon} />
            </button>
          </m.span>
        )}
        {hasActiveStaffFilters(filters) && (
          <m.span key="clear" className={styles.slot} {...chipMotion}>
            <Button variant="quiet" size="sm" onClick={onClearFilters}>
              {t("admin:staff.toolbar.clear")}
            </Button>
          </m.span>
        )}
      </AnimatePresence>
    </AdminToolbar>
  );
}
