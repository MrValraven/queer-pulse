import { useMemo, useRef, useState } from "react";
import { prefersReducedMotionNow } from "../../shared/hooks/usePrefersReducedMotion";
import type { AdminStaffRosterRowDTO } from "./api/adminStaffRoster.api";
import type { StaffRoleId } from "./staffRoles.registry";
import {
  EMPTY_STAFF_FILTERS,
  computeGrantCoverage,
  filterStaffRows,
  summariseStaffRoster,
  type StaffRosterFilters,
  type StaffTierFilter,
} from "./adminStaffRoster.utils";
import { AdminStaffSummary } from "./AdminStaffSummary";
import { AdminStaffCoverage } from "./AdminStaffCoverage";
import { AdminStaffRosterSection } from "./AdminStaffRosterSection";
import styles from "./AdminStaffPage.module.css";

/**
 * The loaded staff page: summary tiles, grant coverage and the filterable
 * roster. Owns the filter state, since all three read or set it: a tile picks
 * a tier, a coverage card picks a grant, and the toolbar holds both plus the
 * search.
 */
export function AdminStaffBoard({
  rows,
  onManage,
}: {
  rows: AdminStaffRosterRowDTO[];
  onManage: (memberId: string) => void;
}) {
  const [filters, setFilters] =
    useState<StaffRosterFilters>(EMPTY_STAFF_FILTERS);
  const coverageHeadingRef = useRef<HTMLHeadingElement>(null);
  const rosterHeadingRef = useRef<HTMLHeadingElement>(null);

  const coverage = useMemo(() => computeGrantCoverage(rows), [rows]);
  const summary = useMemo(
    () => summariseStaffRoster(rows, coverage),
    [rows, coverage],
  );
  const visibleRows = useMemo(
    () => filterStaffRows(rows, filters),
    [rows, filters],
  );

  const setTier = (tier: StaffTierFilter) =>
    setFilters((current) => ({ ...current, tier }));
  // The grant filter's registry entry while nobody at all holds that grant,
  // so the empty roster can name the grant and say nobody has it yet.
  const activeGrantCoverage = filters.grant
    ? coverage.find((entry) => entry.role.id === filters.grant)
    : undefined;
  const unheldGrant =
    activeGrantCoverage &&
    activeGrantCoverage.activeHolders.length +
      activeGrantCoverage.inactiveHolderCount ===
      0
      ? activeGrantCoverage.role
      : null;

  const scrollToHeading = (heading: HTMLHeadingElement) =>
    heading.scrollIntoView({
      behavior: prefersReducedMotionNow() ? "auto" : "smooth",
      block: "start",
    });

  // On a phone the roster sits well below the coverage cards, so turning a
  // grant filter on would change nothing the admin can see. Bring the roster
  // heading into view when it is off screen; focus stays on the card.
  const toggleGrant = (grant: StaffRoleId) => {
    const isTurningOn = filters.grant !== grant;
    setFilters((current) => ({
      ...current,
      grant: current.grant === grant ? null : grant,
    }));
    const heading = rosterHeadingRef.current;
    if (!isTurningOn || !heading) return;
    const headingBox = heading.getBoundingClientRect();
    const isOffScreen =
      headingBox.top < 0 || headingBox.bottom > window.innerHeight;
    if (isOffScreen) scrollToHeading(heading);
  };

  // The uncovered tile has no roster filter to apply: the answer lives in the
  // coverage panel, so it brings that panel into view and hands it focus.
  const focusCoverage = () => {
    const heading = coverageHeadingRef.current;
    if (!heading) return;
    scrollToHeading(heading);
    heading.focus({ preventScroll: true });
  };

  return (
    <div className={styles.board}>
      <AdminStaffSummary
        summary={summary}
        activeTier={filters.tier}
        onPickTier={(tier) => setTier(filters.tier === tier ? "all" : tier)}
        onShowUncovered={focusCoverage}
      />
      <AdminStaffCoverage
        coverage={coverage}
        activeGrant={filters.grant}
        onToggleGrant={toggleGrant}
        headingRef={coverageHeadingRef}
      />
      <AdminStaffRosterSection
        visibleRows={visibleRows}
        totalCount={rows.length}
        unheldGrant={unheldGrant}
        headingRef={rosterHeadingRef}
        filters={filters}
        onSearchChange={(search) =>
          setFilters((current) => ({ ...current, search }))
        }
        onTierChange={setTier}
        onClearGrant={() =>
          setFilters((current) => ({ ...current, grant: null }))
        }
        onClearFilters={() => setFilters(EMPTY_STAFF_FILTERS)}
        onManage={onManage}
      />
    </div>
  );
}
