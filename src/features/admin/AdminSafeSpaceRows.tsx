import { Button, FadeIn } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { businessPath } from "../../app/routeMap";
import { AdminChip, type AdminTone } from "./ui";
import { useSetSafeSpace } from "./api/useSetSafeSpace";
import { classifyVisitBarRefusal } from "./api/safeSpaceVisitBarError";
import type {
  SafeSpaceCandidate,
  SafeSpaceStatus,
} from "./api/adminSafeSpaces.api";
import styles from "./AdminSafeSpacesPage.module.css";

const STATUS_TONE: Record<SafeSpaceStatus, AdminTone> = {
  none: "ghost",
  verified: "jade",
  removed: "danger",
};

/** The Safe Spaces candidates queue, one row per listing. */
export function AdminSafeSpaceRows({
  candidates,
  onStatusChanged,
  onEdit,
}: {
  candidates: SafeSpaceCandidate[];
  onStatusChanged: (ref: string, status: SafeSpaceStatus) => void;
  onEdit: (candidate: SafeSpaceCandidate) => void;
}) {
  const { t } = useTranslation();

  if (candidates.length === 0) {
    return (
      <p className={styles.emptyLine}>{t("admin:adminSafeSpaces.empty")}</p>
    );
  }

  return (
    <div className={styles.rows}>
      {candidates.map((candidate, index) => (
        <FadeIn key={candidate.ref} delay={Math.min(index, 8) * 50}>
          <AdminSafeSpaceRow
            candidate={candidate}
            onStatusChanged={onStatusChanged}
            onEdit={onEdit}
          />
        </FadeIn>
      ))}
    </div>
  );
}

function AdminSafeSpaceRow({
  candidate,
  onStatusChanged,
  onEdit,
}: {
  candidate: SafeSpaceCandidate;
  onStatusChanged: (ref: string, status: SafeSpaceStatus) => void;
  onEdit: (candidate: SafeSpaceCandidate) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const setSafeSpace = useSetSafeSpace();
  const isVerified = candidate.safeSpaceStatus === "verified";
  // A badge this row could grant in one click, for a listing the backend will
  // refuse without a written exception. The exception belongs in the editor,
  // where there is room to explain what it costs, so the mark control opens the
  // editor instead of firing a request that can only come back a 400.
  const isMarkBelowBar = !isVerified && !candidate.visits.hasMetVisitBar;
  // A badge that already stands, granted before the bar was enforced. Reported
  // here and nowhere changed: the row's own controls are untouched by it.
  const isVerifiedBelowBar = isVerified && !candidate.visits.hasMetVisitBar;

  function toggleStatus() {
    if (isMarkBelowBar) {
      onEdit(candidate);
      return;
    }
    const nextStatus: SafeSpaceStatus = isVerified ? "none" : "verified";
    setSafeSpace.mutate(
      { ref: candidate.ref, body: { status: nextStatus } },
      {
        onSuccess: () => {
          onStatusChanged(candidate.ref, nextStatus);
          showToast(
            t(
              nextStatus === "verified"
                ? "admin:adminSafeSpaces.toast.marked"
                : "admin:adminSafeSpaces.toast.unmarked",
              { name: candidate.name },
            ),
            "success",
          );
        },
        // The queue's tally can be a few minutes stale, so the server is still
        // the authority on the bar. Branch on the typed `code` and send the
        // moderator to the editor, where the exception can be written.
        onError: (error) => {
          if (!classifyVisitBarRefusal(error)) return;
          showToast(
            t("admin:adminSafeSpaces.toast.visitBarRefused", {
              name: candidate.name,
            }),
            "error",
          );
          onEdit(candidate);
        },
      },
    );
  }

  return (
    <div className={styles.row}>
      <div className={styles.rowMain}>
        <div className={styles.rowTop}>
          <span className={styles.rowName}>{candidate.name}</span>
          <AdminChip tone={STATUS_TONE[candidate.safeSpaceStatus]} dot>
            {t(`admin:adminSafeSpaces.status.${candidate.safeSpaceStatus}`)}
          </AdminChip>
          {isVerifiedBelowBar && (
            <AdminChip
              tone="amber"
              title={t("admin:adminSafeSpaces.underBar.chipTitle", {
                required: candidate.visits.requiredVisitCount,
              })}
            >
              {t("admin:adminSafeSpaces.underBar.chip", {
                count: candidate.visits.independentVisitCount,
                required: candidate.visits.requiredVisitCount,
              })}
            </AdminChip>
          )}
        </div>
        <div className={styles.rowMeta}>{candidate.hood}</div>
      </div>
      <div className={styles.rowActions}>
        <Button
          variant={isVerified ? "ghost" : "jade"}
          size="md"
          onClick={toggleStatus}
          disabled={setSafeSpace.isPending}
        >
          {isVerified
            ? t("admin:adminSafeSpaces.unmarkCta")
            : isMarkBelowBar
              ? t("admin:adminSafeSpaces.markWithReasonCta")
              : t("admin:adminSafeSpaces.markCta")}
        </Button>
        <Button
          variant="ghost"
          size="md"
          to={businessPath(candidate.slug)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("admin:adminSafeSpaces.viewCta")}
        </Button>
        <Button variant="ghost" size="md" onClick={() => onEdit(candidate)}>
          {t("admin:adminSafeSpaces.editCta")}
        </Button>
      </div>
    </div>
  );
}
