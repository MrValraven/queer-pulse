import { useMemo, useState } from "react";
import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminTabs } from "./ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useListingClaims } from "./api/useListingClaims";
import { ListingClaimRows } from "./ListingClaimRows";
import type { ListingClaimStatus } from "./api/listingClaims.api";
import styles from "./EditSuggestions.module.css";

type StatusFilter = ListingClaimStatus | "all";
const FILTERS: StatusFilter[] = ["pending", "approved", "declined", "all"];

/**
 * Moderator triage of member requests to take ownership of an existing
 * directory listing (a tab inside `AdminListingsPage`, alongside "edit
 * suggestions" — the two sibling review queues `ListingsController` exposes
 * under `admin/*`). Mirrors `EditSuggestionsSection`'s status-filter +
 * optimistic-override shape exactly.
 */
export function ListingClaimsSection() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const { rows, isLoading } = useListingClaims();
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, ListingClaimStatus>
  >({});

  const visibleRows = useMemo(() => {
    const withOverrides = rows.map((row) => {
      const override = statusOverrides[row.id];
      return override ? { ...row, status: override } : row;
    });
    return filter === "all"
      ? withOverrides
      : withOverrides.filter((row) => row.status === filter);
  }, [rows, statusOverrides, filter]);

  function handleResolved(id: string, status: ListingClaimStatus) {
    setStatusOverrides((current) => ({ ...current, [id]: status }));
  }

  return (
    <>
      <FadeIn delay={80}>
        <AdminTabs
          tabs={FILTERS.map((value) => ({
            id: value,
            label: t(`admin:listingClaims.filter.${value}`),
          }))}
          active={filter}
          onChange={(value) => setFilter(value as StatusFilter)}
        />
      </FadeIn>

      <FadeIn delay={100}>
        {isLoading ? (
          <ClaimRowsSkeleton />
        ) : (
          <ListingClaimRows claims={visibleRows} onResolved={handleResolved} />
        )}
      </FadeIn>
    </>
  );
}

function ClaimRowsSkeleton() {
  return (
    <div className={styles.rows}>
      {[0, 1].map((skeletonIndex) => (
        <SkeletonLine
          key={skeletonIndex}
          height={104}
          style={{ borderRadius: 14 }}
        />
      ))}
    </div>
  );
}
