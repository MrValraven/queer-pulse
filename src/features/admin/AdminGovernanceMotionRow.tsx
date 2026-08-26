import { useState } from "react";
import { FiCheck, FiSlash, FiUsers } from "react-icons/fi";
import { Button, ConfirmDialog } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { AdminGovernanceMotionApproveModal } from "./AdminGovernanceMotionApproveModal";
import { useAdminGovernanceMotionReject } from "../governance/api/useGovernanceProposals";
import type { GovernanceProposalDTO } from "../governance/api/governanceProposals.api";
import styles from "./AdminGovernancePage.module.css";

const REJECT_NOTE_MAX_LENGTH = 2000;

/**
 * One motion awaiting review: what was proposed, who raised it, how many
 * members co-signed, and the two decisions available. Rejecting requires a
 * written reason, because that reason is published on the public governance
 * page next to the motion it refused.
 */
export function AdminGovernanceMotionRow({
  motion,
}: {
  motion: GovernanceProposalDTO;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const reject = useAdminGovernanceMotionReject();
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectNote, setRejectNote] = useState("");

  const proposerName = motion.proposedByMember
    ? `${motion.proposedByMember.firstName} ${motion.proposedByMember.lastName}`.trim()
    : null;

  const submitRejection = () => {
    const trimmedNote = rejectNote.trim();
    if (trimmedNote.length === 0) return;
    reject.mutate(
      { motionId: motion.id, body: { note: trimmedNote } },
      {
        onSuccess: () => {
          setIsRejecting(false);
          setRejectNote("");
          showToast(t("admin:governance.motions.reject.saved"), "success");
        },
        onError: () =>
          showToast(t("admin:governance.motions.reject.error"), "error"),
      },
    );
  };

  return (
    <div className={[styles.card, styles.proposalAdminCard].join(" ")}>
      <div className={styles.proposalAdminHead}>
        <h3 className={styles.cardTitle}>{motion.title}</h3>
        <span className={styles.motionCosignCount}>
          <FiUsers aria-hidden />{" "}
          {t("admin:governance.motions.list.cosignatures", {
            count: motion.cosignatureCount,
          })}
        </span>
      </div>
      {proposerName && (
        <p className={styles.cardSub}>
          {t("admin:governance.motions.list.raisedBy", { name: proposerName })}
        </p>
      )}
      <p className={styles.cardSub}>{motion.description}</p>
      <p className={styles.cardSub}>
        {t("admin:governance.motions.list.filedOn", {
          date: fmt.date(new Date(motion.opensAt)),
        })}
      </p>
      <div className={styles.motionActions}>
        <Button
          variant="primary"
          size="sm"
          type="button"
          onClick={() => setIsApproving(true)}
        >
          <FiCheck aria-hidden />
          {t("admin:governance.motions.approveCta")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => setIsRejecting(true)}
        >
          <FiSlash aria-hidden />
          {t("admin:governance.motions.rejectCta")}
        </Button>
      </div>

      {isApproving && (
        <AdminGovernanceMotionApproveModal
          motion={motion}
          onClose={() => setIsApproving(false)}
        />
      )}

      {isRejecting && (
        <ConfirmDialog
          open
          loading={reject.isPending}
          tone="destructive"
          title={t("admin:governance.motions.reject.title")}
          description={t("admin:governance.motions.reject.body")}
          confirmLabel={t("admin:governance.motions.reject.confirmCta")}
          reason={{
            value: rejectNote,
            onChange: setRejectNote,
            required: true,
            maxLength: REJECT_NOTE_MAX_LENGTH,
            label: t("admin:governance.motions.reject.reasonLabel"),
            placeholder: t("admin:governance.motions.reject.reasonPlaceholder"),
          }}
          onClose={() => setIsRejecting(false)}
          onConfirm={submitRejection}
        />
      )}
    </div>
  );
}
