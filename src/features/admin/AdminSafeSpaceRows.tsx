import { Button, FadeIn } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { businessPath } from "../../app/routeMap";
import { AdminChip, type AdminTone } from "./ui";
import { useSetSafeSpace } from "./api/useSetSafeSpace";
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

  function toggleStatus() {
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
