import { useState } from "react";
import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { AdminPageHeader } from "./ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { AdminSafeSpaceRows } from "./AdminSafeSpaceRows";
import { AdminSafeSpaceModal } from "./AdminSafeSpaceModal";
import { useAdminSafeSpaces } from "./api/useAdminSafeSpaces";
import type {
  SafeSpaceCandidate,
  SafeSpaceStatus,
} from "./api/adminSafeSpaces.api";
import styles from "./AdminSafeSpacesPage.module.css";

/**
 * Moderator queue for Safe Space listings: mark/unmark a listing with one
 * click, or open the full profile editor for tier, verifier, promises, and
 * vouches (spec Task 9/10, on top of the Task 3/4 backend + Task 9 hooks).
 */
export function AdminSafeSpacesPage() {
  const { t } = useTranslation();
  const { candidates, isLoading } = useAdminSafeSpaces();
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

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:adminSafeSpaces.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:adminSafeSpaces.header.eyebrow")}
          title={
            <Translation
              i18nKey="admin:adminSafeSpaces.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:adminSafeSpaces.header.sub")}
        />
      </FadeIn>

      <FadeIn delay={80}>
        {isLoading ? (
          <SafeSpaceRowsSkeleton />
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
    </AdminShell>
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
