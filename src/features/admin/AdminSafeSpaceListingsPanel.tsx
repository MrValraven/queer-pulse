import { useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  FadeIn,
  LoadErrorState,
  SkeletonLine,
} from "../../shared/components/ui";
import { AdminSafeSpaceRows } from "./AdminSafeSpaceRows";
import { AdminSafeSpaceModal } from "./AdminSafeSpaceModal";
import { useAdminSafeSpaces } from "./api/useAdminSafeSpaces";
import type {
  SafeSpaceCandidate,
  SafeSpaceStatus,
} from "./api/adminSafeSpaces.api";
import styles from "./AdminSafeSpacesPage.module.css";

/**
 * The listing pane of the safe-space console: mark or unmark a listing, or
 * open the full profile editor for tier, verifier, promises and vouches.
 *
 * Lifted out of `AdminSafeSpacesPage` unchanged when that page became a
 * three-pane console (listings, the nomination review queue, and the flag and
 * suspension queue). The direct mark/unmark control stays because a moderator
 * sometimes needs to correct a listing without a nomination to hang it on;
 * the reviewed path with its written reason and audit row is the nomination
 * queue next door.
 *
 * It also REPORTS the badges that already stand below the independent-visit
 * bar, and changes none of them. Enforcement binds new awards; a badge granted
 * before the bar was enforced is a record to look at, and a low count can mean
 * the visits were never written up rather than never made. Nothing here
 * revokes, suspends, or bulk-edits a badge on that basis, and the wording keeps
 * it as paperwork to check rather than a verdict on a venue.
 */
export function AdminSafeSpaceListingsPanel() {
  const { t } = useTranslation();
  const { candidates, isLoading, isError, refetch } = useAdminSafeSpaces();
  const [editingCandidate, setEditingCandidate] =
    useState<SafeSpaceCandidate | null>(null);
  // Demo mode's mutation resolves without ever touching the static fixture
  // (see useSetSafeSpace), so this local map reflects the just-saved status
  // over the fetched list — the moderator sees their change take effect
  // immediately even though the underlying demo data never actually moves.
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, SafeSpaceStatus>
  >({});

  const visibleCandidates = candidates.map((candidate) => {
    const overrideStatus = statusOverrides[candidate.ref];
    return overrideStatus
      ? { ...candidate, safeSpaceStatus: overrideStatus }
      : candidate;
  });

  function handleStatusChanged(ref: string, status: SafeSpaceStatus) {
    setStatusOverrides((current) => ({ ...current, [ref]: status }));
  }

  const underBarVerifiedCount = visibleCandidates.filter(
    (candidate) =>
      candidate.safeSpaceStatus === "verified" &&
      !candidate.visits.hasMetVisitBar,
  ).length;

  return (
    <>
      {!isLoading && !isError && underBarVerifiedCount > 0 && (
        <FadeIn delay={40}>
          <div className={styles.underBarSummary}>
            {t("admin:adminSafeSpaces.underBar.summary", {
              count: underBarVerifiedCount,
            })}
            <p className={styles.underBarSummaryNote}>
              {t("admin:adminSafeSpaces.underBar.summaryNote")}
            </p>
          </div>
        </FadeIn>
      )}

      <FadeIn delay={80}>
        {/* Without this branch the rows component's "no listings" line stood
            in for a failed fetch (DES-22). */}
        {isLoading ? (
          <SafeSpaceRowsSkeleton />
        ) : isError ? (
          <LoadErrorState
            onRetry={() => void refetch()}
            title={t("admin:adminSafeSpaces.loadError.title")}
            description={t("admin:adminSafeSpaces.loadError.body")}
          />
        ) : (
          <AdminSafeSpaceRows
            candidates={visibleCandidates}
            onStatusChanged={handleStatusChanged}
            onEdit={setEditingCandidate}
          />
        )}
      </FadeIn>

      {editingCandidate && (
        <AdminSafeSpaceModal
          candidate={editingCandidate}
          onClose={() => setEditingCandidate(null)}
          onSaved={(status) =>
            handleStatusChanged(editingCandidate.ref, status)
          }
        />
      )}
    </>
  );
}

function SafeSpaceRowsSkeleton() {
  return (
    <div className={styles.rows}>
      {[0, 1, 2, 3].map((skeletonIndex) => (
        <SkeletonLine
          key={skeletonIndex}
          height={64}
          style={{ borderRadius: 14 }}
        />
      ))}
    </div>
  );
}
