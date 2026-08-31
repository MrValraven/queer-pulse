import { useState } from "react";
import { FiAlertTriangle, FiKey, FiRotateCcw } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { AdminChip, AdminModal } from "./ui";
import {
  useApplyMemberRelink,
  useDismissMemberRelink,
  useMemberAccountRecovery,
  useReactivateMember,
} from "./api/useAdminIdentity";
import { AdminRecoveryReasonField } from "./AdminRecoveryReasonField";
import type { RelinkCandidateDTO } from "./api/adminIdentity.api";
import type { AdminMember } from "./adminMembers.data";
import styles from "./AdminMembersPage.module.css";

const firstNameOf = (fullName: string) => fullName.split(" ")[0];

/**
 * The drawer's account-recovery section: re-link a member's Google sign-in
 * identity, and reactivate a member stranded in `deactivated`.
 *
 * Both levers repair a state the platform entered on purpose, and until they
 * existed the only remedy for either was a hand-written database edit. They
 * share one read (`useMemberAccountRecovery`) because an operator opening a
 * locked-out member's drawer does not yet know which of the two situations
 * applies.
 *
 * The section renders NOTHING when there is nothing to do: no waiting identity
 * and an account that is not deactivated. An admin looking at a healthy member
 * should not be shown two dormant account-takeover controls.
 */
export function AdminMemberAccountRecovery({
  member,
}: {
  member: AdminMember;
}) {
  const { t } = useTranslation();
  const { data: recovery, isError } = useMemberAccountRecovery(member.id);

  if (isError) {
    // Never collapse a failed read into "nothing to recover" — that reads as
    // "this member is fine", which is the one wrong answer here.
    return (
      <section className={styles.dSection}>
        <h3 className={styles.dHeading}>{t("admin:recovery.sectionTitle")}</h3>
        <p className={styles.dHint}>{t("admin:recovery.loadError")}</p>
      </section>
    );
  }
  if (!recovery) return null;

  const hasCandidates = recovery.relink.candidates.length > 0;
  if (!hasCandidates && !recovery.reactivation.isApplicable) return null;

  return (
    <section className={styles.dSection}>
      <h3 className={styles.dHeading}>{t("admin:recovery.sectionTitle")}</h3>
      <p className={styles.dHint}>{t("admin:recovery.sectionHint")}</p>
      {recovery.reactivation.isApplicable && (
        <ReactivateBlock
          member={member}
          isAvailable={recovery.reactivation.isAvailable}
          blockedReason={recovery.reactivation.blockedReason}
        />
      )}
      {hasCandidates && (
        <RelinkBlock
          member={member}
          isAvailable={recovery.relink.isAvailable}
          blockedReason={recovery.relink.blockedReason}
          candidates={recovery.relink.candidates}
        />
      )}
    </section>
  );
}

/**
 * "This member is deactivated with no record of asking to be." One button, one
 * confirm, one required reason.
 *
 * When the backend refuses (they paused their own account, they asked to be
 * erased, they are suspended) the refusal is shown in place of the button, in
 * the server's own words. Those four refusals are the safety of the lever, and
 * restating them in the client would be a second copy free to drift.
 */
function ReactivateBlock({
  member,
  isAvailable,
  blockedReason,
}: {
  member: AdminMember;
  isAvailable: boolean;
  blockedReason: string | null;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const reactivate = useReactivateMember();
  const [isConfirming, setIsConfirming] = useState(false);
  const [reason, setReason] = useState("");

  const apply = () => {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      showToast(t("admin:recovery.missingReasonToast"), "error");
      return;
    }
    reactivate.mutate(
      { memberId: member.id, slug: member.slug, reason: trimmedReason },
      {
        onSuccess: () => {
          setIsConfirming(false);
          setReason("");
          showToast(
            t("admin:recovery.reactivate.doneToast", {
              name: firstNameOf(member.name),
            }),
            "success",
          );
        },
      },
    );
  };

  return (
    <div>
      <span className={styles.subGroupLabel}>
        <FiRotateCcw aria-hidden="true" />{" "}
        {t("admin:recovery.reactivate.label")}
      </span>
      <p className={styles.dHint}>{t("admin:recovery.reactivate.body")}</p>
      {isAvailable ? (
        <div className={styles.roleActions}>
          <Button
            variant="jade"
            size="md"
            disabled={reactivate.isPending}
            onClick={() => setIsConfirming(true)}
          >
            {t("admin:recovery.reactivate.cta")}
          </Button>
        </div>
      ) : (
        <p className={styles.dHint}>
          {blockedReason ?? t("admin:recovery.reactivate.blockedFallback")}
        </p>
      )}

      {isConfirming && (
        <AdminModal
          title={t("admin:recovery.reactivate.confirmTitle", {
            name: member.name,
          })}
          onClose={() => setIsConfirming(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsConfirming(false)}>
                {t("admin:common.cancel")}
              </Button>
              <Button
                variant="jade"
                disabled={reactivate.isPending}
                onClick={apply}
              >
                {t("admin:recovery.reactivate.confirmCta")}
              </Button>
            </>
          }
        >
          <p className={styles.roleConfirmBody}>
            {t("admin:recovery.reactivate.confirmBody", { name: member.name })}
          </p>
          <AdminRecoveryReasonField
            fieldId="reactivate-member-reason"
            label={t("admin:recovery.reasonLabel")}
            placeholder={t("admin:recovery.reactivate.reasonPlaceholder")}
            value={reason}
            onChange={setReason}
          />
        </AdminModal>
      )}
    </div>
  );
}

/**
 * The sign-in-identity lever. Lists every Google identity that presented this
 * member's verified address, and lets an admin accept or refuse one.
 *
 * The list is the evidence. A genuine re-created account looks like one subject
 * trying a handful of times in a short window. Several distinct subjects on one
 * address looks like something else, and should be dismissed rather than
 * applied, which is why every candidate carries its own attempt count and dates.
 */
function RelinkBlock({
  member,
  isAvailable,
  blockedReason,
  candidates,
}: {
  member: AdminMember;
  isAvailable: boolean;
  blockedReason: string | null;
  candidates: RelinkCandidateDTO[];
}) {
  const { t } = useTranslation();
  const [decision, setDecision] = useState<{
    candidate: RelinkCandidateDTO;
    kind: "relink" | "dismiss";
  } | null>(null);

  return (
    <div>
      <span className={styles.subGroupLabel}>
        <FiKey aria-hidden="true" /> {t("admin:recovery.relink.label")}
      </span>
      <p className={styles.dHint}>{t("admin:recovery.relink.body")}</p>
      {!isAvailable && (
        <p className={styles.dHint}>
          <FiAlertTriangle aria-hidden="true" />{" "}
          {blockedReason ?? t("admin:recovery.relink.blockedFallback")}
        </p>
      )}
      {candidates.map((candidate) => (
        <RelinkCandidateRow
          key={candidate.id}
          candidate={candidate}
          isActionable={isAvailable && candidate.status === "pending"}
          onRelink={() => setDecision({ candidate, kind: "relink" })}
          onDismiss={() => setDecision({ candidate, kind: "dismiss" })}
        />
      ))}

      {decision && (
        <RelinkDecisionModal
          member={member}
          candidate={decision.candidate}
          kind={decision.kind}
          onClose={() => setDecision(null)}
        />
      )}
    </div>
  );
}

/** One candidate: what it is, how hard it has tried, and the two decisions. */
function RelinkCandidateRow({
  candidate,
  isActionable,
  onRelink,
  onDismiss,
}: {
  candidate: RelinkCandidateDTO;
  isActionable: boolean;
  onRelink: () => void;
  onDismiss: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <div className={styles.roleCurrentRow}>
      <span className={styles.roleCurrentLabel}>
        {t("admin:recovery.relink.candidateLabel", {
          tail: candidate.googleIdTail,
        })}
      </span>
      <AdminChip tone={candidate.status === "pending" ? "amber" : "ghost"}>
        {t(`admin:recovery.relink.status.${candidate.status}`)}
      </AdminChip>
      <span className={styles.dHint}>
        {t("admin:recovery.relink.candidateMeta", {
          attempts: candidate.attemptCount,
          first: fmt.date(new Date(candidate.firstSeenAt)),
          last: fmt.date(new Date(candidate.lastSeenAt)),
        })}
      </span>
      {isActionable && (
        <div className={styles.roleActions}>
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            {t("admin:recovery.relink.dismissCta")}
          </Button>
          <Button variant="danger" size="sm" onClick={onRelink}>
            {t("admin:recovery.relink.applyCta")}
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * The confirm step for both decisions, sharing one modal because they are the
 * same act with opposite answers.
 *
 * The re-link copy is deliberately blunt about the two consequences an operator
 * has to have understood before pressing it: whoever holds that Google account
 * signs in as this member from now on, and every session the member currently
 * has ends immediately.
 */
function RelinkDecisionModal({
  member,
  candidate,
  kind,
  onClose,
}: {
  member: AdminMember;
  candidate: RelinkCandidateDTO;
  kind: "relink" | "dismiss";
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const applyRelink = useApplyMemberRelink();
  const dismissRelink = useDismissMemberRelink();
  const [reason, setReason] = useState("");
  const mutation = kind === "relink" ? applyRelink : dismissRelink;

  const submit = () => {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      showToast(t("admin:recovery.missingReasonToast"), "error");
      return;
    }
    mutation.mutate(
      {
        memberId: member.id,
        candidateId: candidate.id,
        reason: trimmedReason,
      },
      {
        onSuccess: () => {
          onClose();
          showToast(
            t(`admin:recovery.relink.${kind}DoneToast`, {
              name: firstNameOf(member.name),
            }),
            "success",
          );
        },
      },
    );
  };

  return (
    <AdminModal
      title={t(`admin:recovery.relink.${kind}ConfirmTitle`, {
        name: member.name,
      })}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("admin:common.cancel")}
          </Button>
          <Button
            variant={kind === "relink" ? "danger" : "primary"}
            disabled={mutation.isPending}
            onClick={submit}
          >
            {t(`admin:recovery.relink.${kind}ConfirmCta`)}
          </Button>
        </>
      }
    >
      <p className={styles.roleConfirmBody}>
        {t(`admin:recovery.relink.${kind}ConfirmBody`, {
          name: member.name,
          tail: candidate.googleIdTail,
        })}
      </p>
      <AdminRecoveryReasonField
        fieldId="relink-decision-reason"
        label={t("admin:recovery.reasonLabel")}
        placeholder={t(`admin:recovery.relink.${kind}ReasonPlaceholder`)}
        value={reason}
        onChange={setReason}
      />
    </AdminModal>
  );
}
