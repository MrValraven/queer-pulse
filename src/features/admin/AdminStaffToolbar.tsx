import { useId, useRef } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminSeg, type AdminSegOption } from "./ui";
import {
  hasActiveStaffFilters,
  staffRoleMeta,
  type StaffRosterFilters,
  type StaffTierFilter,
} from "./adminStaffRoster.utils";
import styles from "./AdminStaffRows.module.css";

const TIER_FILTERS: StaffTierFilter[] = ["all", "admin", "moderator", "member"];

/**
 * Search, tier control, the active grant filter as a removable chip, and a
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
  const searchId = useId();
  const tierLabelId = useId();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const hasSearchText = filters.search !== "";
  const tierOptions: AdminSegOption[] = TIER_FILTERS.map((tier) => ({
    value: tier,
    label: t(`admin:staff.toolbar.tier.${tier}`),
  }));
  const grantMeta = filters.grant ? staffRoleMeta(filters.grant) : undefined;
  const grantLabel = grantMeta ? t(grantMeta.labelKey) : filters.grant;

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarMain}>
        <div className={styles.search}>
          <label htmlFor={searchId} className="visuallyHidden">
            {t("admin:staff.toolbar.searchLabel")}
          </label>
          <FiSearch aria-hidden className={styles.searchIcon} />
          <input
            ref={searchInputRef}
            id={searchId}
            type="search"
            className={styles.searchInput}
            value={filters.search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t("admin:staff.toolbar.searchPlaceholder")}
            autoComplete="off"
            spellCheck={false}
          />
          {/* Replaces WebKit's own blue clear control, hidden in the CSS. */}
          {hasSearchText && (
            <button
              type="button"
              className={styles.searchClear}
              onClick={() => {
                onSearchChange("");
                searchInputRef.current?.focus();
              }}
              aria-label={t("admin:staff.toolbar.searchClear")}
            >
              <FiX aria-hidden />
            </button>
          )}
        </div>
        <div className={styles.tierControl}>
          <span id={tierLabelId} className={styles.tierLabel}>
            {t("admin:staff.toolbar.tierLabel")}
          </span>
          <div className={styles.tierScroll}>
            <AdminSeg
              options={tierOptions}
              value={filters.tier}
              onChange={(value) => onTierChange(value as StaffTierFilter)}
              ariaLabelledby={tierLabelId}
            />
          </div>
        </div>
      </div>
      <div className={styles.toolbarMeta}>
        <p className={styles.showing} role="status">
          {t("admin:staff.toolbar.showing", {
            shown: shownCount,
            total: totalCount,
          })}
        </p>
        {grantLabel && (
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
        )}
        {hasActiveStaffFilters(filters) && (
          <button
            type="button"
            className={styles.clearLink}
            onClick={onClearFilters}
          >
            {t("admin:staff.toolbar.clear")}
          </button>
        )}
      </div>
    </div>
  );
}
