import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { approvalReasonLabelKey } from "../auth/api/joinRequestApprovalReason";
import { declineReasonLabelKey } from "../auth/api/joinRequestDeclineReason";
import type { JoinRequestView } from "./api/useJoinRequests";
import { joinRequestReviewer } from "./joinRequestReviewer";
import { AdminAvatar, AdminChip } from "./ui";
import styles from "./JoinRequestSample.module.css";

/**
 * One past decision in the quality sample. READ-ONLY by construction: no
 * decision handler is passed in and none exists on this surface, so nothing
 * here can be re-decided. The point is to read how the call was made and
 * compare it with your own. An "Other" approval shows the note the reviewer
 * wrote under its reason, since "Other" alone says nothing about the call.
 *
 * "Decided by" names the reviewer, because reading a run of decisions for a
 * consistent bar means knowing which of them one person read. It is an
 * attribution and nothing more: nothing here counts, ranks or scores anyone,
 * and the only thing the name answers is "whose reading of the guidelines am I
 * looking at?".
 *
 * Your own calls read as "You" rather than your name. Below that, the name the
 * server resolved; then the id-derived reference for a row the server sent
 * without one; then "not recorded" when the request carries no reviewer at all,
 * which is also where a reviewer who has since erased their account lands (the
 * id is NULLed with them, so no name can come back).
 */
export function JoinRequestSampleCard({
  item,
  currentUserId,
}: {
  item: JoinRequestView;
  /** The signed-in reviewer, so their own past calls read as "You". Null while
   *  the session is still loading. */
  currentUserId: string | null;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const isApproved = item.status === "approved";
  const decidedAt = item.reviewedAt ? new Date(item.reviewedAt) : null;
  const decidedOn =
    decidedAt && !Number.isNaN(decidedAt.getTime())
      ? format.date(decidedAt, {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : t("admin:members.verify.decided.decidedUnknown");

  const reviewer = joinRequestReviewer(item, currentUserId);
  const reviewerLine =
    reviewer.kind === "self"
      ? t("admin:members.sample.reviewerYou")
      : reviewer.kind === "named"
        ? reviewer.name
        : reviewer.kind === "unnamed"
          ? t("admin:members.sample.reviewerOther", {
              reference: reviewer.reference,
            })
          : t("admin:members.sample.reviewerUnknown");
  // Both decisions carry a reason now. A null one is a legacy approval from
  // before reasons were asked for, or a decline that never recorded one.
  const reasonKey = isApproved
    ? approvalReasonLabelKey(item.approvalReason)
    : item.declineReason
      ? declineReasonLabelKey(item.declineReason)
      : null;

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <AdminAvatar initials={item.initials} tone={item.tone} size="md" />
        <span className={styles.name}>{item.name}</span>
        <AdminChip tone={isApproved ? "jade" : "ghost"} dot>
          {t(
            `admin:members.verify.status.${isApproved ? "approved" : "declined"}`,
          )}
        </AdminChip>
      </div>

      <p className={styles.message}>&ldquo;{item.message}&rdquo;</p>

      <dl className={styles.facts}>
        <div className={styles.fact}>
          <dt className={styles.factLabel}>
            {t("admin:members.sample.decidedOnLabel")}
          </dt>
          <dd className={styles.factValue}>{decidedOn}</dd>
        </div>
        <div className={styles.fact}>
          <dt className={styles.factLabel}>
            {t("admin:members.sample.reviewerLabel")}
          </dt>
          <dd className={styles.factValue}>{reviewerLine}</dd>
        </div>
        <div className={styles.fact}>
          <dt className={styles.factLabel}>
            {t("admin:members.sample.appliedLabel")}
          </dt>
          <dd className={styles.factValue}>{item.appliedLine}</dd>
        </div>
        <div className={styles.fact}>
          <dt className={styles.factLabel}>
            {t("admin:members.sample.reasonLabel")}
          </dt>
          <dd className={styles.factValue}>
            {t(reasonKey ?? "admin:members.sample.noReason")}
            {isApproved && item.approvalNote && (
              <span className={styles.factNote}>
                {t("admin:members.verify.decided.approvalNoteLine", {
                  note: item.approvalNote,
                })}
              </span>
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}
