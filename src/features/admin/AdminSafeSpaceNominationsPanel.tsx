import { useState } from "react";
import { FadeIn, SearchInput, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminSeg, AdminToggle } from "./ui";
import { NOMINATION_SCOPE_OPTIONS } from "./adminSafeSpaceGovernance.data";
import { AdminSafeSpaceNominationRows } from "./AdminSafeSpaceNominationRows";
import { AdminSafeSpaceNominationDrawer } from "./AdminSafeSpaceNominationDrawer";
import { useAdminSafeSpaceNominations } from "../safety/api/useAdminSafeSpaceNominations";
import type {
  AdminNominationScope,
  AdminNominationSort,
  AdminSafeSpaceNominationDTO,
} from "../safety/api/safeSpaceGovernance.api";
import styles from "./AdminSafeSpaceGovernance.module.css";

/**
 * The safe-space nomination review queue, one pane of the safe-space console.
 *
 * Sorted oldest first by default, because the published copy promises a
 * nomination is acknowledged within 48 hours and oldest-first IS that promise
 * sorted. Anything past the window is surfaced with a labelled chip and a
 * coral edge, and can be isolated with one toggle.
 */
export function AdminSafeSpaceNominationsPanel() {
  const { t } = useTranslation();
  const [scope, setScope] = useState<AdminNominationScope>("open");
  const [sort, setSort] = useState<AdminNominationSort>("oldest");
  const [isBreachedOnly, setIsBreachedOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [openNomination, setOpenNomination] =
    useState<AdminSafeSpaceNominationDTO | null>(null);

  const { nominations, total, isLoading } = useAdminSafeSpaceNominations({
    scope,
    sort,
    breachedOnly: isBreachedOnly || undefined,
    search: search.trim() || undefined,
  });

  const breachingCount = nominations.filter(
    (nomination) => nomination.hasBreachedAcknowledgement,
  ).length;

  // The drawer reads from the same list, so an action's cache invalidation
  // reaches it: re-resolve the open row from the freshly fetched page rather
  // than rendering the snapshot captured on click.
  const activeNomination = openNomination
    ? (nominations.find((nomination) => nomination.id === openNomination.id) ??
      openNomination)
    : null;

  return (
    <>
      <p className={styles.summary}>{t("safety:governance.nominations.sub")}</p>

      <FadeIn delay={60}>
        <div className={styles.toolbar}>
          <AdminSeg
            options={NOMINATION_SCOPE_OPTIONS.map((option) => ({
              value: option.value,
              label: t(option.labelKey),
            }))}
            value={scope}
            onChange={(value) => setScope(value as AdminNominationScope)}
          />
          <AdminSeg
            options={[
              { value: "oldest", label: t("safety:governance.sort.oldest") },
              { value: "newest", label: t("safety:governance.sort.newest") },
            ]}
            value={sort}
            onChange={(value) => setSort(value as AdminNominationSort)}
          />
          <AdminToggle
            checked={isBreachedOnly}
            onChange={setIsBreachedOnly}
            label={t("safety:governance.filter.breachedOnly")}
          />
          <div className={styles.toolbarSearch}>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={t("safety:governance.filter.searchPlaceholder")}
              ariaLabel={t("safety:governance.filter.searchPlaceholder")}
            />
          </div>
        </div>

        <p className={styles.summary} role="status">
          {t("safety:governance.summary.inQueue", { count: total })}
          {breachingCount > 0 && (
            <>
              {" "}
              <span className={styles.summaryBreach}>
                {t("safety:governance.summary.breaching", {
                  count: breachingCount,
                  hours: 48,
                })}
              </span>
            </>
          )}
        </p>
      </FadeIn>

      <FadeIn delay={110}>
        {isLoading ? (
          <div className={styles.rows}>
            <SkeletonLine width="100%" height={78} />
            <SkeletonLine width="100%" height={78} />
            <SkeletonLine width="100%" height={78} />
          </div>
        ) : (
          <AdminSafeSpaceNominationRows
            nominations={nominations}
            onOpen={setOpenNomination}
          />
        )}
      </FadeIn>

      {activeNomination && (
        <AdminSafeSpaceNominationDrawer
          nomination={activeNomination}
          onClose={() => setOpenNomination(null)}
        />
      )}
    </>
  );
}
